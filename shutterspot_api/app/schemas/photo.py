from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import base64

class PhotoBase(BaseModel):
    gallery_id: int
    filename: str

class PhotoCreate(PhotoBase):
    drive_file_id: Optional[str] = None
    drive_modified: Optional[str] = None
    url: Optional[str] = None

class PhotoUpdate(BaseModel):
    gallery_id: Optional[int] = None
    filename: Optional[str] = None
    drive_file_id: Optional[str] = None
    drive_modified: Optional[str] = None
    url: Optional[str] = None

class PhotoResponse(PhotoBase):
    id: int
    drive_file_id: Optional[str] = None
    drive_modified: Optional[str] = None
    url: Optional[str] = None
    favorites_count: int
    created_at: datetime
    updated_at: datetime
    thumbnail_url: Optional[str] = None  # We'll generate this dynamically

    class Config:
        orm_mode = True

    @classmethod
    def from_orm(cls, obj):
        # Create a standard model instance
        instance = super().from_orm(obj)
        
        # Add a thumbnail URL if thumbnail data exists
        if hasattr(obj, 'thumbnail') and obj.thumbnail:
            # For API responses, we'll generate a data URL
            # In a real app, you might want to serve these through a proper endpoint
            mime_type = "image/jpeg"  # Assuming JPEG format
            thumbnail_b64 = base64.b64encode(obj.thumbnail).decode('utf-8')
            instance.thumbnail_url = f"data:{mime_type};base64,{thumbnail_b64}"
            
        return instance

class PhotoFavoriteCreate(BaseModel):
    photo_id: int

class PhotoFavoriteResponse(BaseModel):
    photo_id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class PhotoFavoritesList(BaseModel):
    favorites: List[PhotoFavoriteResponse]
