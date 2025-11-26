"""Allow changing codigo of default local (ID=1)

Revision ID: 20251126_allow_local_code_change
Revises: 
Create Date: 2025-11-26

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '20251126_allow_local_code_change'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Drop trigger and function that blocks code change on local ID=1
    op.execute("DROP TRIGGER IF EXISTS prevent_default_local_code_change_trigger ON locais;")
    op.execute("DROP FUNCTION IF EXISTS prevent_default_local_code_change();")


def downgrade():
    # Recreate function and trigger if downgrade is needed
    op.execute("""
    CREATE OR REPLACE FUNCTION prevent_default_local_code_change() RETURNS trigger AS $$
    BEGIN
        IF OLD.id = 1 AND NEW.codigo != OLD.codigo THEN
            RAISE EXCEPTION 'Não é permitido alterar o código do local padrão "Não Informado" (ID=1)';
        END IF;
        RETURN NEW;
    END;$$ LANGUAGE plpgsql;
    """)
    op.execute("""
    CREATE TRIGGER prevent_default_local_code_change_trigger
    BEFORE UPDATE ON locais
    FOR EACH ROW EXECUTE FUNCTION prevent_default_local_code_change();
    """)
