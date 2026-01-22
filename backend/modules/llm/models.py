from pydantic import BaseModel

# structure for API request from frontend
class ExecuteNodeRequest(BaseModel):
    node_id: str
    prompt: str

