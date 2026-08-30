from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CartItemCreate(BaseModel):
    product_id: int = Field(ge=1)
    quantity: int = Field(ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cart_item_id: int
    cart_id: int
    product_id: int
    quantity: int
    added_at: datetime


class CartResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cart_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    items: list[CartItemResponse]
