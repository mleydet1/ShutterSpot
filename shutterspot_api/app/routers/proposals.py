from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database.database import get_db
from ..database.models import Proposal, Client
from ..schemas.proposal import Proposal as ProposalSchema, ProposalCreate, ProposalUpdate

router = APIRouter(
    prefix="/api/proposals",
    tags=["proposals"],
)


@router.get("/", response_model=List[ProposalSchema])
def get_proposals(db: Session = Depends(get_db)):
    """Get all proposals"""
    proposals = db.query(Proposal).all()
    return proposals


@router.get("/{proposal_id}", response_model=ProposalSchema)
def get_proposal(proposal_id: int, db: Session = Depends(get_db)):
    """Get a specific proposal by ID"""
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if proposal is None:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal


@router.post("/", response_model=ProposalSchema, status_code=status.HTTP_201_CREATED)
def create_proposal(proposal: ProposalCreate, db: Session = Depends(get_db)):
    """Create a new proposal"""
    # Verify client exists
    client = db.query(Client).filter(Client.id == proposal.client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db_proposal = Proposal(
        client_id=proposal.client_id,
        title=proposal.title,
        packages=proposal.packages,
        valid_until=proposal.valid_until,
        amount=proposal.amount,
        status=proposal.status,
        message=proposal.message,
        expiry_date=proposal.expiry_date,
    )
    db.add(db_proposal)
    db.commit()
    db.refresh(db_proposal)
    return db_proposal


@router.put("/{proposal_id}", response_model=ProposalSchema)
def update_proposal(proposal_id: int, proposal: ProposalUpdate, db: Session = Depends(get_db)):
    """Update an existing proposal"""
    db_proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if db_proposal is None:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # If client_id is being updated, verify the client exists
    if proposal.client_id is not None and proposal.client_id != db_proposal.client_id:
        client = db.query(Client).filter(Client.id == proposal.client_id).first()
        if client is None:
            raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = proposal.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_proposal, key, value)
    
    db.commit()
    db.refresh(db_proposal)
    return db_proposal


@router.delete("/{proposal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_proposal(proposal_id: int, db: Session = Depends(get_db)):
    """Delete a proposal"""
    db_proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if db_proposal is None:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    db.delete(db_proposal)
    db.commit()
    return None
