from datetime import datetime
from typing import Any

from sqlmodel import Session

from app.models.audit import AuditLog

class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log_change(
        self,
        entity_type: str,
        entity_id: str,
        action: str,
        changes: dict[str, Any],
        user_id: str | None = None
    ) -> AuditLog:
        """Log a change to an entity."""
        audit_log = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            changes=changes,
            user_id=user_id,
            timestamp=datetime.utcnow()
        )
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        return audit_log

    def get_entity_history(
        self,
        entity_type: str,
        entity_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> list[AuditLog]:
        """Get the history of changes for a specific entity."""
        return (
            self.db.query(AuditLog)
            .filter(
                AuditLog.entity_type == entity_type,
                AuditLog.entity_id == entity_id
            )
            .order_by(AuditLog.timestamp.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
