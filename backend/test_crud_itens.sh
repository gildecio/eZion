#!/bin/bash

echo "🧪 Testando CRUD de Itens"
echo "=========================="
echo ""

BASE_URL="http://localhost:8000/api/v1/estoque/itens"

# 1. Listar itens (vazio)
echo "1️⃣ Listar itens..."
RESULT=$(curl -s -L "$BASE_URL")
echo "✓ Resposta: $RESULT"
echo ""

# 2. Criar item 1
echo "2️⃣ Criar item 'Mouse Logitech'..."
RESULT=$(curl -s -L -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Mouse Logitech","tipo":"Produto"}')
ITEM1_ID=$(echo "$RESULT" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "✓ Criado: ID=$ITEM1_ID"
echo "$RESULT"
echo ""

# 3. Criar item 2
echo "3️⃣ Criar item 'Papel A4'..."
RESULT=$(curl -s -L -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Papel A4","tipo":"Insumo"}')
ITEM2_ID=$(echo "$RESULT" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "✓ Criado: ID=$ITEM2_ID"
echo "$RESULT"
echo ""

# 4. Listar todos
echo "4️⃣ Listar todos os itens..."
RESULT=$(curl -s -L "$BASE_URL")
echo "✓ $RESULT"
echo ""

# 5. Buscar por ID
echo "5️⃣ Buscar item ID=$ITEM1_ID..."
RESULT=$(curl -s -L "$BASE_URL/$ITEM1_ID")
echo "✓ $RESULT"
echo ""

# 6. Atualizar item
echo "6️⃣ Atualizar item ID=$ITEM1_ID..."
RESULT=$(curl -s -L -X PUT "$BASE_URL/$ITEM1_ID" \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Mouse Logitech MX Master"}')
echo "✓ $RESULT"
echo ""

# 7. Excluir item
echo "7️⃣ Excluir item ID=$ITEM2_ID..."
STATUS=$(curl -s -L -w "%{http_code}" -X DELETE "$BASE_URL/$ITEM2_ID")
echo "✓ Status: $STATUS"
echo ""

# 8. Verificar exclusão
echo "8️⃣ Verificar exclusão (deve retornar 404)..."
STATUS=$(curl -s -L -w "%{http_code}" -o /dev/null "$BASE_URL/$ITEM2_ID")
echo "✓ Status: $STATUS"
echo ""

# 9. Validar campo obrigatório
echo "9️⃣ Validar campo obrigatório..."
RESULT=$(curl -s -L -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"tipo":"Produto"}')
echo "✓ $RESULT"
echo ""

echo "✅ Todos os testes concluídos!"
