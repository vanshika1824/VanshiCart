from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    selling_price: Decimal
    original_price: Decimal
    quantity: Decimal
    unit: str = Field(min_length=1, max_length=30)
    stock_quantity: int = Field(default=0, ge=0)
    brand_id: Optional[int] = None
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: str = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    selling_price: Decimal = None
    original_price: Decimal = None
    quantity: Decimal = None
    unit: str = Field(default=None, min_length=1, max_length=30)
    stock_quantity: int = Field(default=None, ge=0)
    brand_id: Optional[int] = None
    image_url: Optional[str] = None


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: int
    name: str
    description: Optional[str]
    selling_price: Decimal
    original_price: Decimal
    quantity: Decimal
    unit: str
    stock_quantity: int
    brand_id: Optional[int]
    image_url: Optional[str]
    is_active: bool
