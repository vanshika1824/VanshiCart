from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    product_id: int = Field(ge=1)
    order_item_id: int = Field(ge=1)
    rating: int = Field(ge=1, le=5)
    review_text: Optional[str] = None


class ReviewUpdate(BaseModel):
    rating: int = Field(default=None, ge=1, le=5)
    review_text: Optional[str] = None


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    review_id: int
    user_id: int
    product_id: int
    order_item_id: int
    rating: int
    review_text: Optional[str]
    created_at: datetime
    updated_at: datetime
