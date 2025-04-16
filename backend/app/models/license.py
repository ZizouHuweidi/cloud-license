import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import JSON
from sqlmodel import Field, SQLModel


class LicenseBase(SQLModel):
    name: str = Field(index=True)
    key: str = Field(unique=True, index=True)
    status: str = Field(default="active")
    activation_date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    expiration_date: Optional[datetime] = None
    max_devices: Optional[int] = None
    features: dict = Field(default={}, sa_type=JSON)
    license_metadata: Optional[dict] = Field(default=None, sa_type=JSON)


class License(LicenseBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class LicenseCreate(LicenseBase):
    pass


class LicenseUpdate(SQLModel):
    name: Optional[str] = None
    key: Optional[str] = None
    status: Optional[str] = None
    activation_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    max_devices: Optional[int] = None
    features: Optional[dict] = Field(default=None, sa_type=JSON)
    license_metadata: Optional[dict] = Field(default=None, sa_type=JSON)

