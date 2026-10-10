"""Persist question evidence and validation metadata."""

from alembic import op
import sqlalchemy as sa

revision = "question_validation_metadata"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("questions", sa.Column("support_span", sa.Text(), nullable=True))
    op.add_column("questions", sa.Column("source_chunk_id", sa.String(length=36), nullable=True))
    op.add_column("questions", sa.Column("numerical_python", sa.Text(), nullable=True))
    op.add_column("questions", sa.Column("marking_rubric", sa.Text(), nullable=True))
    op.add_column("questions", sa.Column("validation_report", sa.JSON(), nullable=False, server_default="{}"))
    op.add_column("questions", sa.Column("embedding", sa.JSON(), nullable=True))
    op.add_column("attempts", sa.Column("misconception_id", sa.String(length=36), nullable=True))


def downgrade() -> None:
    for name in ("validation_report", "marking_rubric", "numerical_python", "source_chunk_id", "support_span"):
        op.drop_column("questions", name)
    op.drop_column("questions", "embedding")
    op.drop_column("attempts", "misconception_id")
