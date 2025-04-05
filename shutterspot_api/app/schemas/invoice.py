from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class InvoiceItemBase(BaseModel):
    description: str
    quantity: int
    unit_price: float
    amount: float


class InvoiceBase(BaseModel):
    client_id: int
    shoot_id: Optional[int] = None
    invoice_number: str
    items: List[Dict[str, Any]]
    subtotal: str
    tax: str
    total: str
    due_date: date
    amount: float
    status: Optional[str] = "Pending"


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(InvoiceBase):
    client_id: Optional[int] = None
    shoot_id: Optional[int] = None
    invoice_number: Optional[str] = None
    items: Optional[List[Dict[str, Any]]] = None
    subtotal: Optional[str] = None
    tax: Optional[str] = None
    total: Optional[str] = None
    due_date: Optional[date] = None
    amount: Optional[float] = None
    status: Optional[str] = None


class Invoice(InvoiceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
