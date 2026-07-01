from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.announcement import Announcement
from app.models.user import User
from app.schemas.announcement import AnnouncementCreateSchema, AnnouncementResponse
from app.auth import RoleChecker, get_current_user

router = APIRouter(prefix="/announcement", tags=["Announcement"])


# ---------- 1. Create Announcement ----------
@router.post("/", response_model=AnnouncementResponse)
def create_announcement(
    data: AnnouncementCreateSchema,
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["admin", "teacher"]))
):
    announcement = Announcement(
        title=data.title,
        message=data.message,
        created_by_id=user.id
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


# ---------- 2. View All Announcements ----------
@router.get("/", response_model=list[AnnouncementResponse])
def view_announcements(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()


# ---------- 3. Update Announcement ----------
@router.put("/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: int,
    data: AnnouncementCreateSchema,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin"]))
):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    announcement.title = data.title
    announcement.message = data.message
    db.commit()
    db.refresh(announcement)
    return announcement


# ---------- 4. Delete Announcement ----------
@router.delete("/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin"]))
):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    db.delete(announcement)
    db.commit()
    return {"detail": "Announcement deleted successfully"}  