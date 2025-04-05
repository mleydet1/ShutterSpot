from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ActivityBase(BaseModel):
    type: str
    description: str
    user_id: Optional[int] = None
    entity_id: Optional[int] = None
    entity_type: Optional[str] = None


class ActivityCreate(ActivityBase):
    pass


class Activity(ActivityBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
