from pydantic import BaseModel
from typing import Optional

# structure for API request from frontend
class ExecuteNodeRequest(BaseModel):
    node_id: str
    prompt: str

class CreateNodeRequest(BaseModel):
    position: dict
    conversation_id: Optional[str] = None

class CreateNodeResponse(BaseModel):
    status: str
    node_id: str
    conversation_id: str
    position: Optional[dict] = None

class CreateEdgeRequest(BaseModel):
    source_id: str
    target_id: str
    conversation_id: Optional[str] = None

class CreateEdgeResponse(BaseModel):
    status: str
    edge_id: str
    source_id: str
    target_id: str

class DeleteEdgeRequest(BaseModel):
    edge_id: str

class DeleteEdgeResponse(BaseModel):
    status: str
    edge_id: str
    message: Optional[str] = None

class DeleteNodeRequest(BaseModel):
    node_id: str

class DeleteNodeResponse(BaseModel):
    status: str
    node_id: str
    message: Optional[str] = None
    edges_deleted_count: Optional[int] = 0

class UpdateNodePositionRequest(BaseModel):
    node_id: str
    position: dict

class UpdateNodePositionResponse(BaseModel):
    status:str
    node_id:str
    position:dict
    mesage: Optional[str] = None
