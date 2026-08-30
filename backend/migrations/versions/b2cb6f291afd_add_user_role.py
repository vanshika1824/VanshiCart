"""add user role

Revision ID: b2cb6f291afd
Revises: 3e1037bcdec8
Create Date: 2026-08-30 12:36:01.218093

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b2cb6f291afd"
down_revision: Union[str, Sequence[str], None] = "3e1037bcdec8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add role column to users table."""
    op.add_column(
        "users",
        sa.Column(
            "role",
            sa.String(length=20),
            nullable=False,
            server_default="customer",
        ),
    )


def downgrade() -> None:
    """Remove role column from users table."""
    op.drop_column("users", "role")