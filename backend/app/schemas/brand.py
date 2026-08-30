from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class BrandCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    logo_url: Optional[str] = None
    description: Optional[str] = None


class BrandUpdate(BaseModel):
    name: str = Field(default=None, min_length=1, max_length=150)
    logo_url: Optional[str] = None
    description: Optional[str] = None


class BrandResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    brand_id: int
    name: str
    logo_url: Optional[str]
    description: Optional[str]
