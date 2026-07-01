from app.database import Base
from sqlalchemy import String, Text, Table, Column, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.user import User


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(Text, nullable=True)

    students: Mapped[list["User"]] = relationship(
        secondary="subject_students",
        back_populates="enrolled_subjects",
        lazy="selectin"
    )

    teachers: Mapped[list["User"]] = relationship(
        secondary="subject_teachers",
        back_populates="teaching_subjects",
        lazy="selectin"
    )


subject_students = Table(
    "subject_students",
    Base.metadata,
    Column("subject_id", ForeignKey("subjects.id", ondelete="cascade"), primary_key=True),
    Column("student_id", ForeignKey("users.id", ondelete="cascade"), primary_key=True)
)


subject_teachers = Table(
    "subject_teachers",
    Base.metadata,
    Column("subject_id", ForeignKey("subjects.id", ondelete="cascade"), primary_key=True),
    Column("teacher_id", ForeignKey("users.id", ondelete="cascade"), primary_key=True)
)