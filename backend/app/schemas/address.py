from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AddressCreate(BaseModel):
    recipient_name: str = Field(min_length=1, max_length=150)
    recipient_phone: str = Field(min_length=1, max_length=20)
    house_no: str = Field(min_length=1, max_length=100)
    street: str = Field(min_length=1, max_length=255)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    pincode: str = Field(min_length=1, max_length=10)
    landmark: Optional[str] = Field(default=None, max_length=255)
    address_type: Optional[str] = Field(default=None, max_length=30)
    is_default: bool = False


class AddressUpdate(BaseModel):
    recipient_name: str = Field(default=None, min_length=1, max_length=150)
    recipient_phone: str = Field(default=None, min_length=1, max_length=20)
    house_no: str = Field(default=None, min_length=1, max_length=100)
    street: str = Field(default=None, min_length=1, max_length=255)
    city: str = Field(default=None, min_length=1, max_length=100)
    state: str = Field(default=None, min_length=1, max_length=100)
    pincode: str = Field(default=None, min_length=1, max_length=10)
    landmark: Optional[str] = Field(default=None, max_length=255)
    address_type: Optional[str] = Field(default=None, max_length=30)
    is_default: bool = None


class AddressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    address_id: int
    user_id: int
    recipient_name: str
    recipient_phone: str
    house_no: str
    street: str
    city: str
    state: str
    pincode: str
    landmark: Optional[str]
    address_type: Optional[str]
    is_default: bool
