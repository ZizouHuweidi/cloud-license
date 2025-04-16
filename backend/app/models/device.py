import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import JSON
from sqlmodel import Field, SQLModel


class DeviceBase(SQLModel):
    name: str = Field(index=True)
    description: Optional[str] = None
    last_seen_at: Optional[datetime] = None
    status: str = Field(default="active")
    device_metadata: Optional[dict] = Field(default=None, sa_type=JSON)


class Device(DeviceBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class DeviceCreate(DeviceBase):
    pass


class DeviceUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    last_seen_at: Optional[datetime] = None
    status: Optional[str] = None
    device_metadata: Optional[dict] = None

