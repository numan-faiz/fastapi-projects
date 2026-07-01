from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.role import Role
from app.models.subject import Subject
from app.schemas.user import UserResponse, StudentCreateSchema
from app.routers.authentication import RoleChecker, make_hash, get_current_user
from app.utils.activity_logger import log_activity

router = APIRouter(prefix="/student", tags=["Student"])

@router.get("/", response_model=list[UserResponse])
def view_students(db: Session = Depends(get_db), admin = Depends(RoleChecker(["admin"]))):
    students = db.query(User).filter(User.roles.any(Role.name == "student")).all()
    return students


@router.get("/all", response_model=list[UserResponse])
def view_all_students(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Allow teachers and admins to view all students for assignment purposes
    is_admin = any(role.name == "admin" for role in current_user.roles)
    is_teacher = any(role.name == "teacher" for role in current_user.roles)
    
    if not is_admin and not is_teacher:
        raise HTTPException(status_code=403, detail="Only teachers and admins can view all students")
    
    students = db.query(User).filter(User.roles.any(Role.name == "student")).all()
    return students


@router.get("/by-subject/{subject_id}", response_model=list[UserResponse])
def view_students_by_subject(subject_id: int, db: Session = Depends(get_db), admin = Depends(RoleChecker(["admin"]))):
    """Get students enrolled in a specific subject"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    return subject.students

@router.post("/", response_model= UserResponse)
def create_student(data: StudentCreateSchema, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Allow both admin and teachers to create students
    is_admin = any(role.name == "admin" for role in current_user.roles)
    is_teacher = any(role.name == "teacher" for role in current_user.roles)
    
    if not is_admin and not is_teacher:
        raise HTTPException(status_code=403, detail="Only teachers and admins can create students")
    
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=403,
            detail="Email already exists"
        )
    role = db.query(Role).filter(Role.name == "student").first()
    if not role:
        raise HTTPException(
            status_code=400,
            detail="student role does not exist in database"
        )
    student = User(
        name = data.name,
        email = data.email,
        password = make_hash(data.password)
    )
    student.roles.append(role)
    db.add(student)
    db.commit()
    db.refresh(student)
    
    # Log activity
    log_activity(
        db=db,
        action="created",
        description=f"New student '{data.name}' added",
        entity_type="student",
        entity_id=student.id,
        user=current_user
    )
    
    return student


@router.put("/{student_id}", response_model= UserResponse)
def update_student(student_id: int ,data: StudentCreateSchema, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    student = db.query(User).filter(User.id == student_id, User.roles.any(Role.name == "student")).first()
    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )
    student.name = data.name
    student.email = data.email

    db.commit()
    db.refresh(student)
    
    # Log activity
    log_activity(
        db=db,
        action="updated",
        description=f"Student '{student.name}' profile updated",
        entity_type="student",
        entity_id=student.id,
        user=current_user
    )
    
    return student


@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    student = db.query(User).filter(User.id == student_id, User.roles.any(Role.name == "student")).first()
    if not student:
        raise HTTPException(
            status_code=404,
            detail="student not found"
        )
    
    student_name = student.name
    db.delete(student)
    db.commit()
    
    # Log activity
    log_activity(
        db=db,
        action="deleted",
        description=f"Student '{student_name}' deleted",
        entity_type="student",
        entity_id=student_id,
        user=current_user
    )
    
    return {
        "detail": "student deleted successfully"
    }