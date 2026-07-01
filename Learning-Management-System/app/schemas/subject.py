from pydantic import BaseModel, Field
from typing import Optional, List


class SubjectCreateSchema(BaseModel):
    name: str = Field(min_length=2, max_length=50, examples=["Gen AI"])
    description: str | None =  Field(default= None, examples=["AI fundamentals course"])

class UserResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    name: str
    email: str

class SubjectRespose(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    description: str | None
    teachers: List[UserResponse] = []
    students: List[UserResponse] = []
    