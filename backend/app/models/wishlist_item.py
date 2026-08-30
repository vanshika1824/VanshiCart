from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint, text
from sqlalchemy.orm import relationship

from app.db.base import Base


class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    __table_args__ = (
        UniqueConstraint(
            "wishlist_id",
            "product_id",
            name="unique_wishlist_product",
        ),
    )

    wishlist_item_id = Column(Integer, primary_key=True, index=True)

    wishlist_id = Column(
        Integer,
        ForeignKey("wishlists.wishlist_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.product_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    added_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    wishlist = relationship(
        "Wishlist",
        back_populates="items",
    )
