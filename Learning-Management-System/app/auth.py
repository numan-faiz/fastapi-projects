from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta, timezone

load_dotenv()

from app.database import get_db
from app.models.user import User

#  ----- geting Token -----
session = HTTPBearer()

#  ----- jwt setting -----
exp_time = os.getenv("JWT_EXPIRE_TIME", 30)
secret_key = os.getenv("JWT_SECRET_KEY")
algorithm = os.getenv("JWT_ALGORITHM", "HS256")

#  ----- Password Hashing -----
crypt_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def make_hash(pwd: str) -> str:
    return crypt_context.hash(pwd)

def verify_hash(pwd: str, hash_pwd) -> bool:
    return crypt_context.verify(pwd, hash_pwd)

#  ----- JWT Token -----
def create_access_token(data: dict) -> str:
    payload = data.copy()

    exp = datetime.now(timezone.utc) + timedelta(
        minutes=int(exp_time)
    )
    payload["exp"] = exp

    return jwt.encode(
        payload,
        secret_key,
        algorithm
    )

# ----- JWT TOKEN Decode -----
def get_current_user(db=Depends(get_db), cred: HTTPAuthorizationCredentials = Depends(session)):
    credentials_exc = HTTPException(
        status_code=401,
        detail="Could not validate Credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(cred.credentials, secret_key, algorithm)
        user_id = payload.get("id")
        if user_id is None:
            raise credentials_exc
    except jwt.PyJWTError:
        raise credentials_exc
    user = db.get(User, user_id)
    if user is None:
        raise credentials_exc
    return user

# ----- Role Based Access Control -----

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles
    
    def __call__(self, user: User = Depends(get_current_user)) -> User:
        intersection = list(set(self.allowed_roles).intersection(user.role_name))

        if len(intersection) == 0:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission for this resource"
            )
        return user

# ----- Permission Checking -----
class PermissionCheck():
    def __init__(self, permission):
        self.permission = permission
    
    def __call__ (self, user = Depends(get_current_user)):
        if not self.permission in user.permission:
            raise HTTPException(
                status_code=401,
                detail="Permission denied"
            )
        return user