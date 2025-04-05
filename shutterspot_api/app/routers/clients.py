from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database.database import get_db
from ..database.models import Client
from ..schemas.client import Client as ClientSchema, ClientCreate, ClientUpdate

router = APIRouter(
    prefix="/api/clients",
    tags=["clients"],
)


@router.get("/", response_model=List[ClientSchema])
def get_clients(db: Session = Depends(get_db)):
    """Get all clients"""
    clients = db.query(Client).all()
    return clients


@router.get("/{client_id}", response_model=ClientSchema)
def get_client(client_id: int, db: Session = Depends(get_db)):
    """Get a specific client by ID"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.post("/", response_model=ClientSchema, status_code=status.HTTP_201_CREATED)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    """Create a new client"""
    db_client = Client(
        name=client.name,
        email=client.email,
        phone=client.phone,
        address=client.address,
        notes=client.notes,
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


@router.put("/{client_id}", response_model=ClientSchema)
def update_client(client_id: int, client: ClientUpdate, db: Session = Depends(get_db)):
    """Update an existing client"""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = client.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_client, key, value)
    
    db.commit()
    db.refresh(db_client)
    return db_client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """Delete a client"""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.delete(db_client)
    db.commit()
    return None
