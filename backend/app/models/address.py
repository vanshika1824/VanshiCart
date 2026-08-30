from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, text

from app.db.base import Base


class Address(Base):
    __tablename__ = "addresses"

    address_id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    recipient_name = Column(String(150), nullable=False)
    recipient_phone = Column(String(20), nullable=False)
    house_no = Column(String(100), nullable=False)
    street = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)
    landmark = Column(String(255), nullable=True)
    address_type = Column(String(30), nullable=True)

    is_default = Column(
        Boolean,
        nullable=False,
        server_default=text("false"),
    )
