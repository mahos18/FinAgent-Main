"""conversation table

Revision ID: d3096dee6508
Revises: 16c9ed25a8c0
Create Date: 2025-11-27 22:15:21.412451

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d3096dee6508"
down_revision: Union[str, Sequence[str], None] = "16c9ed25a8c0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # Remove old tables
    op.drop_index(op.f("ix_budgets_id"), table_name="budgets")
    op.drop_table("budgets")

    op.drop_index(op.f("ix_goals_id"), table_name="goals")
    op.drop_table("goals")

    # ------------------------------------
    # FIX NULL values before enforcing NOT NULL
    # ------------------------------------

    # Occupation was null for some users
    op.execute('UPDATE users SET "occupation" = \'Unknown\' WHERE "occupation" IS NULL;')

    # POSTGRES COLUMN IS LOWERCASED -> "monthlyIncome" must be quoted
    op.execute('UPDATE users SET "monthlyIncome" = 0 WHERE "monthlyIncome" IS NULL;')

    # Now apply NOT NULL safely
    op.alter_column(
        "users",
        "occupation",
        existing_type=sa.VARCHAR(),
        nullable=False,
    )

    op.alter_column(
        "users",
        "monthlyIncome",
        existing_type=sa.INTEGER(),
        nullable=False,
    )


def downgrade() -> None:

    op.alter_column(
        "users",
        "monthlyIncome",
        existing_type=sa.INTEGER(),
        nullable=True,
    )

    op.alter_column(
        "users",
        "occupation",
        existing_type=sa.VARCHAR(),
        nullable=True,
    )

    op.create_table(
        "goals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("target_amount", sa.Float(), nullable=False),
        sa.Column("saved_amount", sa.Float(), nullable=True),
        sa.Column("deadline", sa.Date(), nullable=True),
    )
    op.create_index(op.f("ix_goals_id"), "goals", ["id"])

    op.create_table(
        "budgets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("period", sa.String(), nullable=True),
    )
    op.create_index(op.f("ix_budgets_id"), "budgets", ["id"])
