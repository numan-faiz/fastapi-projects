from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List

from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    teacher = "teacher"
    student = "student"

class SubjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = None

class UserRegisterSchema(BaseModel):
    name: str = Field(min_length=3,  max_length= 50, examples= ["user"])
    email: EmailStr = Field(max_length= 50, examples= ["user@gmail.com"])
    password: str= Field(min_length=8, examples=["12345678"])
    role: UserRole

class UserLoginSchema(BaseModel):
    email: EmailStr = Field(max_length= 50, examples= ["user@gmail.com"])
    password: str= Field(min_length=8, examples=["12345678"])

class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str = Field(min_length=3,  max_length= 50, examples= ["user"])
    email: EmailStr = Field(max_length= 50, examples= ["user@gmail.com"])
    roles: list[RoleResponse] = []
    teaching_subjects: List[SubjectResponse] = []
    enrolled_subjects: List[SubjectResponse] = []

class TeacherCreateSchema(BaseModel):
    name: str = Field(min_length=3, max_length=50, examples=["teacher"])
    email: EmailStr = Field(max_length= 50, examples= ["teacher@gmail.com"])
    password: str = Field(min_length=8, examples=["12345678"])


class StudentCreateSchema(BaseModel):
    name: str = Field(min_length=3,  max_length= 50, examples= ["student"])
    email: EmailStr = Field(max_length= 50, examples= ["student@gmail.com"])
    password: str= Field(min_length=8, examples=["12345678"])


class UpdateProfileSchema(BaseModel):
    name: str = Field(min_length=3, max_length=50)
    email: EmailStr = Field(max_length=50)


class ChangePasswordSchema(BaseModel):
    current_password: str = Field(min_length=8)
    new_password: str = Field(min_length=8)