from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog
from app.models.user import User
from datetime import datetime, timezone


def log_activity(
    db: Session,
    action: str,
    description: str,
    entity_type: str,
    entity_id: int = None,
    user: User = None
):
    """Helper function to log activity to the database"""
    activity_log = ActivityLog(
        action=action,
        description=description,
        entity_type=entity_type,
        entity_id=entity_id,
        user_id=user.id if user else None,
        created_at=datetime.now(timezone.utc)
    )
    db.add(activity_log)
    db.commit()
