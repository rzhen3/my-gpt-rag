from fastapi import APIRouter
from .models import ExecuteNodeRequest

router = APIRouter()

@router.post("/execute")
async def execute_node(request: ExecuteNodeRequest):
    """
    Receives a node execution request from frontend.
    For now, just log prompt to console
    """

    print(f"\n{'='*50}")
    print(f"Received execution request from node: {request.node_id}")
    print(f"Prompt: {request.prompt}")
    print(f"{'='*50}\n")

    return {
        "status": "success",
        "node_id": request.node_id,
        "message": "Prompt received and logged to console"
    }