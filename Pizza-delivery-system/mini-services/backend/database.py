from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base,sessionmaker


DATABASE_PATH = Path(__file__).resolve().parent / "pizza.db"

engine=create_engine(f'sqlite:///{DATABASE_PATH}',
    echo=True,
    connect_args={"check_same_thread": False}
)

Base=declarative_base()

Session=sessionmaker()


# Dependency for per-request database sessions
def get_db():
    """
    Create a new database session for each request.
    The session is automatically closed after the request completes.
    This prevents session staleness and database locks.
    """
    db = Session(bind=engine)
    try:
        yield db
    finally:
        db.close()
