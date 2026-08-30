from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint, text
from sqlalchemy.orm import relationship

from app.db.base import Base


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint(
            "cart_id",
            "product_id",
            name="unique_cart_product",
        ),
    )

    cart_item_id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    cart_id = Column(
        Integer,
        ForeignKey("carts.cart_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.product_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    quantity = Column(
        Integer,
        nullable=False,
    )

    added_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    cart = relationship(
        "Cart",
        back_populates="items",
    )
