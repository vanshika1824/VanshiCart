from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone_number: str | None = None
    profile_image: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str