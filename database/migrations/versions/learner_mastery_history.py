"""Add explicit BKT state and mastery history."""

import sqlalchemy as sa
from alembic import op

revision = "learner_mastery_history"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "learner_mastery", sa.Column("n_obs", sa.Integer(), nullable=False, server_default="0")
    )
    op.add_column(
        "learner_mastery", sa.Column("half_life", sa.Float(), nullable=False, server_default="3.0")
    )
    op.create_table(
        "mastery_history",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column(
            "user_id",
            sa.String(length=36),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "concept_id",
            sa.String(length=36),
            sa.ForeignKey("concepts.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("p_before", sa.Float(), nullable=False),
        sa.Column("p_after", sa.Float(), nullable=False),
        sa.Column("p_eff", sa.Float(), nullable=False),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("correct", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("mastery_history")
    op.drop_column("learner_mastery", "half_life")
    op.drop_column("learner_mastery", "n_obs")
