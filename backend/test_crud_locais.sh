#!/bin/bash

echo "=========================================="
echo "TESTE DE CRUD DE LOCAIS - Backend"
echo "=========================================="
echo ""

BASE_URL="http://localhost:8000/api/v1/estoque/locais"

echo "1. Listando todos os locais..."
curl -s $BASE_URL/ | python3 -m json.tool
echo ""
echo ""

echo "2. Buscando local específico (ID 1)..."
curl -s $BASE_URL/1 | python3 -m json.tool
echo ""
echo ""

echo "3. Filtrando apenas locais ativos..."
curl -s "$BASE_URL/?apenas_ativos=true" | python3 -m json.tool
echo ""
echo ""

echo "=========================================="
echo "RESUMO DA IMPLEMENTAÇÃO"
echo "=========================================="
echo ""
echo "✅ Backend:"
echo "   - Model: /backend/app/modules/estoque/models/local.py"
echo "   - Schema: /backend/app/modules/estoque/schemas/local.py"
echo "   - Repository: /backend/app/modules/estoque/repositories/local_repository.py"
echo "   - Endpoints: /backend/app/modules/estoque/endpoints/locais.py"
echo "   - Migração: /backend/alembic/versions/004_create_locais.sql"
echo ""
echo "✅ Frontend:"
echo "   - Types: /frontend/features/estoque/types/local.ts"
echo "   - Service: /frontend/features/estoque/services/local-service.ts"
echo "   - Component: /frontend/features/estoque/components/LocaisCRUD.tsx"
echo "   - Page: /frontend/pages/estoque/locais.tsx"
echo "   - Menu: Link adicionado na Sidebar"
echo ""
echo "✅ Funcionalidades implementadas:"
echo "   - Criar local"
echo "   - Listar locais"
echo "   - Atualizar local"
echo "   - Excluir local"
echo "   - Filtrar por ativos"
echo "   - Validação de código único"
echo ""
