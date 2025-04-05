from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from sqlalchemy import func

from app.database.database import get_db
from app.database.models import User, Photo, Gallery, photo_favorites
from app.schemas.photo import (
    PhotoCreate,
    PhotoUpdate,
    PhotoResponse,
    PhotoFavoriteCreate,
    PhotoFavoriteResponse,
    PhotoFavoritesList
)
from app.auth.auth import get_current_user, get_optional_user

router = APIRouter(
    prefix="/api/photos",
    tags=["photos"],
    responses={404: {"description": "Not found"}},
)

@router.get("/{photo_id}", response_model=PhotoResponse)
def get_photo(
    photo_id: int,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific photo by ID.
    """
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Check if the user has access to this photo's gallery
    gallery = db.query(Gallery).filter(Gallery.id == photo.gallery_id).first()
    if not gallery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery not found"
        )
    
    # If the user is not authenticated or not the owner, check if they have access
    if not current_user or (current_user.id != gallery.client_id and current_user.role != "admin"):
        # For client galleries, they need to be the client or have the password
        if gallery.status != "Active" or (gallery.password and not current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this photo"
            )
    
    return photo

@router.get("/gallery/{gallery_id}", response_model=List[PhotoResponse])
def list_photos_by_gallery(
    gallery_id: int,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    List all photos in a gallery.
    """
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery not found"
        )
    
    # Check if the user has access to this gallery
    if not current_user or (current_user.id != gallery.client_id and current_user.role != "admin"):
        # For client galleries, they need to be the client or have the password
        if gallery.status != "Active" or (gallery.password and not current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this gallery"
            )
    
    photos = db.query(Photo).filter(Photo.gallery_id == gallery_id).all()
    return photos

@router.post("/{photo_id}/favorite", response_model=PhotoFavoriteResponse)
def favorite_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a photo as a favorite.
    """
    # Check if the photo exists
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Check if the user has access to this photo's gallery
    gallery = db.query(Gallery).filter(Gallery.id == photo.gallery_id).first()
    if not gallery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery not found"
        )
    
    # Check if the user already favorited this photo
    existing_favorite = db.query(photo_favorites).filter(
        photo_favorites.c.photo_id == photo_id,
        photo_favorites.c.user_id == current_user.id
    ).first()
    
    if existing_favorite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Photo already favorited"
        )
    
    # Add the favorite
    stmt = photo_favorites.insert().values(
        photo_id=photo_id,
        user_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.execute(stmt)
    
    # Update the favorites count
    photo.favorites_count += 1
    db.commit()
    
    return {
        "photo_id": photo_id,
        "user_id": current_user.id,
        "created_at": datetime.utcnow()
    }

@router.delete("/{photo_id}/favorite")
def unfavorite_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a photo from favorites.
    """
    # Check if the photo exists
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Check if the favorite exists
    existing_favorite = db.query(photo_favorites).filter(
        photo_favorites.c.photo_id == photo_id,
        photo_favorites.c.user_id == current_user.id
    ).first()
    
    if not existing_favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found"
        )
    
    # Remove the favorite
    stmt = photo_favorites.delete().where(
        photo_favorites.c.photo_id == photo_id,
        photo_favorites.c.user_id == current_user.id
    )
    db.execute(stmt)
    
    # Update the favorites count
    if photo.favorites_count > 0:
        photo.favorites_count -= 1
    db.commit()
    
    return {"message": "Photo removed from favorites"}

@router.get("/{photo_id}/favorites", response_model=PhotoFavoritesList)
def get_photo_favorites(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all users who favorited a photo.
    """
    # Check if the photo exists
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Check if the user has access to this photo's gallery
    gallery = db.query(Gallery).filter(Gallery.id == photo.gallery_id).first()
    if not gallery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery not found"
        )
    
    # Only allow the gallery owner or admin to see favorites
    if current_user.id != gallery.client_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view favorites"
        )
    
    # Get all favorites for this photo
    favorites = db.query(photo_favorites).filter(
        photo_favorites.c.photo_id == photo_id
    ).all()
    
    return {
        "favorites": [
            {
                "photo_id": fav.photo_id,
                "user_id": fav.user_id,
                "created_at": fav.created_at
            } for fav in favorites
        ]
    }

@router.get("/user/favorites", response_model=List[PhotoResponse])
def get_user_favorite_photos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all photos favorited by the current user.
    """
    # Query photos that the user has favorited
    favorited_photos = db.query(Photo).join(
        photo_favorites,
        Photo.id == photo_favorites.c.photo_id
    ).filter(
        photo_favorites.c.user_id == current_user.id
    ).all()
    
    return favorited_photos
