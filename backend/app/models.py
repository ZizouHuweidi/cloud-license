import uuid
from datetime import date, datetime

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

# ========================================================
# User Models
# ========================================================

# Shared properties for user
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)

# Properties received during user creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)

class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)

# Properties received on user update
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=40)

class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)

class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)

# Database model for user; table name inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    # Relationship to devices (a user might have added devices)
    devices: list["Device"] = Relationship(back_populates="added_by")

# Properties to return via API for a single user
class UserPublic(UserBase):
    id: uuid.UUID

class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int

# ========================================================
# Device Models
# ========================================================

# Shared properties for device
class DeviceBase(SQLModel):
    service_tag: str = Field(index=True, max_length=100)
    device_type: str = Field(max_length=100)

# Properties to receive on device creation
class DeviceCreate(DeviceBase):
    pass

# Properties to receive on device update
class DeviceUpdate(DeviceBase):
    service_tag: str | None = Field(default=None, max_length=100)
    device_type: str | None = Field(default=None, max_length=100)

# Database model for device; table name inferred from class name
class Device(DeviceBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    # Added_by user field for reference; adjust as needed (e.g., if audit info is needed)
    added_by_id: uuid.UUID | None = Field(foreign_key="user.id", nullable=True)
    added_by: User | None = Relationship(back_populates="devices")
    # Relationship to licenses assigned to this device
    licenses: list["License"] = Relationship(back_populates="device")

# Properties to return via API for a single device
class DevicePublic(DeviceBase):
    id: uuid.UUID

class DevicesPublic(SQLModel):
    data: list[DevicePublic]
    count: int

# ========================================================
# License Models
# ========================================================

# Shared properties for license
class LicenseBase(SQLModel):
    license_type: str = Field(max_length=100)
    expiration_date: date

# Properties to receive on license creation
class LicenseCreate(LicenseBase):
    device_id: uuid.UUID

# Properties to receive on license update
class LicenseUpdate(LicenseBase):
    license_type: str | None = Field(default=None, max_length=100)
    expiration_date: date | None = None

# Database model for license; table name inferred from class name
class License(LicenseBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    device_id: uuid.UUID = Field(foreign_key="device.id", nullable=False)
    device: Device | None = Relationship(back_populates="licenses")
    # Relationship to history records
    history: list["LicenseHistory"] = Relationship(back_populates="license")
    # Relationship to notifications
    notifications: list["Notification"] = Relationship(back_populates="license")

# Properties to return via API for a single license
class LicensePublic(LicenseBase):
    id: uuid.UUID
    device_id: uuid.UUID

class LicensesPublic(SQLModel):
    data: list[LicensePublic]
    count: int

# ========================================================
# License History Models
# ========================================================

class LicenseHistoryBase(SQLModel):
    action: str = Field(max_length=50)  # e.g., "INSERT", "UPDATE"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Properties to receive on license history creation, if needed
class LicenseHistoryCreate(LicenseHistoryBase):
    license_id: uuid.UUID
    device_id: uuid.UUID

# Database model for license history; table name inferred from class name
class LicenseHistory(LicenseHistoryBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    license_id: uuid.UUID = Field(foreign_key="license.id", nullable=False)
    device_id: uuid.UUID = Field(foreign_key="device.id", nullable=False)
    license: License | None = Relationship(back_populates="history")

# ========================================================
# Notification Models
# ========================================================

# Shared properties for notification
class NotificationBase(SQLModel):
    message: str = Field(max_length=255)
    urgency: str = Field(max_length=20)  # low, medium, high
    read: bool = Field(default=False)
    notification_date: datetime = Field(default_factory=datetime.utcnow)
    sent: bool = Field(default=False)

# Properties to receive on notification creation
class NotificationCreate(NotificationBase):
    license_id: uuid.UUID
    user_id: uuid.UUID | None = None

# Properties to receive on notification update
class NotificationUpdate(NotificationBase):
    message: str | None = None
    urgency: str | None = None
    read: bool | None = None
    sent: bool | None = None

# Database model for notification; table name inferred from class name
class Notification(NotificationBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    license_id: uuid.UUID = Field(foreign_key="license.id", nullable=False)
    user_id: uuid.UUID | None = Field(foreign_key="user.id", nullable=True)
    license: License | None = Relationship(back_populates="notifications")
    user: User | None = Relationship()

# Properties to return via API for a single notification
class NotificationPublic(NotificationBase):
    id: uuid.UUID
    license_id: uuid.UUID

class NotificationsPublic(SQLModel):
    data: list[NotificationPublic]
    count: int

# ========================================================
# Generic Schemas
# ========================================================

# Generic message response
class Message(SQLModel):
    message: str

# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None

class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)

# ========================================================
# Dashboard Models
# ========================================================

class DeviceStats(SQLModel):
    total: int
    active: int
    inactive: int

class LicenseStats(SQLModel):
    total: int
    active: int
    expired: int

class ExpiringLicenseResponse(LicensePublic):
    device: DevicePublic
    days_until_expiry: int

class ExpiringLicensesResponse(SQLModel):
    data: list[ExpiringLicenseResponse]
