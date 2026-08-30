from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Brand(Base):
    __tablename__ = "brands"

    brand_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(150),
        nullable=False,
        unique=True
    )

    logo_url = Column(
        Text,
        nullable=True
    )

    description = Column(
        Text,
        nullable=True
    )

    products = relationship(
        "Product",
        back_populates="brand"
    )