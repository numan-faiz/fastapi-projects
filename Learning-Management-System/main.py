from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.models.role import Role
from app.models.user import User
from app.models.subject import Subject
from app.models.announcement import Announcement
import app.models.attendance
import app.models.activity_log


from app.routers.authentication import router as auth_router
from app.routers.teacher import router as teacher_router
from app.routers.student import router as student_router
from app.routers.subjects import router as subject_router
from app.routers.attendance import router as attendance_router
from app.routers.announcement import router as announcement_router
from app.routers.activity_log import router as activity_log_router


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(teacher_router)
app.include_router(student_router)
app.include_router(subject_router)
app.include_router(attendance_router)
app.include_router(announcement_router)
app.include_router(activity_log_router)


Base.metadata.create_all(engine)