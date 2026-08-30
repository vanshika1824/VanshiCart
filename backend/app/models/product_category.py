from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import Base


class ProductCategory(Base):
    __tablename__ = "product_categories"
    __table_args__ = (
        UniqueConstraint(
            "product_id",
            "category_id",
            name="unique_product_category",
        ),
    )

    product_category_id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.product_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.category_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    product = relationship(
        "Product",
        back_populates="category_links",
    )

    category = relationship(
        "Category",
        back_populates="product_links",
    )
