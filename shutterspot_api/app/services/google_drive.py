"""
Google Drive integration service for ShutterSpot.
This module handles authentication, file listing, and thumbnail generation
for Google Drive folders.
"""
import os
import io
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from PIL import Image
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.database.models import DriveConnection, Gallery, Photo
from app.config import settings

# Define the scopes needed for Google Drive access
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

class GoogleDriveService:
    """Service for interacting with Google Drive API."""
    
    def __init__(self):
        """Initialize the Google Drive service."""
        self.credentials_path = settings.GOOGLE_CREDENTIALS_PATH
        self.token_path = settings.GOOGLE_TOKEN_PATH
        
    def get_credentials(self, user_id: int) -> Credentials:
        """
        Get or refresh Google Drive credentials for a specific user.
        
        Args:
            user_id: The ID of the user to get credentials for
            
        Returns:
            Credentials object for Google Drive API
        """
        creds = None
        token_file = f"{self.token_path}/token_{user_id}.json"
        
        # Load existing token if it exists
        if os.path.exists(token_file):
            with open(token_file, 'r') as token:
                creds = Credentials.from_authorized_user_info(json.load(token), SCOPES)
        
        # If credentials don't exist or are invalid, raise an exception
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
                # Save the refreshed credentials
                with open(token_file, 'w') as token:
                    token.write(creds.to_json())
            else:
                raise HTTPException(
                    status_code=401, 
                    detail="Google Drive authorization required"
                )
                
        return creds
    
    def initiate_auth_flow(self) -> str:
        """
        Initiate the OAuth2 authorization flow for Google Drive.
        
        Returns:
            Authorization URL for the user to visit
        """
        if not os.path.exists(self.credentials_path):
            raise HTTPException(
                status_code=500,
                detail="Google Drive credentials file not found"
            )
            
        flow = InstalledAppFlow.from_client_secrets_file(
            self.credentials_path, 
            SCOPES,
            redirect_uri="urn:ietf:wg:oauth:2.0:oob"  # For desktop/CLI applications
        )
        
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        return auth_url
    
    def complete_auth_flow(self, user_id: int, auth_code: str) -> None:
        """
        Complete the OAuth2 authorization flow with the provided code.
        
        Args:
            user_id: The ID of the user completing authorization
            auth_code: The authorization code from Google
        """
        flow = InstalledAppFlow.from_client_secrets_file(
            self.credentials_path, 
            SCOPES,
            redirect_uri="urn:ietf:wg:oauth:2.0:oob"
        )
        
        # Exchange auth code for access token
        flow.fetch_token(code=auth_code)
        creds = flow.credentials
        
        # Save the credentials
        token_dir = os.path.dirname(self.token_path)
        if not os.path.exists(token_dir):
            os.makedirs(token_dir)
            
        token_file = f"{self.token_path}/token_{user_id}.json"
        with open(token_file, 'w') as token:
            token.write(creds.to_json())
    
    def list_folders(self, user_id: int) -> List[Dict[str, Any]]:
        """
        List all folders in the user's Google Drive.
        
        Args:
            user_id: The ID of the user
            
        Returns:
            List of folder metadata
        """
        creds = self.get_credentials(user_id)
        service = build('drive', 'v3', credentials=creds)
        
        # Search for folders
        query = "mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name, createdTime, modifiedTime)'
        ).execute()
        
        folders = results.get('files', [])
        return folders
    
    def list_images_in_folder(self, user_id: int, folder_id: str) -> List[Dict[str, Any]]:
        """
        List all image files in a specific Google Drive folder.
        
        Args:
            user_id: The ID of the user
            folder_id: The ID of the Google Drive folder
            
        Returns:
            List of image file metadata
        """
        creds = self.get_credentials(user_id)
        service = build('drive', 'v3', credentials=creds)
        
        # Search for image files in the specified folder
        query = f"'{folder_id}' in parents and mimeType contains 'image/' and trashed=false"
        results = service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name, mimeType, createdTime, modifiedTime, webContentLink, thumbnailLink)'
        ).execute()
        
        images = results.get('files', [])
        return images
    
    def generate_thumbnail(self, user_id: int, file_id: str, size: tuple = (300, 300)) -> bytes:
        """
        Generate a thumbnail for a Google Drive image file.
        
        Args:
            user_id: The ID of the user
            file_id: The ID of the Google Drive file
            size: The desired thumbnail size (width, height)
            
        Returns:
            Thumbnail image data as bytes
        """
        creds = self.get_credentials(user_id)
        service = build('drive', 'v3', credentials=creds)
        
        # Download the file
        request = service.files().get_media(fileId=file_id)
        file = io.BytesIO()
        downloader = MediaIoBaseDownload(file, request)
        
        done = False
        while not done:
            status, done = downloader.next_chunk()
            
        # Reset file pointer to the beginning
        file.seek(0)
        
        # Create thumbnail using PIL
        image = Image.open(file)
        image.thumbnail(size)
        
        # Save thumbnail to bytes
        thumbnail_bytes = io.BytesIO()
        image.save(thumbnail_bytes, format=image.format or 'JPEG')
        thumbnail_bytes.seek(0)
        
        return thumbnail_bytes.getvalue()
    
    def connect_drive_folder(
        self, 
        db: Session, 
        user_id: int, 
        folder_id: str, 
        gallery_id: int, 
        auto_sync: bool = True
    ) -> DriveConnection:
        """
        Connect a Google Drive folder to a gallery.
        
        Args:
            db: Database session
            user_id: The ID of the user
            folder_id: The ID of the Google Drive folder
            gallery_id: The ID of the gallery to connect to
            auto_sync: Whether to automatically sync the folder
            
        Returns:
            The created DriveConnection object
        """
        # Verify the folder exists
        creds = self.get_credentials(user_id)
        service = build('drive', 'v3', credentials=creds)
        
        try:
            folder = service.files().get(fileId=folder_id).execute()
            folder_name = folder.get('name', 'Unnamed Folder')
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Google Drive folder not found: {str(e)}"
            )
        
        # Create the connection
        connection = DriveConnection(
            user_id=user_id,
            gallery_id=gallery_id,
            drive_folder_id=folder_id,
            drive_folder_name=folder_name,
            auto_sync=auto_sync,
            last_synced=None
        )
        
        db.add(connection)
        db.commit()
        db.refresh(connection)
        
        # If auto-sync is enabled, sync the folder immediately
        if auto_sync:
            self.sync_drive_folder(db, connection.id)
            
        return connection
    
    def sync_drive_folder(self, db: Session, connection_id: int) -> List[Photo]:
        """
        Sync images from a connected Google Drive folder to a gallery.
        
        Args:
            db: Database session
            connection_id: The ID of the DriveConnection
            
        Returns:
            List of created or updated Photo objects
        """
        # Get the connection
        connection = db.query(DriveConnection).filter(DriveConnection.id == connection_id).first()
        if not connection:
            raise HTTPException(
                status_code=404,
                detail="Drive connection not found"
            )
            
        # Get the gallery
        gallery = db.query(Gallery).filter(Gallery.id == connection.gallery_id).first()
        if not gallery:
            raise HTTPException(
                status_code=404,
                detail="Gallery not found"
            )
            
        # List images in the folder
        images = self.list_images_in_folder(connection.user_id, connection.drive_folder_id)
        
        # Process each image
        created_photos = []
        for image in images:
            # Check if the photo already exists
            existing_photo = db.query(Photo).filter(
                Photo.gallery_id == gallery.id,
                Photo.drive_file_id == image['id']
            ).first()
            
            if existing_photo:
                # Update existing photo if needed
                if existing_photo.drive_modified != image['modifiedTime']:
                    existing_photo.drive_modified = image['modifiedTime']
                    existing_photo.updated_at = datetime.utcnow()
                    db.commit()
                    db.refresh(existing_photo)
                    created_photos.append(existing_photo)
            else:
                # Generate thumbnail
                thumbnail_data = self.generate_thumbnail(connection.user_id, image['id'])
                
                # Create new photo
                new_photo = Photo(
                    gallery_id=gallery.id,
                    filename=image['name'],
                    drive_file_id=image['id'],
                    drive_modified=image['modifiedTime'],
                    thumbnail=thumbnail_data,
                    url=image.get('webContentLink', ''),
                    favorites_count=0,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                db.add(new_photo)
                db.commit()
                db.refresh(new_photo)
                created_photos.append(new_photo)
                
        # Update the last synced time
        connection.last_synced = datetime.utcnow()
        db.commit()
        
        return created_photos
    
    def schedule_sync_for_all(self, db: Session) -> int:
        """
        Schedule sync for all auto-sync enabled connections.
        
        Args:
            db: Database session
            
        Returns:
            Number of connections scheduled for sync
        """
        # Find connections that need syncing
        one_day_ago = datetime.utcnow() - timedelta(days=1)
        connections = db.query(DriveConnection).filter(
            DriveConnection.auto_sync == True,
            (DriveConnection.last_synced == None) | (DriveConnection.last_synced <= one_day_ago)
        ).all()
        
        # Sync each connection
        for connection in connections:
            try:
                self.sync_drive_folder(db, connection.id)
            except Exception as e:
                # Log the error but continue with other connections
                print(f"Error syncing connection {connection.id}: {str(e)}")
                
        return len(connections)
