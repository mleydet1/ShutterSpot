from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: date
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Todo"
    assigned_to: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(TaskBase):
    title: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[int] = None


class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
