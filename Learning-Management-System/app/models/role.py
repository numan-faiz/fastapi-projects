from app.database import Base
from sqlalchemy import String, Column, Table, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.user import User


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

    users: Mapped[list["User"]] = relationship(
        secondary="user_roles",
        back_populates="roles"
    )

    permissions: Mapped[list["Permission"]] = relationship(
        secondary="role_permissions",
        back_populates="roles",
        lazy="selectin"
    )


class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

    roles: Mapped[list["Role"]] = relationship(
        secondary="role_permissions",
        back_populates="permissions"
    )


user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="cascade"), primary_key=True),
    Column("role_id", ForeignKey("roles.id", ondelete="cascade"), primary_key=True)
)


role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("permission_id", ForeignKey("permissions.id", ondelete="cascade"), primary_key=True),
    Column("role_id", ForeignKey("roles.id", ondelete="cascade"), primary_key=True)
)