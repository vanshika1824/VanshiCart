from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CheckoutCreate(BaseModel):
    address_id: int = Field(ge=1)
    payment_method: str = Field(min_length=1, max_length=30)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_item_id: int
    order_id: int
    product_id: int
    product_name: str
    quantity: int
    price_at_purchase: Decimal
    subtotal: Decimal


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_id: int
    user_id: int
    address_id: int
    order_status: str
    payment_method: str
    subtotal_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemResponse]
