from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class GalleryImageBase(BaseModel):
    url: str
    caption: Optional[str] = None


class GalleryBase(BaseModel):
    client_id: int
    shoot_id: Optional[int] = None
    title: str
    description: str
    password: str
    expiry_date: Optional[date] = None
    images: List[Dict[str, Any]]
    status: Optional[str] = "Active"


class GalleryCreate(GalleryBase):
    pass


class GalleryUpdate(GalleryBase):
    client_id: Optional[int] = None
    shoot_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    password: Optional[str] = None
    images: Optional[List[Dict[str, Any]]] = None
    status: Optional[str] = None


class Gallery(GalleryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
