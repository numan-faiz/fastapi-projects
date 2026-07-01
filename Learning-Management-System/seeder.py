"""
Database seeder.

Run with:  python seeder.py

Roles (admin, student, teacher), permissions, aur unki mapping insert karta hai.
Dobara chalayein to bhi koi masla nahi — existing data dobara nahi banta.
"""

from app.database import Base, engine, SessionLocal
import app.models.user
import app.models.role
import app.models.subject
from app.models.role import Role, Permission
from app.models.user import User
from app.auth import make_hash


PERMISSIONS = [
    "view profile",
    "view teacher", "add teacher", "edit teacher", "delete teacher",
    "view student", "add student", "edit student", "delete student",
    "view subject", "add subject", "edit subject", "delete subject",
    "assign subject", "revoke subject",
    "assign teacher subject", "revoke teacher subject",
    "mark attendance", "view attendance report", "view own attendance",
]

ROLE_PERMISSIONS = {
    "admin": PERMISSIONS,
    "teacher": [
        "view profile",
        "view student",
        "view subject",
        "mark attendance",
        "view attendance report",
    ],
    "student": [
        "view profile",
        "view subject",
        "view own attendance",
    ],
}


def get_or_create_permission(db, name: str) -> Permission:
    permission = db.query(Permission).filter(Permission.name == name).first()
    if not permission:
        permission = Permission(name=name)
        db.add(permission)
        db.commit()
        db.refresh(permission)
    return permission


def get_or_create_role(db, name: str) -> Role:
    role = db.query(Role).filter(Role.name == name).first()
    if not role:
        role = Role(name=name)
        db.add(role)
        db.flush()
    return role


def seed():
    Base.metadata.create_all(engine)

    db = SessionLocal()
    try:
        permissions = {name: get_or_create_permission(db, name) for name in PERMISSIONS}

        for role_name, perm_names in ROLE_PERMISSIONS.items():
            role = get_or_create_role(db, role_name)

            existing = {p.name for p in role.permissions}
            for perm_name in perm_names:
                if perm_name not in existing:
                    role.permissions.append(permissions[perm_name])

        db.commit()
        print("Seeding completed successfully.")
        print(f"  Roles: {', '.join(ROLE_PERMISSIONS.keys())}")
        print(f"  Permissions: {len(PERMISSIONS)}")

        # Create test users if they don't exist
        test_users = [
            {"name": "Admin User", "email": "admin@lms.com", "password": "admin123", "role": "admin"},
            {"name": "Teacher User", "email": "teacher@lms.com", "password": "teacher123", "role": "teacher"},
            {"name": "Student User", "email": "student@lms.com", "password": "student123", "role": "student"},
        ]

        for test_user in test_users:
            existing = db.query(User).filter(User.email == test_user["email"]).first()
            if not existing:
                role = db.query(Role).filter(Role.name == test_user["role"]).first()
                user = User(
                    name=test_user["name"],
                    email=test_user["email"],
                    password=make_hash(test_user["password"])
                )
                user.roles.append(role)
                db.add(user)
                db.commit()
                print(f"  Created test user: {test_user['email']} ({test_user['role']})")

        print("\nTest Login Credentials:")
        print("  Admin: admin@lms.com / admin123")
        print("  Teacher: teacher@lms.com / teacher123")
        print("  Student: student@lms.com / student123")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()