from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserResponse, TeacherCreateSchema
from app.routers.authentication import RoleChecker, make_hash, get_current_user
from app.utils.activity_logger import log_activity

router = APIRouter(prefix="/teacher", tags=["Teacher"])

@router.get("/", response_model=list[UserResponse])
def view_teachers(db: Session = Depends(get_db), admin = Depends(RoleChecker(["admin"]))):
    teachers = db.query(User).filter(User.roles.any(Role.name == "teacher")).all()
    return teachers

@router.post("/", response_model= UserResponse)
def create_teacher(data: TeacherCreateSchema, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=403,
            detail="Email already exists"
        )
    role = db.query(Role).filter(Role.name == "teacher").first()
    if not role:
        raise HTTPException(
            status_code=400,
            detail="teacher role does not exist in database"
        )
    teacher = User(
        name = data.name,
        email = data.email,
        password = make_hash(data.password)
    )
    teacher.roles.append(role)
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    
    # Log activity
    log_activity(
        db=db,
        action="created",
        description=f"New teacher '{data.name}' registered",
        entity_type="teacher",
        entity_id=teacher.id,
        user=current_user
    )
    
    return teacher


@router.put("/{teacher_id}", response_model= UserResponse)
def update_teacher(teacher_id: int ,data: TeacherCreateSchema, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    teacher = db.query(User).filter(User.id == teacher_id, User.roles.any(Role.name == "teacher")).first()
    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )
    teacher.name = data.name
    teacher.email = data.email

    db.commit()
    db.refresh(teacher)
    
    # Log activity
    log_activity(
        db=db,
        action="updated",
        description=f"Teacher '{teacher.name}' profile updated",
        entity_type="teacher",
        entity_id=teacher.id,
        user=current_user
    )
    
    return teacher


@router.delete("/{teacher_id}")
def delete_teacher(teacher_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    teacher = db.query(User).filter(User.id == teacher_id, User.roles.any(Role.name == "teacher")).first()
    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )
    
    teacher_name = teacher.name
    db.delete(teacher)
    db.commit()
    
    # Log activity
    log_activity(
        db=db,
        action="deleted",
        description=f"Teacher '{teacher_name}' deleted",
        entity_type="teacher",
        entity_id=teacher_id,
        user=current_user
    )
    
    return {
        "detail": "Teacher deleted successfully"
    }