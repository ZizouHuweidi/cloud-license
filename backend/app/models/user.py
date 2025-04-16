import uuid
from typing import List

from sqlmodel import Field, Relationship, SQLModel

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    audit_logs: List["AuditLog"] = Relationship(back_populates="user")

    class Config:
        arbitrary_types_allowed = True
