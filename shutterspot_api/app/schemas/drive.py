from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class DriveConnectionBase(BaseModel):
    gallery_id: int
    drive_folder_id: str
    auto_sync: bool = True

class DriveConnectionCreate(DriveConnectionBase):
    pass

class DriveConnectionUpdate(BaseModel):
    gallery_id: Optional[int] = None
    drive_folder_id: Optional[str] = None
    drive_folder_name: Optional[str] = None
    auto_sync: Optional[bool] = None

class DriveConnectionResponse(DriveConnectionBase):
    id: int
    user_id: int
    drive_folder_name: Optional[str] = None
    last_synced: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class DriveAuthResponse(BaseModel):
    auth_url: str

class DriveAuthComplete(BaseModel):
    auth_code: str

class DriveFolderResponse(BaseModel):
    id: str
    name: str
    created_time: Optional[str] = None
    modified_time: Optional[str] = None

class DriveFolderListResponse(BaseModel):
    folders: List[DriveFolderResponse]
