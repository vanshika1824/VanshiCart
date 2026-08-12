from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import User
from app.schemas.user import UserCreate, UserLogin
from app.services.auth_service import hash_password, verify_password
from app.services.jwt_service import create_access_token
from app.services.security import get_current_user_id


app = FastAPI(
    title="VanshiCart API",
    version="1.0.0",
    description="AI-powered Grocery Shopping Platform",
)


@app.get("/")
def root():
    return {
        "message": "VanshiCart API is running!"
    }


@app.get("/users")
def get_users(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    result = db.execute(select(User))
    users = result.scalars().all()

    return [
        {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "is_active": user.is_active,
        }
        for user in users
    ]


@app.post("/users/register", status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(
        select(User).where(User.email == user_data.email)
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        phone_number=user_data.phone_number,
        profile_image=user_data.profile_image,
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully.",
        "user": {
            "user_id": new_user.user_id,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "email": new_user.email,
            "phone_number": new_user.phone_number,
            "profile_image": new_user.profile_image,
            "is_active": new_user.is_active,
        },
    }


@app.post("/users/login")
def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(User.email == user_data.email)
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    access_token = create_access_token(user.user_id)

    return {
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "profile_image": user.profile_image,
            "is_active": user.is_active,
        },
    }