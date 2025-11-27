"""Add codigo_alternativo to itens table

Revision ID: 20251127_add_codigo_alternativo_to_itens
Revises: 20251127_add_fator_conversao_to_embalagens
Create Date: 2025-11-27

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251127_add_codigo_alternativo_to_itens'
down_revision = '20251127_add_fator_conversao_to_embalagens'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('itens', sa.Column('codigo_alternativo', sa.String(length=50), nullable=True))
    op.create_index('ix_itens_codigo_alternativo', 'itens', ['codigo_alternativo'])


def downgrade():
    op.drop_index('ix_itens_codigo_alternativo', 'itens')
    op.drop_column('itens', 'codigo_alternativo')
