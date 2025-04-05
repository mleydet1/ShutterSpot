from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class WorkflowBase(BaseModel):
    name: str
    triggers: List[Dict[str, Any]]
    actions: List[Dict[str, Any]]
    is_active: Optional[bool] = True


class WorkflowCreate(WorkflowBase):
    pass


class WorkflowUpdate(WorkflowBase):
    name: Optional[str] = None
    triggers: Optional[List[Dict[str, Any]]] = None
    actions: Optional[List[Dict[str, Any]]] = None
    is_active: Optional[bool] = None


class Workflow(WorkflowBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
