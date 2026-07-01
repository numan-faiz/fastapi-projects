import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse


class AuthJWT:
    """Simple JWT authentication wrapper using PyJWT."""

    _secret_key = None

    def __init__(self, req: Request = None):
        self._req = req
        self._token = None

    @classmethod
    def load_config(cls, func):
        """Decorator to load config from a callable that returns a Settings-like object."""
        cls._secret_key = func().authjwt_secret_key
        return func

    def _get_token_from_header(self):
        auth_header = self._req.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None
        return auth_header[7:]

    def jwt_required(self):
        token = self._get_token_from_header()
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid Authorization header"
            )
        try:
            self._token = jwt.decode(
                token,
                self._secret_key,
                algorithms=["HS256"]
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

    def jwt_refresh_token_required(self):
        """Alias for jwt_required (refresh tokens handled same way in basic setup)."""
        self.jwt_required()

    def get_jwt_subject(self):
        if self._token is None:
            return None
        return self._token.get("sub")

    def create_access_token(self, subject: str, expires_delta: timedelta = None):
        if expires_delta is None:
            expires_delta = timedelta(minutes=15)
        payload = {
            "sub": subject,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + expires_delta,
            "type": "access"
        }
        return jwt.encode(payload, self._secret_key, algorithm="HS256")

    def create_refresh_token(self, subject: str, expires_delta: timedelta = None):
        if expires_delta is None:
            expires_delta = timedelta(days=30)
        payload = {
            "sub": subject,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + expires_delta,
            "type": "refresh"
        }
        return jwt.encode(payload, self._secret_key, algorithm="HS256")
