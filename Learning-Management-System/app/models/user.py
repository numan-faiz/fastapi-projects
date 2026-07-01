from app.database import Base
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.role import Role
    from app.models.subject import Subject

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key= True
    )
    name: Mapped[str] = mapped_column(
        String(50),
        nullable= True
    )
    email: Mapped[str] = mapped_column(
        String(50),
        unique= True
    )
    password: Mapped[str] = mapped_column(
        Text
    )

    roles: Mapped[list["Role"]] = relationship(
        secondary="user_roles",
        back_populates="users",
        lazy="selectin"
    )

    @property
    def permission(self):
        return {
            permission.name
            for role in self.roles
            for permission in role.permissions
        }

    @property
    def role_name(self):
        return {role.name
                for role in self.roles
                }
    
    enrolled_subjects: Mapped[list["Subject"]] = relationship(
        secondary="subject_students",
        back_populates="students"
    )

    teaching_subjects: Mapped[list["Subject"]] = relationship(
        secondary="subject_teachers",
        back_populates="teachers"
    )