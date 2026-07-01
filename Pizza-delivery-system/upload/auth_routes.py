from fastapi import APIRouter,status,Depends
from fastapi.exceptions import HTTPException
from database import get_db
from schemas import SignUpModel,LoginModel
from models import User
from fastapi.exceptions import HTTPException
from werkzeug.security import generate_password_hash , check_password_hash
from jwt_helper import AuthJWT
from fastapi.encoders import jsonable_encoder
from sqlalchemy import func, or_
from sqlalchemy.orm import Session


auth_router=APIRouter(
    prefix='/auth',
    tags=['auth']

)


def clean_username(username: str) -> str:
    return username.strip()


def clean_email(email: str) -> str:
    return email.strip().lower()


def clean_password(password: str) -> str:
    return password.strip()

@auth_router.get('/')
async def hello(Authorize:AuthJWT=Depends()):

    """
        ## Sample hello world route
    
    """
    try:
        Authorize.jwt_required()

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token"
        )

    return {"message":"Hello World"}


@auth_router.post('/signup',
    status_code=status.HTTP_201_CREATED
)
async def signup(user:SignUpModel, db: Session = Depends(get_db)):
    """
        ## Create a user
        This requires the following
        ```
                username:int
                email:str
                password:str
                is_staff:bool
                is_active:bool

        ```
    
    """


    username=clean_username(user.username)
    email=clean_email(user.email)
    password=clean_password(user.password)

    db_email=db.query(User).filter(func.lower(User.email)==email).first()

    if db_email is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists. Please sign in instead."
        )

    db_username=db.query(User).filter(func.lower(User.username)==username.lower()).first()

    if db_username is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username already exists. Please sign in instead."
        )

    new_user=User(
        name=user.name.strip() if user.name else None,
        username=username,
        email=email,
        password=generate_password_hash(password),
        is_active=user.is_active,
        is_staff=user.is_staff
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return jsonable_encoder({
        "id": new_user.id,
        "name": new_user.name,
        "username": new_user.username,
        "email": new_user.email,
        "is_staff": new_user.is_staff,
        "is_active": new_user.is_active,
    })



#login route

@auth_router.post('/login',status_code=200)
async def login(user:LoginModel,Authorize:AuthJWT=Depends(), db: Session = Depends(get_db)):
    """     
        ## Login a user
        This requires
            ```
                username:str
                password:str
            ```
        and returns a token pair `access` and `refresh`
    """
    login_name=clean_username(user.username)
    password=clean_password(user.password)

    db_user=db.query(User).filter(
        or_(
            func.lower(User.username)==login_name.lower(),
            func.lower(User.email)==login_name.lower()
        )
    ).first()

    if db_user and db_user.password and check_password_hash(db_user.password, password):
        access_token=Authorize.create_access_token(subject=db_user.username)
        refresh_token=Authorize.create_refresh_token(subject=db_user.username)

        response={
            "access":access_token,
            "refresh":refresh_token,
            "name": db_user.name,
            "username": db_user.username,
        }

        return jsonable_encoder(response)

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid Username Or Password"
    )



#refreshing tokens

@auth_router.get('/refresh')
async def refresh_token(Authorize:AuthJWT=Depends()):
    """
    ## Create a fresh token
    This creates a fresh token. It requires an refresh token.
    """


    try:
        Authorize.jwt_refresh_token_required()

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please provide a valid refresh token"
        ) 

    current_user=Authorize.get_jwt_subject()

    
    access_token=Authorize.create_access_token(subject=current_user)

    return jsonable_encoder({"access":access_token})
