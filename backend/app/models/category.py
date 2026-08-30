from sqlalchemy import Boolean, Column, Integer, String, Text, text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Category(Base):
    __tablename__ = "categories"

    category_id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(100),
        nullable=False,
        unique=True,
    )

    image_url = Column(
        Text,
        nullable=True,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        server_default=text("true"),
    )

    product_links = relationship(
        "ProductCategory",
        back_populates="category",
        cascade="all, delete-orphan",
    )
