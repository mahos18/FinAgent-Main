"""create correct budgets and goals tables

Revision ID: 16c9ed25a8c0
Revises: 196d53e286eb
Create Date: 2025-11-27 17:37:14.916480

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "16c9ed25a8c0"
down_revision = "196d53e286eb"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade schema."""

    # Drop old budget + goal tables
    op.drop_index(op.f("ix_budgets_id"), table_name="budgets")
    op.drop_table("budgets")

    op.drop_index(op.f("ix_goals_id"), table_name="goals")
    op.drop_table("goals")

    # Drop unused table
    op.drop_table("playing_with_neon")

    # Add FK field to refresh_tokens
    op.add_column("refresh_tokens", sa.Column("user_id", sa.Integer(), nullable=False))

    # Remove old constraint & recreate clean indexes
    op.drop_constraint(op.f("refresh_tokens_jti_key"), "refresh_tokens", type_="unique")
    op.create_index(op.f("ix_refresh_tokens_id"), "refresh_tokens", ["id"], unique=False)
    op.create_index(
        op.f("ix_refresh_tokens_jti"), "refresh_tokens", ["jti"], unique=True
    )

    # Add FK: refresh_tokens.user_id → users.id
    op.create_foreign_key(
        None, "refresh_tokens", "users", ["user_id"], ["id"], ondelete="CASCADE"
    )

    # Fix transactions table fields (without touching ID)
    op.alter_column(
        "transactions",
        "amount",
        type_=sa.Float(),
        existing_type=sa.NUMERIC(),
        existing_nullable=False,
    )

    op.alter_column("transactions", "merchant", nullable=True)
    op.alter_column("transactions", "category", nullable=True)

    op.alter_column(
        "transactions",
        "source",
        nullable=False,
        existing_server_default=sa.text("'manual'::character varying"),
    )

    op.alter_column("transactions", "user_id", nullable=True)

    op.create_index(op.f("ix_transactions_id"), "transactions", ["id"], unique=False)

    # Users table edits
    op.alter_column("users", "name", nullable=True)
    op.alter_column("users", "occupation", nullable=True)
    op.alter_column("users", "monthlyIncome", nullable=True)

    # Replace unique email constraint with index
    op.drop_constraint(op.f("users_email_key"), "users", type_="unique")
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")

    op.create_unique_constraint(
        op.f("users_email_key"),
        "users",
        ["email"],
        postgresql_nulls_not_distinct=False,
    )

    op.alter_column("users", "monthlyIncome", nullable=True)
    op.alter_column("users", "occupation", nullable=True)
    op.alter_column("users", "name", nullable=False)

    op.drop_index(op.f("ix_transactions_id"), table_name="transactions")

    op.alter_column("transactions", "user_id", nullable=False)
    op.alter_column("transactions", "source", nullable=True)
    op.alter_column("transactions", "category", nullable=False)
    op.alter_column("transactions", "merchant", nullable=False)
    op.alter_column(
        "transactions",
        "amount",
        type_=sa.NUMERIC(),
        existing_type=sa.Float(),
        existing_nullable=False,
    )

    op.drop_constraint(None, "refresh_tokens", type_="foreignkey")
    op.drop_index(op.f("ix_refresh_tokens_jti"), table_name="refresh_tokens")
    op.drop_index(op.f("ix_refresh_tokens_id"), table_name="refresh_tokens")
    op.create_unique_constraint(
        op.f("refresh_tokens_jti_key"),
        "refresh_tokens",
        ["jti"],
        postgresql_nulls_not_distinct=False,
    )

    op.drop_column("refresh_tokens", "user_id")

    # recreate dropped tables
    op.create_table(
        "playing_with_neon",
        sa.Column("id", sa.INTEGER(), primary_key=True),
        sa.Column("name", sa.TEXT(), nullable=False),
        sa.Column("value", sa.REAL(), nullable=True),
    )

    op.create_table(
        "goals",
        sa.Column("id", sa.INTEGER(), primary_key=True),
        sa.Column("user_id", sa.INTEGER(), nullable=True),
        sa.Column("title", sa.VARCHAR(), nullable=False),
        sa.Column("target_amount", sa.DOUBLE_PRECISION(), nullable=False),
        sa.Column("saved_amount", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("deadline", sa.DATE(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )

    op.create_index(op.f("ix_goals_id"), "goals", ["id"], unique=False)

    op.create_table(
        "budgets",
        sa.Column("id", sa.INTEGER(), primary_key=True),
        sa.Column("user_id", sa.INTEGER(), nullable=True),
        sa.Column("category", sa.VARCHAR(), nullable=False),
        sa.Column("amount", sa.DOUBLE_PRECISION(), nullable=False),
        sa.Column("period", sa.VARCHAR(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )

    op.create_index(op.f("ix_budgets_id"), "budgets", ["id"], unique=False)
