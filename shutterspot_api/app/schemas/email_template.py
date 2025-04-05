from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EmailTemplateBase(BaseModel):
    name: str
    subject: str
    body: str
    category: str
    content: str


class EmailTemplateCreate(EmailTemplateBase):
    pass


class EmailTemplateUpdate(EmailTemplateBase):
    name: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None


class EmailTemplate(EmailTemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
