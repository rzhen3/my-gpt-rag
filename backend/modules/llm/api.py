from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from modules.storage.models import Node, Conversation, Edge
from .id_mapper import id_mapper
from .models import DeleteNodeRequest, DeleteNodeResponse, ExecuteNodeRequest, CreateNodeRequest, CreateNodeResponse, \
    CreateEdgeRequest, CreateEdgeResponse, DeleteEdgeRequest, DeleteEdgeResponse \
    
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


    try:
        # resolve existing node id to db id
        print(f"[Execute] Resolving existing node ID: {request.node_id}")
        node_id = id_mapper.resolve_id(request.node_id)

        # if node does not exist, do nothing and error
        node = db.query(Node).filter(Node.id == request.node_id).first()

        if not node:
            raise HTTPException(status_code=404, 
                detail="Node does not exist to be executed")
        
         # TODO: fine-tune and assemble prompt history + scaffolding

        node.prompt_text = request.prompt

        print(f"[Execute] Using database node ID: {node_id}")
        response_text = await gemini_client.generate_response(request.prompt)

        # save response to database
        node.response_text = response_text
        db.commit()

        print(f"[Execute] Saved response to database")

        return {
            "status": "success",
            "node_id": str(node.id),
            "response": response_text
        }
    except ValueError as e:
        db.rollback()
        print(f"[Execute] Error resolving ID: {e}")
        raise HTTPException(status_code=400, detail = str(e))
    
    except Exception as e:
        db.rollback()
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
            # TODO X: upload position data
            # position_x = request.position['x'],
            # position_y = request.position['y'],
            node_type="prompt",
            ancestor_ids = []
        )

        db.add(node)
        db.commit()
        db.refresh(node)

        print(f"[CreateNode] Created node in DB: {node.id}")

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

        # check for duplicating edge
        existing_edge = db.query(Edge).filter(
            Edge.source_node_id == source_db_id,
            Edge.target_node_id == target_db_id
        ).first()

        # avoid network retries creating duplicate edges
        if existing_edge:
            print(f"[CreateEdge] Edge already exists: {existing_edge.id}")

            # return existing request for existing edge
            return CreateEdgeRequest(
                status = "exists",
                edge_id = str(existing_edge.id),
                source_id = str(source_db_id),
                target_id = str(target_db_id),
            )
        
        # create edge and persist
        edge = Edge(
            conversation_id = source_node.conversation_id,
            source_node_id=source_db_id,
            target_node_id=target_db_id,
        )

        db.add(edge)
        db.commit()
        db.refresh(edge)

        print(f"[CreateEdge] Create edge: {edge.id}")

        source_ancestors = source_node.ancestor_ids or []
        target_node.ancestor_ids = list(set(source_ancestors + [source_db_id])) # update ancestor list
        db.commit()

        print(f"[CreateEdge] Updated ancestor_ids for node {target_db_id}: {target_node.ancestor_ids}")

        return CreateEdgeResponse(
            status="success",
            edge_id=str(edge.id),
            source_id=str(source_db_id),
            target_id=str(target_db_id)
        )

    except ValueError as e:
        print(f"[CreateEdge] ID resolution error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        db.rollback()
        print(f"[CreateEdge] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/edges/delete")
async def delete_edges(
    request: DeleteEdgeRequest,
    db: Session = Depends(get_db)
):
    print(f"\n{'='*50}")
    print(f"[DeleteEdge] Request to delete edge: {request.edge_id}")
    print(f"{'='*50}")

    try:
        edge_id = int(request.edge_id)

        # query edge in database
        edge = db.query(Edge).filter(Edge.id == edge_id).first()

        if not edge:
            print(f"[DeleteEdge] Edge not found: {edge.id}")
            raise HTTPException(
                status_code = 404,
                detail=f"Edge with ID {edge_id} not found"
            )
        
        # store source and target IDs before deletion
        source_id = edge.source_node_id
        target_id = edge.target_node_id
        
        db.delete(edge)
        db.commit()

        print(f"[DeleteEdge] Successfully deleted edge {edge_id} \
              (source: {source_id}, target: {target_id})")
        
        return DeleteEdgeResponse(
            status = "success",
            edge_id = str(edge_id),
            message="Edge deleted successfully"
        )
    except ValueError:
        print(f"[DeleteEdge] Invalid edge ID format: {request.edge_id}")
        raise HTTPException(
            status_code = 400,
            detail="Invalid edge ID format"
        )
    except HTTPException:
        raise HTTPException(
            status_code = 404,
            detail=f"Edge with ID {edge_id} not found"
        )
    
    except Exception as e:
        db.rollback()
        print(f"[DeleteEdge] Error: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@router.delete('/nodes/delete')
async def delete_node(
    request: DeleteNodeRequest,
    db: Session = Depends(get_db)
):
    print(f"\n{'='*50}")
    print(f"[DeleteNode] Request to delete node: {request.node_id}")
    print(f"\n{'='*50}")

    try:
        node_id = int(request.node_id)

        # query database to find node
        node = db.query(Node).filter(Node.id == node_id).first()

        if not node:
            print(f"[DeleteNode] Node not found: {node_id}")
            raise HTTPException(
                status_code = 404,
                detail=f"Node with ID {node_id} not found"
            )
        
        # calculate amount of edges affected by deletion
        connected_edges = db.query(Edge).filter(
            (Edge.source_node_id == node_id) | (Edge.target_node_id == node_id)
        ).all()
        edges_count = len(connected_edges)

        if edges_count > 0:
            edge_ids = [edge.id for edge in connected_edges]
            print(f"[DeleteNode] will cascade-delete {edges_count} edges\
                : {edge_ids}")
            
        db.delete(node)
        db.commit()

        print(f"[DeleteNode] Successfully deleted node {node_id} and {edges_count} connected edges")

        return DeleteNodeResponse(
            status="success",
            node_id = str(node.id),
            message=f"Node deleted successfully with cascade-deletion of {edges_count} edges",
            edges_deleted_count = edges_count
        )
    except ValueError:
        print(f"[DeleteNode Invalid ndoe ID format: {request.node_id}]")
        raise HTTPException(
            status_code = 400,
            detail = "Invalid node ID format"
        )
    
    except HTTPException:
        raise HTTPException(
            status_code = 404,
            detail=f"Node with ID {node_id} not found"
        )
    except Exception as e:
        db.rollback()
        print(f"[Deletenode] error: {e}")
        raise HTTPException(
            status_code = 500,
            detail = str(e)
        )