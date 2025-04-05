from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: EmailStr
    name: str
    role: Optional[str] = "user"
    settings: Optional[Dict[str, Any]] = {}


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    password: Optional[str] = None


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
