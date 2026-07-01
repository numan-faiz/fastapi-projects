from app.database import Base
from sqlalchemy import String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.user import User


class Announcement(Base):
    __tablename__ = "announcement"

    id: Mapped[int] = mapped_column(primary_key= True)
    title: Mapped[str] = mapped_column(String(50))
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="cascade"))
    created_by: Mapped["User"] = relationship(foreign_keys=[created_by_id])