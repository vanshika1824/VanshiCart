from sqlalchemy import Column, DateTime, ForeignKey, Integer, text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    wishlist_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    items = relationship(
        "WishlistItem",
        back_populates="wishlist",
        cascade="all, delete-orphan",
    )
