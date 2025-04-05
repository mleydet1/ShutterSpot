from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class ShootBase(BaseModel):
    title: str
    client_id: int
    date: date
    start_time: str
    end_time: str
    location: str
    type: Optional[str] = None
    package: Optional[str] = None
    status: Optional[str] = "Scheduled"
    notes: Optional[str] = None


class ShootCreate(ShootBase):
    pass


class ShootUpdate(ShootBase):
    title: Optional[str] = None
    client_id: Optional[int] = None
    date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None


class Shoot(ShootBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
