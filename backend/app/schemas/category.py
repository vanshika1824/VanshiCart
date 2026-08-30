from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    image_url: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: str = Field(default=None, min_length=1, max_length=100)
    image_url: Optional[str] = None


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    category_id: int
    name: str
    image_url: Optional[str]
    is_active: bool
