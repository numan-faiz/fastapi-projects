from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str

class AnnouncementCreateSchema(BaseModel):
    title: str = Field(min_length=3, max_length=100, examples=["Holiday Notice"])
    message: str = Field(min_length=3, examples=["Tomarrow institute will be closed."])

class AnnouncementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    created_at: datetime
    created_by_id: int
    created_by: Optional[UserResponse] = None