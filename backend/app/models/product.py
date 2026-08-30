from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    product_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    selling_price = Column(
        Numeric(10, 2),
        nullable=False
    )

    original_price = Column(
        Numeric(10, 2),
        nullable=False
    )

    quantity = Column(
        Numeric(10, 3),
        nullable=False
    )

    unit = Column(
        String(30),
        nullable=False
    )

    stock_quantity = Column(
        Integer,
        nullable=False,
        server_default=text("0")
    )

    brand_id = Column(
        Integer,
        ForeignKey("brands.brand_id"),
        nullable=True
    )

    image_url = Column(
        Text,
        nullable=True
    )

    is_active = Column(
        Boolean,
        nullable=False,
        server_default=text("true")
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP")
    )

    brand = relationship(
        "Brand",
        back_populates="products"
    )

    category_links = relationship(
        "ProductCategory",
        back_populates="product",
        cascade="all, delete-orphan",
    )
