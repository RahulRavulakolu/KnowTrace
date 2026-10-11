"""Add per-user misconception severity tracking."""

revision = "misconception_tracking"
down_revision = "question_validation_metadata"
branch_labels = None
depends_on = None


def upgrade() -> None:
    import sqlalchemy as sa
    from alembic import op

    op.create_table(
        "user_misconceptions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column(
            "misconception_id",
            sa.String(36),
            sa.ForeignKey("misconceptions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("severity", sa.Float(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(20), nullable=False, server_default="resolved"),
        sa.Column("evidence_attempt_ids", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("last_updated", sa.DateTime(), nullable=False),
        sa.Column("remediation_pack", sa.JSON(), nullable=False, server_default="{}"),
        sa.UniqueConstraint("user_id", "misconception_id", name="uq_user_misconception"),
    )


def downgrade() -> None:
    from alembic import op

    op.drop_table("user_misconceptions")
