from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.subject import Subject
from app.models.role import Role
from app.models.user import User
from app.schemas.subject import SubjectCreateSchema, SubjectRespose
from app.auth import RoleChecker, get_current_user
from app.utils.activity_logger import log_activity


router = APIRouter(prefix="/subject", tags=["Subject"])

@router.get("/", response_model= list[SubjectRespose])
def view_subjects(db: Session = Depends(get_db), admin = Depends(RoleChecker(["admin"]))):
    subjects = db.query(Subject).all()
    return subjects

@router.post("/", response_model= SubjectRespose)
def create_subject(data: SubjectCreateSchema, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    existing_subject = db.query(Subject).filter(Subject.name == data.name).first()
    if existing_subject:
        raise HTTPException(
            status_code=400,
            detail="Subject with this name already exists"
        )
    
    subject = Subject(
        name = data.name,
        description = data.description
    )

    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    # Log activity
    log_activity(
        db=db,
        action="created",
        description=f"Subject '{data.name}' created",
        entity_type="subject",
        entity_id=subject.id,
        user=current_user
    )
    
    return subject


@router.put("/{subject_id}", response_model= SubjectRespose)
def update_subject (subject_id: int ,data: SubjectCreateSchema, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=404,
            detail="subject not found"
        )
    subject.name = data.name
    subject.description = data.description

    db.commit()
    db.refresh(subject)
    
    # Log activity
    log_activity(
        db=db,
        action="updated",
        description=f"Subject '{subject.name}' updated",
        entity_type="subject",
        entity_id=subject.id,
        user=current_user
    )
    
    return subject


@router.delete("/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=404,
            detail="subject not found"
        )
    
    subject_name = subject.name
    db.delete(subject)
    db.commit()
    
    # Log activity
    log_activity(
        db=db,
        action="deleted",
        description=f"Subject '{subject_name}' deleted",
        entity_type="subject",
        entity_id=subject_id,
        user=current_user
    )
    
    return {
        "detail": "subject deleted successfully"
    }


# ----- Assign Student to Subject -----
@router.post("/{subject_id}/student/{student_id}")
def assign_student(subject_id: int, student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=404,
            detail="subject not found"
        )
    
    # Check if user is admin or teacher assigned to this subject
    is_admin = any(role.name == "admin" for role in current_user.roles)
    is_assigned_teacher = any(role.name == "teacher" for role in current_user.roles) and subject in current_user.teaching_subjects
    
    if not is_admin and not is_assigned_teacher:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to assign students to this subject"
        )
    
    student = db.query(User).filter(User.id == student_id, User.roles.any(Role.name == "student")).first()
    if not student:
        raise HTTPException(
            status_code=404,
            detail="student not found"
        )
    if student in subject.students:
        raise HTTPException(
            status_code=400,
            detail="Student is already assigned to this subject"
        )
    subject.students.append(student)
    db.commit()
    
    # Log activity
    log_activity(
        db=db,
        action="assigned",
        description=f"Student '{student.name}' assigned to subject '{subject.name}'",
        entity_type="subject_student",
        entity_id=subject_id,
        user=current_user
    )
    
    return {
        "detail" : f"Student '{student.name}' assigned to '{subject.name}"
    }

# ----- Revoke Student from Subject -----
@router.delete("/{subject_id}/student/{student_id}")
def revoke_student(subject_id: int, student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=404,
            detail="subject not found"
        )
    
    # Check if user is admin or teacher assigned to this subject
    is_admin = any(role.name == "admin" for role in current_user.roles)
    is_assigned_teacher = any(role.name == "teacher" for role in current_user.roles) and subject in current_user.teaching_subjects
    
    if not is_admin and not is_assigned_teacher:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to remove students from this subject"
        )
    
    student = db.query(User).filter(User.id == student_id).first()
    if not student or student not in subject.students:
        raise HTTPException(
            status_code=404,
            detail="student is not assigned to this subject"
        )
    
    subject.students.remove(student)
    db.commit()
    
    # Log activity
    log_activity(
        db=db,
        action="revoked",
        description=f"Student '{student.name}' removed from subject '{subject.name}'",
        entity_type="subject_student",
        entity_id=subject_id,
        user=current_user
    )
    
    return {
        "detail" : f"Student removed from '{subject.name}'"
    }

# ===============================================
# ----- Assign Teacher to Subject -----
@router.post("/{subject_id}/teacher/{teacher_id}")
def assign_teacher(subject_id: int, teacher_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):

    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=404,
            detail="subject not found"
        )
    
    teacher = db.query(User).filter(User.id == teacher_id, User.roles.any(Role.name == "teacher")).first()
    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="teacher not found"
        )
    if teacher in subject.teachers:
        raise HTTPException(
            status_code=400,
            detail="Teacher is already assigned to this subject"
        )
    subject.teachers.append(teacher)
    db.commit()
    
    # Log activity
    log_activity(
        db=db,
        action="assigned",
        description=f"Teacher '{teacher.name}' assigned to subject '{subject.name}'",
        entity_type="subject_teacher",
        entity_id=subject_id,
        user=current_user
    )
    
    return {
        "detail" : f"Teacher '{teacher.name}' assigned to '{subject.name}"
    }

# ----- Revoke Student from Subject -----
@router.delete("/{subject_id}/teacher/{teacher_id}")
def revoke_teacher(subject_id: int, teacher_id: int, db: Session = Depends(get_db), admin = Depends(RoleChecker(["admin"]))):

    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=404,
            detail="subject not found"
        )
    
    teacher = db.query(User).filter(User.id == teacher_id).first()
    if not teacher or teacher not in subject.teachers:
        raise HTTPException(
            status_code=404,
            detail="teacher is not not assigned to this subject"
        )
    
    subject.teachers.remove(teacher)
    db.commit()
    return {
        "detail" : f"Teacher removed from this '{subject.name}"
    }


# ----------------------------------------------------
# ----------------------------------------------------
@router.get("/my-subjects")
def my_subjects(current_user: User = Depends(get_current_user)):
    result = []
    for subject in current_user.teaching_subjects:
        result.append({
            "id": subject.id,
            "subject_name": subject.name,
            "students": [{"id": s.id, "name": s.name, "email": s.email} for s in subject.students]
        })
    return result