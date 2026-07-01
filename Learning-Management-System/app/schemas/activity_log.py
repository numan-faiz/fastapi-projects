from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ActivityLogResponse(BaseModel):
    id: int
    action: str
    description: str
    entity_type: str
    entity_id: Optional[int] = None
    user_id: Optional[int] = None
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True
