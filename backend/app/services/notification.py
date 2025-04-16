from datetime import datetime, timedelta
from sqlmodel import Session, select

from app.core.config import settings
from app.core.email import send_email
from app.models import License, Notification, NotificationCreate

class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def create_notification(self, notification_in: NotificationCreate) -> Notification:
        """Create a new notification record."""
        notification = Notification(**notification_in.model_dump())
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def send_expiring_license_notifications(self) -> None:
        """Send notifications for licenses expiring soon."""
        now = datetime.utcnow()
        thirty_days_from_now = now + timedelta(days=30)
        # Calculate notification urgency based on days until expiry

        # Get licenses expiring in the next 30 days
        statement = (
            select(License)
            .where(License.expiry_date > now)
            .where(License.expiry_date <= thirty_days_from_now)
            .order_by(License.expiry_date)
        )
        expiring_licenses = self.db.exec(statement).all()

        # Group licenses by device owner
        owner_licenses = {}
        for license in expiring_licenses:
            owner = license.device.added_by
            if owner and owner.email:
                if owner.email not in owner_licenses:
                    owner_licenses[owner.email] = []
                owner_licenses[owner.email].append({
                    "id": str(license.id),
                    "device": license.device,
                    "license_type": license.license_type,
                    "expiry_date": license.expiry_date,
                    "days_until_expiry": (license.expiry_date - now).days
                })

        # Send notifications to each owner
        dashboard_url = f"{settings.FRONTEND_HOST}/dashboard"
        for email, licenses in owner_licenses.items():
            # Send email notification
            send_email(
                to_addresses=[email],
                subject="License Expiration Notice",
                template_name="license_expiring",
                template_vars={
                    "licenses": licenses,
                    "dashboard_url": dashboard_url,
                    "company_name": settings.PROJECT_NAME
                }
            )

            # Create notification records
            for license in licenses:
                if license["days_until_expiry"] <= 7:
                    urgency = "high"
                elif license["days_until_expiry"] <= 14:
                    urgency = "medium"
                else:
                    urgency = "low"

                self.create_notification(
                    NotificationCreate(
                        license_id=license["id"],
                        message=f"License expires in {license['days_until_expiry']} days",
                        urgency=urgency
                    )
                )
