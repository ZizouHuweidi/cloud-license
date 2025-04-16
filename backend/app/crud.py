import uuid
from typing import Any

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import (
    Device,
    DeviceCreate,
    DeviceUpdate,
    License,
    LicenseCreate,
    LicenseUpdate,
    Notification,
    NotificationCreate,
    NotificationUpdate,
    User,
    UserCreate,
    UserUpdate,
)
from app.services.audit import AuditService

# ---------------------------------------------------------
# User CRUD functions
# ---------------------------------------------------------
def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


# ---------------------------------------------------------
# Device CRUD functions
# ---------------------------------------------------------
def create_device(*, session: Session, device_in: DeviceCreate) -> Device:
    db_device = Device.model_validate(device_in)
    session.add(db_device)
    session.commit()
    session.refresh(db_device)
    return db_device


def update_device(*, session: Session, db_device: Device, device_in: DeviceUpdate) -> Any:
    device_data = device_in.model_dump(exclude_unset=True)
    db_device.sqlmodel_update(device_data)
    session.add(db_device)
    session.commit()
    session.refresh(db_device)
    return db_device


def get_device_by_id(*, session: Session, device_id: uuid.UUID) -> Device | None:
    return session.get(Device, device_id)


# ---------------------------------------------------------
# License CRUD functions
# ---------------------------------------------------------
def create_license(*, session: Session, license_in: LicenseCreate, user_id: uuid.UUID | None = None) -> License:
    db_license = License.model_validate(license_in)
    session.add(db_license)
    session.commit()
    session.refresh(db_license)
    
    # Log the creation in audit trail
    audit_service = AuditService(session)
    audit_service.log_change(
        entity_type="license",
        entity_id=str(db_license.id),
        action="create",
        changes={"initial_state": license_in.model_dump()},
        user_id=str(user_id) if user_id else None
    )
    
    return db_license


def update_license(*, session: Session, db_license: License, license_in: LicenseUpdate, user_id: uuid.UUID | None = None) -> Any:
    # Store the previous state
    previous_state = db_license.model_dump()
    
    # Update the license
    license_data = license_in.model_dump(exclude_unset=True)
    db_license.sqlmodel_update(license_data)
    session.add(db_license)
    session.commit()
    session.refresh(db_license)
    
    # Log the changes in audit trail
    audit_service = AuditService(session)
    audit_service.log_change(
        entity_type="license",
        entity_id=str(db_license.id),
        action="update",
        changes={
            "previous_state": previous_state,
            "updated_fields": license_data
        },
        user_id=str(user_id) if user_id else None
    )
    
    return db_license


def get_license_by_id(*, session: Session, license_id: uuid.UUID) -> License | None:
    return session.get(License, license_id)


# ---------------------------------------------------------
# Notification CRUD functions
# ---------------------------------------------------------
def create_notification(*, session: Session, notification_in: NotificationCreate) -> Notification:
    db_notification = Notification.model_validate(notification_in)
    session.add(db_notification)
    session.commit()
    session.refresh(db_notification)
    return db_notification


def update_notification(*, session: Session, db_notification: Notification, notification_in: NotificationUpdate) -> Any:
    notification_data = notification_in.model_dump(exclude_unset=True)
    db_notification.sqlmodel_update(notification_data)
    session.add(db_notification)
    session.commit()
    session.refresh(db_notification)
    return db_notification


def get_notification_by_id(*, session: Session, notification_id: uuid.UUID) -> Notification | None:
    return session.get(Notification, notification_id)
