from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.activity_log import ActivityLog
from app.models.user import User
from app.schemas.activity_log import ActivityLogResponse
from app.auth import RoleChecker, get_current_user

router = APIRouter(prefix="/activity-log", tags=["Activity Log"])


@router.get("/", response_model=list[ActivityLogResponse])
def get_activity_logs(
    limit: int = 10,
    db: Session = Depends(get_db),
    admin = Depends(RoleChecker(["admin"]))
):
    """Get recent activity logs for admin dashboard"""
    logs = db.query(ActivityLog)\
        .outerjoin(User, ActivityLog.user_id == User.id)\
        .order_by(desc(ActivityLog.created_at))\
        .limit(limit)\
        .all()
    
    # Add user_name to each log
    result = []
    for log in logs:
        log_dict = {
            "id": log.id,
            "action": log.action,
            "description": log.description,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "user_id": log.user_id,
            "created_at": log.created_at,
            "user_name": log.user.name if log.user else "System"
        }
        result.append(ActivityLogResponse(**log_dict))
    
    return result
