from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    address_id = Column(
        Integer,
        ForeignKey("addresses.address_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    order_status = Column(
        String(30),
        nullable=False,
        server_default=text("'PLACED'"),
    )

    payment_method = Column(String(30), nullable=False)
    subtotal_amount = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(
        Numeric(10, 2),
        nullable=False,
        server_default=text("0"),
    )
    total_amount = Column(Numeric(10, 2), nullable=False)

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

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )
