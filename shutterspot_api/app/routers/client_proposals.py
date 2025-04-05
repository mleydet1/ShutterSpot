from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database.database import get_db
from ..database.models import Proposal, Client
from ..schemas.proposal import Proposal as ProposalSchema

router = APIRouter(
    prefix="/api/clients",
    tags=["client-proposals"],
)


@router.get("/{client_id}/proposals", response_model=List[ProposalSchema])
def get_proposals_by_client(client_id: int, db: Session = Depends(get_db)):
    """Get all proposals for a specific client"""
    # Verify client exists
    client = db.query(Client).filter(Client.id == client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    proposals = db.query(Proposal).filter(Proposal.client_id == client_id).all()
    return proposals
