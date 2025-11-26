"""Create embalagens table (standalone packaging catalog)

Revision ID: 20251126_2_create_embalagens_table
Revises: 20251126_allow_local_code_change
Create Date: 2025-11-26

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251126_2_create_embalagens_table'
down_revision = '20251126_allow_local_code_change'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'embalagens',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('descricao', sa.String(length=100), nullable=False),
        sa.Column('unidade_id', sa.Integer(), sa.ForeignKey('unidades.id'), nullable=False),
        sa.Column('ativo', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_embalagens_id', 'embalagens', ['id'], unique=True)
    op.create_index('ix_embalagens_descricao', 'embalagens', ['descricao'])
    op.create_index('ix_embalagens_unidade_id', 'embalagens', ['unidade_id'])


def downgrade():
    op.drop_table('embalagens')
