from pydantic import BaseModel, ConfigDict
from datetime import date
from enum import Enum
from typing import Optional


class AttendanceStatusEnum(str, Enum):
    present = "present"
    absent = "absent"
    leave = "leave"


class MarkAttendanceSchema(BaseModel):
    student_id: int
    subject_id: int
    date: date
    status: AttendanceStatusEnum


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str


class SubjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = None


class AttendanceResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    date: date
    status: AttendanceStatusEnum
    student_id: int
    subject_id: int
    student: Optional[UserResponse] = None
    subject: Optional[SubjectResponse] = None