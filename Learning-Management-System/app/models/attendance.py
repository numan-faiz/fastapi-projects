from app.database import Base
from sqlalchemy import ForeignKey, Date, Enum as sqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum
from datetime import date as date_type
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.user import User
    from app.models.subject import Subject


class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"
    leave = "leave"


class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[date_type] = mapped_column(Date)
    status: Mapped[AttendanceStatus] = mapped_column(sqlEnum(AttendanceStatus))

    student_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="cascade"))
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id", ondelete="cascade"))

    student: Mapped["User"] = relationship(foreign_keys=[student_id])
    subject: Mapped["Subject"] = relationship(foreign_keys=[subject_id])