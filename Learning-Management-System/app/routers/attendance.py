from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.database import get_db
from app.models.attendance import Attendance
from app.models.subject import Subject
from app.models.user import User
from app.schemas.attendance import MarkAttendanceSchema, AttendanceResponse
from app.auth import RoleChecker, get_current_user
from app.utils.activity_logger import log_activity

router = APIRouter(prefix="/attendance", tags=["Attendance"])


# ---------- 1. Mark Attendance ----------
@router.post("/", response_model=AttendanceResponse)
def mark_attendance(
    data: MarkAttendanceSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = db.query(Subject).filter(Subject.id == data.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    if "teacher" in current_user.role_name and subject not in current_user.teaching_subjects:
        raise HTTPException(status_code=403, detail="You are not assigned to this subject")

    student = db.query(User).filter(User.id == data.student_id).first()
    if not student or student not in subject.students:
        raise HTTPException(status_code=400, detail="Student is not enrolled in this subject")

    existing = db.query(Attendance).filter(
        Attendance.student_id == data.student_id,
        Attendance.subject_id == data.subject_id,
        Attendance.date == data.date
    ).first()

    if existing:
        existing.status = data.status
        db.commit()
        db.refresh(existing)
        
        # Log activity
        log_activity(
            db=db,
            action="updated",
            description=f"Attendance updated for '{student.name}' in '{subject.name}'",
            entity_type="attendance",
            entity_id=existing.id,
            user=current_user
        )
        
        return existing

    attendance = Attendance(
        student_id=data.student_id,
        subject_id=data.subject_id,
        date=data.date,
        status=data.status
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    
    # Log activity
    log_activity(
        db=db,
        action="marked",
        description=f"Attendance marked for '{student.name}' in '{subject.name}'",
        entity_type="attendance",
        entity_id=attendance.id,
        user=current_user
    )
    
    return attendance


# ---------- 2. Monthly/Filtered Report ----------
@router.get("/report", response_model=list[AttendanceResponse])
def attendance_report(
    subject_id: int | None = None,
    student_id: int | None = None,
    month: int | None = None,
    year: int | None = None,
    date: str | None = None,
    db: Session = Depends(get_db),
    admin=Depends(RoleChecker(["admin", "teacher"]))
):
    from sqlalchemy.orm import selectinload
    from datetime import datetime
    
    query = db.query(Attendance).options(
        selectinload(Attendance.student),
        selectinload(Attendance.subject)
    )

    if subject_id:
        query = query.filter(Attendance.subject_id == subject_id)
    if student_id:
        query = query.filter(Attendance.student_id == student_id)
    if month:
        query = query.filter(extract("month", Attendance.date) == month)
    if year:
        query = query.filter(extract("year", Attendance.date) == year)
    if date:
        try:
            filter_date = datetime.strptime(date, "%Y-%m-%d").date()
            query = query.filter(Attendance.date == filter_date)
        except ValueError:
            pass

    return query.all()


# ---------- 3. Student's Own Attendance ----------
@router.get("/my", response_model=list[AttendanceResponse])
def my_attendance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(Attendance).filter(Attendance.student_id == current_user.id).all()
    return records