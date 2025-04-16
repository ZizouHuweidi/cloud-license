import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import JSON
from sqlmodel import Field, Relationship, SQLModel

from app.models import User

class AuditLogBase(SQLModel):
    entity_type: str = Field(max_length=50)  # e.g., "license", "device"
    entity_id: uuid.UUID
    action: str = Field(max_length=50)  # e.g., "create", "update", "delete"
    changes: dict[str, Any] = Field(default={}, sa_type=JSON)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: uuid.UUID | None = Field(default=None, foreign_key="user.id")

class AuditLog(AuditLogBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user: "User" = Relationship(back_populates="audit_logs")

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogRead(AuditLogBase):
    id: uuid.UUID
