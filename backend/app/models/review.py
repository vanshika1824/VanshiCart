from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text, UniqueConstraint, text

from app.db.base import Base


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "product_id",
            name="unique_user_product_review",
        ),
    )

    review_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.product_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    order_item_id = Column(
        Integer,
        ForeignKey("order_items.order_item_id", ondelete="CASCADE"),
        nullable=False,
    )

    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
