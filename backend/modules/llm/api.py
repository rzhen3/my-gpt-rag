from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from modules.storage.models import Node, Conversation, Edge
from .id_mapper import id_mapper
from .models import ExecuteNodeRequest, CreateNodeRequest, CreateNodeResponse, \
    CreateEdgeRequest, CreateEdgeResponse
from .gemini_client import gemini_client
from core.database import get_db


router = APIRouter()
_next_fake_id = 1
@router.post("/execute")
async def execute_node(
    request: ExecuteNodeRequest,
    db: Session = Depends(get_db)
):
    """
    Receives a node execution request from frontend.
    For now, just log prompt to console
    """

    global _next_fake_id

    print(f"\n{'='*50}")
    print(f"Received execution request from node: {request.node_id}")
    print(f"Prompt: {request.prompt}")
    print(f"{'='*50}\n")

    is_temp_id = request.node_id.startswith("temp_")
    # call LLM 
    try:
        if is_temp_id:
            print(f"[Execute] Creating new node for temp ID: {request.node_id}")

            # TODO: create node in database
            db_node_id = _next_fake_id     # placeholder
            _next_fake_id += 1

            id_mapper.add_mapping(request.node_id, db_node_id)
            node_id = db_node_id
        else:
            # resolve existing node id to db id
            print(f"[Execute] Resolving existing node ID: {request.node_id}")
            node_id = id_mapper.resolve_id(request.node_id)


        print(f"[Execute] Using database node ID: {node_id}")
        response_text = await gemini_client.generate_response(request.prompt)

        # TODO: save response to database

        print(F"Response: {response_text[:100]}...")
        return {
            "status": "success",
            "node_id": str(node_id),
            "response": response_text
        }
    except ValueError as e:
        print(f"[Execute] Error resolving ID: {e}")
        raise HTTPException(status_code=400, detail = str(e))
    
    except Exception as e:
        print(f"[Execute] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/debug/id-mappings")
async def get_id_mappings():
    # debugging endpoint to get id mappings. remove later
    return {
        "mappings": id_mapper._mappings,
        "count": len(id_mapper._mappings)
    }

@router.post("/debug/clear-mappings")
async def clear_id_mappings():
    # debugging endpoint to clear ID mappings. remove later
    id_mapper.clear_mappings()
    return {
        "status": "cleared"
    }

@router.post("/nodes/create")
async def create_node(
    request: CreateNodeRequest,
    db: Session = Depends(get_db)
):
    # creates the node in the database
    print(f"\n{'='*50}")
    print(f"[CreateNode] Position: {request.position}")
    print(f"[CreateNode] Conversation ID: {request.conversation_id}")
    print(f"\n{'='*50}")
    
    try:

        # TODO: for the future, the conversation should already be created
        if request.conversation_id:
            
            # lookup existing conversation in database
            conversation = db.query(Conversation).filter(
                Conversation.id == int(request.conversation_id)
            ).first()

            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation could not be found")

        else:

            # create the new conversation in the database
            conversation = Conversation(
                user_id = 1,
                title="Untitled Conversation"
            )
            db.add(conversation)
            db.flush()

            print(f"[CreateNode] Created new conversation in DB: {conversation.id}")

        # creating default node
        node = Node(
            conversation_id = conversation.id,
            prompt_text = "",
            response_text = "",
            node_type="prompt",
            ancestor_ids = []
        )

        db.add(node)
        db.commit()
        db.refresh(node)

        print(f"[CreateNode] Created ndoe in DB: {node.id}")

        return CreateNodeResponse(
            status = "success",
            node_id = str(node.id),
            conversation_id = str(conversation.id)
        )
    except Exception as e:
        db.rollback()
        print(f"[CreateNode] Error: {e}")
        raise HTTPException(status_code=500, detail = str(e))
    
@router.post('/edges/create')
async def create_edge(
    request: CreateEdgeRequest,
    db: Session = Depends(get_db)
):
    print(f"\n{'='*50}")
    print(f"[CreateEdge] Intended source: {request.source_id}, Intended target: {request.target_id}")
    print(f"\n{'='*50}")

    try:
        # convert temp ID to perma ID if necessary
        source_db_id = id_mapper.resolve_id(request.source_id)
        target_db_id = id_mapper.resolve_id(request.target_id)

        print(f"[CreateEdge] Resolved source: {source_db_id}, Resolved target: {target_db_id}")

        # verify node existence in DB
        source_node = db.query(Node).filter(Node.id == source_db_id).first()
        target_node = db.query(Node).filter(Node.id == target_db_id).first()

        if not source_node or not target_node:
            raise HTTPException(
                status_code = 400,
                detail = f"Node not found: source={source_node is not None}, target={target_node is not None}"
            )

        # check for existing edge
        existing_edge = db.query(Edge).filter(
            Edge.source_node_id == source_db_id,
            Edge.target_node_id == target_db_id
        ).first()

        