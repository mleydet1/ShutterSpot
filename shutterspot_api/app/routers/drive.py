from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database.models import User, DriveConnection, Gallery
from app.schemas.drive import (
    DriveConnectionCreate, 
    DriveConnectionUpdate, 
    DriveConnectionResponse,
    DriveAuthResponse,
    DriveAuthComplete,
    DriveFolderListResponse,
    DriveFolderResponse
)
from app.services.google_drive import GoogleDriveService
from app.auth.auth import get_current_user

router = APIRouter(
    prefix="/api/drive",
    tags=["drive"],
    responses={404: {"description": "Not found"}},
)

drive_service = GoogleDriveService()

@router.post("/auth", response_model=DriveAuthResponse)
def initiate_drive_auth(
    current_user: User = Depends(get_current_user)
):
    """
    Initiate Google Drive authorization flow.
    """
    auth_url = drive_service.initiate_auth_flow()
    return {"auth_url": auth_url}

@router.post("/auth/complete")
def complete_drive_auth(
    auth_data: DriveAuthComplete,
    current_user: User = Depends(get_current_user)
):
    """
    Complete Google Drive authorization with the provided code.
    """
    try:
        drive_service.complete_auth_flow(current_user.id, auth_data.auth_code)
        return {"message": "Google Drive authorization completed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to complete authorization: {str(e)}"
        )

@router.get("/folders", response_model=DriveFolderListResponse)
def list_drive_folders(
    current_user: User = Depends(get_current_user)
):
    """
    List all folders in the user's Google Drive.
    """
    try:
        folders = drive_service.list_folders(current_user.id)
        return {
            "folders": [
                DriveFolderResponse(
                    id=folder["id"],
                    name=folder["name"],
                    created_time=folder.get("createdTime"),
                    modified_time=folder.get("modifiedTime")
                ) for folder in folders
            ]
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list folders: {str(e)}"
        )

@router.post("/connections", response_model=DriveConnectionResponse)
def create_drive_connection(
    connection: DriveConnectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Connect a Google Drive folder to a gallery.
    """
    # Check if gallery exists and belongs to the user
    gallery = db.query(Gallery).filter(Gallery.id == connection.gallery_id).first()
    if not gallery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery not found"
        )
    
    # Create the connection
    try:
        drive_connection = drive_service.connect_drive_folder(
            db=db,
            user_id=current_user.id,
            folder_id=connection.drive_folder_id,
            gallery_id=connection.gallery_id,
            auto_sync=connection.auto_sync
        )
        return drive_connection
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create connection: {str(e)}"
        )

@router.get("/connections", response_model=List[DriveConnectionResponse])
def list_drive_connections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all Google Drive connections for the current user.
    """
    connections = db.query(DriveConnection).filter(
        DriveConnection.user_id == current_user.id
    ).all()
    return connections

@router.get("/connections/{connection_id}", response_model=DriveConnectionResponse)
def get_drive_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific Google Drive connection.
    """
    connection = db.query(DriveConnection).filter(
        DriveConnection.id == connection_id,
        DriveConnection.user_id == current_user.id
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    return connection

@router.put("/connections/{connection_id}", response_model=DriveConnectionResponse)
def update_drive_connection(
    connection_id: int,
    connection_update: DriveConnectionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a Google Drive connection.
    """
    connection = db.query(DriveConnection).filter(
        DriveConnection.id == connection_id,
        DriveConnection.user_id == current_user.id
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    # Update fields if provided
    update_data = connection_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(connection, key, value)
    
    db.commit()
    db.refresh(connection)
    return connection

@router.delete("/connections/{connection_id}")
def delete_drive_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a Google Drive connection.
    """
    connection = db.query(DriveConnection).filter(
        DriveConnection.id == connection_id,
        DriveConnection.user_id == current_user.id
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    db.delete(connection)
    db.commit()
    return {"message": "Connection deleted successfully"}

@router.post("/connections/{connection_id}/sync")
def sync_drive_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually trigger synchronization of a Google Drive folder.
    """
    connection = db.query(DriveConnection).filter(
        DriveConnection.id == connection_id,
        DriveConnection.user_id == current_user.id
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    try:
        photos = drive_service.sync_drive_folder(db, connection.id)
        return {
            "message": f"Synchronized {len(photos)} photos successfully",
            "photos_count": len(photos)
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync folder: {str(e)}"
        )
