from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..database.database import get_db
from ..database.models import Shoot, Client
from ..schemas.shoot import Shoot as ShootSchema, ShootCreate, ShootUpdate

router = APIRouter(
    prefix="/api/shoots",
    tags=["shoots"],
)


@router.get("/", response_model=List[ShootSchema])
def get_shoots(db: Session = Depends(get_db)):
    """Get all shoots"""
    shoots = db.query(Shoot).all()
    return shoots


@router.get("/upcoming", response_model=List[ShootSchema])
def get_upcoming_shoots(limit: Optional[int] = Query(None), db: Session = Depends(get_db)):
    """Get upcoming shoots with optional limit"""
    query = db.query(Shoot).filter(Shoot.date >= date.today()).order_by(Shoot.date)
    
    if limit:
        query = query.limit(limit)
    
    return query.all()


@router.get("/{shoot_id}", response_model=ShootSchema)
def get_shoot(shoot_id: int, db: Session = Depends(get_db)):
    """Get a specific shoot by ID"""
    shoot = db.query(Shoot).filter(Shoot.id == shoot_id).first()
    if shoot is None:
        raise HTTPException(status_code=404, detail="Shoot not found")
    return shoot


@router.post("/", response_model=ShootSchema, status_code=status.HTTP_201_CREATED)
def create_shoot(shoot: ShootCreate, db: Session = Depends(get_db)):
    """Create a new shoot"""
    # Verify client exists
    client = db.query(Client).filter(Client.id == shoot.client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db_shoot = Shoot(
        title=shoot.title,
        client_id=shoot.client_id,
        date=shoot.date,
        start_time=shoot.start_time,
        end_time=shoot.end_time,
        location=shoot.location,
        type=shoot.type,
        package=shoot.package,
        status=shoot.status,
        notes=shoot.notes,
    )
    db.add(db_shoot)
    db.commit()
    db.refresh(db_shoot)
    return db_shoot


@router.put("/{shoot_id}", response_model=ShootSchema)
def update_shoot(shoot_id: int, shoot: ShootUpdate, db: Session = Depends(get_db)):
    """Update an existing shoot"""
    db_shoot = db.query(Shoot).filter(Shoot.id == shoot_id).first()
    if db_shoot is None:
        raise HTTPException(status_code=404, detail="Shoot not found")
    
    # If client_id is being updated, verify the client exists
    if shoot.client_id is not None and shoot.client_id != db_shoot.client_id:
        client = db.query(Client).filter(Client.id == shoot.client_id).first()
        if client is None:
            raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = shoot.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_shoot, key, value)
    
    db.commit()
    db.refresh(db_shoot)
    return db_shoot


@router.delete("/{shoot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shoot(shoot_id: int, db: Session = Depends(get_db)):
    """Delete a shoot"""
    db_shoot = db.query(Shoot).filter(Shoot.id == shoot_id).first()
    if db_shoot is None:
        raise HTTPException(status_code=404, detail="Shoot not found")
    
    db.delete(db_shoot)
    db.commit()
    return None
