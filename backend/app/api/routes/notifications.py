import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select, func

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import Notification, NotificationCreate, NotificationPublic, NotificationsPublic, NotificationUpdate, Message

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=NotificationsPublic)
def read_notifications(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve notifications.
    """
    count_statement = select(func.count()).select_from(Notification)
    count = session.exec(count_statement).one()
    statement = select(Notification).offset(skip).limit(limit)
    notifications = session.exec(statement).all()

    return NotificationsPublic(data=notifications, count=count)


@router.get("/{id}", response_model=NotificationPublic)
def read_notification(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get a notification by ID.
    """
    notification = session.get(Notification, id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


@router.post("/", response_model=NotificationPublic)
def create_notification(
    *, session: SessionDep, current_user: CurrentUser, notification_in: NotificationCreate
) -> Any:
    """
    Create a new notification.
    """
    notification = crud.create_notification(session=session, notification_in=notification_in)
    return notification


@router.put("/{id}", response_model=NotificationPublic)
def update_notification(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, notification_in: NotificationUpdate
) -> Any:
    """
    Update a notification.
    """
    notification = session.get(Notification, id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification = crud.update_notification(
        session=session, db_notification=notification, notification_in=notification_in
    )
    return notification


@router.delete("/{id}", response_model=Message)
def delete_notification(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Message:
    """
    Delete a notification.
    """
    notification = session.get(Notification, id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    session.delete(notification)
    session.commit()
    return Message(message="Notification deleted successfully")
