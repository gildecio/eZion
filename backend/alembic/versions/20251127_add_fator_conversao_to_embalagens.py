"""Add fator_conversao to embalagens table

Revision ID: 20251127_add_fator_conversao_to_embalagens
Revises: 20251126_2_create_embalagens_table
Create Date: 2025-11-27

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251127_add_fator_conversao_to_embalagens'
down_revision = '20251126_2_create_embalagens_table'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('embalagens', sa.Column('fator_conversao', sa.Numeric(15, 6), nullable=False, server_default='1'))


def downgrade():
    op.drop_column('embalagens', 'fator_conversao')
