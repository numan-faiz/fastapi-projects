from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserLoginSchema, UserRegisterSchema, UserResponse, UpdateProfileSchema, ChangePasswordSchema
from app.database import get_db
from app.models.user import User
from app.models.role import Role
from app.auth import make_hash, verify_hash, create_access_token, get_current_user, RoleChecker, PermissionCheck


router = APIRouter(prefix="/auth", tags=["Authentication"])

# ----- Route 1 -----
@router.post("/register", response_model=UserResponse)
def register(data: UserRegisterSchema, db=Depends(get_db)):
    role = db.query(Role).filter(Role.name == data.role).first()
    if not role:
        raise HTTPException(
            status_code=400,
            detail=f"Role '{data.role}' does not exist."
        )

    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=401,
            detail="Email already exists"
        )

    user = User(
        name=data.name,
        email=data.email,
        password=make_hash(data.password)
    )
    user.roles.append(role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ----- Route 2 -----
@router.post("/login")
def login(cred: UserLoginSchema, db = Depends(get_db)):
    user = db.query(User).filter(User.email == cred.email).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )
    if not verify_hash(cred.password, user.password):
        raise HTTPException(    
            status_code=401,
            detail="invalid password"
        )
    token = create_access_token({"id": user.id})

    return {
        "access_token": token,
        "token_type": "Bearer"
    }

# ----- Route 3 -----
@router.get("/profile", response_model=UserResponse)
def profile(user = Depends(get_current_user)):
    return user


# ----- Route 4: Update Profile -----
@router.put("/profile", response_model=UserResponse)
def update_profile(
    data: UpdateProfileSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if email is being changed and if it already exists
    if data.email != current_user.email:
        existing_user = db.query(User).filter(User.email == data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")
    
    current_user.name = data.name
    current_user.email = data.email
    db.commit()
    db.refresh(current_user)
    return current_user


# ----- Route 5: Change Password -----
@router.put("/change-password")
def change_password(
    data: ChangePasswordSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_hash(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    current_user.password = make_hash(data.new_password)
    db.commit()
    return {"detail": "Password changed successfully"}


# ----- Route 6 -----
@router.get("/create-teacher")
def create_teacher(user = Depends(PermissionCheck("add teacher"))):
    return "You can create teacher"