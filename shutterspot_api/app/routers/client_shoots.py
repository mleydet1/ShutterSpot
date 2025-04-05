from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database.database import get_db
from ..database.models import Shoot, Client
from ..schemas.shoot import Shoot as ShootSchema

router = APIRouter(
    prefix="/api/clients",
    tags=["client-shoots"],
)


@router.get("/{client_id}/shoots", response_model=List[ShootSchema])
def get_shoots_by_client(client_id: int, db: Session = Depends(get_db)):
    """Get all shoots for a specific client"""
    # Verify client exists
    client = db.query(Client).filter(Client.id == client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    shoots = db.query(Shoot).filter(Shoot.client_id == client_id).all()
    return shoots
