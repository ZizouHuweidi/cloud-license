import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select, func

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import License, LicenseCreate, LicensePublic, LicensesPublic, LicenseUpdate, Message

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
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, license_in: LicenseUpdate
) -> Any:
    """
    Update a license.
    """
    license_obj = session.get(License, id)
    if not license_obj:
        raise HTTPException(status_code=404, detail="License not found")
    license_obj = crud.update_license(session=session, db_license=license_obj, license_in=license_in)
    return license_obj


@router.delete("/{id}", response_model=Message)
def delete_license(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Message:
    """
    Delete a license.
    """
    license_obj = session.get(License, id)
    if not license_obj:
        raise HTTPException(status_code=404, detail="License not found")
    session.delete(license_obj)
    session.commit()
    return Message(message="License deleted successfully")
