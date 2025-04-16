import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select, func

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Device,
    DeviceCreate,
    DevicePublic,
    DevicesPublic,
    DeviceUpdate,
    Message,
    DeviceStats,
    License,
)

router = APIRouter(prefix="/devices", tags=["devices"])

@router.get("/", response_model=DevicesPublic)
def read_devices(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve devices.
    """
    count_statement = select(func.count()).select_from(Device)
    count = session.exec(count_statement).one()
    statement = select(Device).offset(skip).limit(limit)
    devices = session.exec(statement).all()
    return DevicesPublic(data=devices, count=count)

@router.get("/{id}", response_model=DevicePublic)
def read_device(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get a device by ID.
    """
    device = session.get(Device, id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.post("/", response_model=DevicePublic)
def create_device(*, session: SessionDep, current_user: CurrentUser, device_in: DeviceCreate) -> Any:
    """
    Create a new device.
    """
    device = crud.create_device(session=session, device_in=device_in)
    return device

@router.put("/{id}", response_model=DevicePublic)
def update_device(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, device_in: DeviceUpdate
) -> Any:
    """
    Update a device.
    """
    device = session.get(Device, id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    device = crud.update_device(session=session, db_device=device, device_in=device_in)
    return device

@router.delete("/{id}", response_model=Message)
def delete_device(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Message:
    """
    Delete a device.
    """
    device = session.get(Device, id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    session.delete(device)
    session.commit()
    return Message(message="Device deleted successfully")

@router.get("/stats", response_model=DeviceStats)
def get_device_stats(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get device statistics.
    """
    total_devices = session.exec(select(func.count()).select_from(Device)).one()
    active_devices = session.exec(
        select(func.count())
        .select_from(Device)
        .join(License)
        .where(License.expiry_date > func.now())
    ).one()
    inactive_devices = total_devices - active_devices

    return DeviceStats(
        total=total_devices,
        active=active_devices,
        inactive=inactive_devices,
    )
