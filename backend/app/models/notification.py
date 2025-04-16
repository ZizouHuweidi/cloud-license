import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import JSON
from sqlmodel import Field, SQLModel


class NotificationBase(SQLModel):
    title: str
    content: str
    type: str = Field(default="info")  # info, warning, error
    read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[dict] = Field(default=None, sa_type=JSON)
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")


class Notification(NotificationBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(SQLModel):
    title: Optional[str] = None
    content: Optional[str] = None
    type: Optional[str] = None
    read: Optional[bool] = None
    metadata: Optional[dict] = None

