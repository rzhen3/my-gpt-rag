from fastapi import APIRouter, HTTPException

from .models import ExecuteNodeRequest
from .gemini_client import gemini_client

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

    # call LLM 
    try:
        response_text = await gemini_client.generate_response(request.prompt)

        print(F"Response: {response_text[:100]}...")
        return {
            "status": "success",
            "node_id": request.node_id,
            "response": response_text
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail = str(e))

    