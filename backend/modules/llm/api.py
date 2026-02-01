from fastapi import APIRouter, HTTPException

from .id_mapper import id_mapper
from .models import ExecuteNodeRequest
from .gemini_client import gemini_client


router = APIRouter()
_next_fake_id = 1
@router.post("/execute")
async def execute_node(request: ExecuteNodeRequest):
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

    