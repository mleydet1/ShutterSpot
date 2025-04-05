from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class PackageItem(BaseModel):
    name: str
    price: float
    description: str


class ProposalBase(BaseModel):
    client_id: int
    title: str
    packages: List[Dict[str, Any]]
    valid_until: Optional[date] = None
    amount: float
    status: Optional[str] = "Pending"
    message: Optional[str] = None
    expiry_date: Optional[date] = None


class ProposalCreate(ProposalBase):
    pass


class ProposalUpdate(ProposalBase):
    client_id: Optional[int] = None
    title: Optional[str] = None
    packages: Optional[List[Dict[str, Any]]] = None
    amount: Optional[float] = None
    status: Optional[str] = None


class Proposal(ProposalBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
