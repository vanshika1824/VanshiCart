from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WishlistItemCreate(BaseModel):
    product_id: int = Field(ge=1)


class WishlistItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    wishlist_item_id: int
    wishlist_id: int
    product_id: int
    added_at: datetime


class WishlistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    wishlist_id: int
    user_id: int
    created_at: datetime
    items: list[WishlistItemResponse]
