import uuid
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Device,
    ExpiringLicenseResponse,
    ExpiringLicensesResponse,
    License,
    LicenseCreate,
    LicensePublic,
    LicensesPublic,
    LicenseStats,
    LicenseUpdate,
    Message,
)

router = APIRouter(prefix="/licenses", tags=["licenses"])


@router.get("/", response_model=LicensesPublic)
def read_licenses(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve licenses.
    """
    count_statement = select(func.count()).select_from(License)
    count = session.exec(count_statement).one()
    statement = select(License).offset(skip).limit(limit)
    licenses = session.exec(statement).all()

    return LicensesPublic(data=licenses, count=count)


@router.get("/{id}", response_model=LicensePublic)
def read_license(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get a license by ID.
    """
    license_obj = session.get(License, id)
    if not license_obj:
        raise HTTPException(status_code=404, detail="License not found")
    return license_obj


@router.post("/", response_model=LicensePublic)
def create_license(
    *, session: SessionDep, current_user: CurrentUser, license_in: LicenseCreate
) -> Any:
    """
    Create a new license.
    """
    license_obj = crud.create_license(session=session, license_in=license_in)
    return license_obj


@router.put("/{id}", response_model=LicensePublic)
def update_license(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    license_in: LicenseUpdate,
) -> Any:
    """
    Update a license.
    """
    license_obj = session.get(License, id)
    if not license_obj:
        raise HTTPException(status_code=404, detail="License not found")
    license_obj = crud.update_license(
        session=session, db_license=license_obj, license_in=license_in
    )
    return license_obj


@router.delete("/{id}", response_model=Message)
def delete_license(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a license.
    """
    license_obj = session.get(License, id)
    if not license_obj:
        raise HTTPException(status_code=404, detail="License not found")
    session.delete(license_obj)
    session.commit()
    return Message(message="License deleted successfully")

@router.get("/stats", response_model=LicenseStats)
def get_license_stats(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get license statistics.
    """
    total_licenses = session.exec(select(func.count()).select_from(License)).one()
    active_licenses = session.exec(
        select(func.count())
        .select_from(License)
        .where(License.expiry_date > func.now())
    ).one()
    expired_licenses = total_licenses - active_licenses

    return LicenseStats(
        total=total_licenses,
        active=active_licenses,
        expired=expired_licenses,
    )

@router.get("/expiring", response_model=ExpiringLicensesResponse)
def get_expiring_licenses(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get licenses that are expiring soon (within 30 days).
    """
    now = datetime.utcnow()
    thirty_days_from_now = now + timedelta(days=30)

    statement = (
        select(License)
        .where(License.expiry_date > now)
        .where(License.expiry_date <= thirty_days_from_now)
        .order_by(License.expiry_date)
        .join(Device)
    )
    licenses = session.exec(statement).all()

    # Calculate days until expiry for each license and include device info
    expiring_licenses = []
    for license in licenses:
        days_until_expiry = (license.expiry_date - now).days
        license_dict = ExpiringLicenseResponse(
            id=license.id,
            license_type=license.license_type,
            expiry_date=license.expiry_date,
            device_id=license.device_id,
            device=license.device,
            days_until_expiry=days_until_expiry
        )
        expiring_licenses.append(license_dict)

    return ExpiringLicensesResponse(data=expiring_licenses)
