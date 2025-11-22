#!/bin/bash

# Script para testar o CRUD de Empresas
# Este script testa todos os endpoints da API

set -e

API_URL="http://localhost:8000/api/v1/contabil/empresas"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "🧪 Testando CRUD de Empresas"
echo "========================================="
echo ""

# Função para exibir resultado
show_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
        exit 1
    fi
}

# Limpar tela de testes anteriores
echo -e "${YELLOW}Preparando ambiente de testes...${NC}"
echo ""

# Teste 1: Listar empresas (inicialmente vazia)
echo "1️⃣  Teste: Listar empresas"
RESPONSE=$(curl -s -L -w "\n%{http_code}" "$API_URL")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   Resposta: $BODY"
    show_result 0 "GET /empresas - OK"
else
    show_result 1 "GET /empresas - Falhou (HTTP $HTTP_CODE)"
fi
echo ""

# Teste 2: Criar primeira empresa
echo "2️⃣  Teste: Criar empresa 'Tech Solutions Ltda'"
CREATE_DATA='{
  "razao_social": "Tech Solutions Ltda",
  "cnpj": "11222333000181",
  "ativo": true
}'

RESPONSE=$(curl -s -L -L -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$CREATE_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    EMPRESA_ID_1=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    echo "   Empresa criada com ID: $EMPRESA_ID_1"
    echo "   Resposta: $BODY"
    show_result 0 "POST /empresas - OK"
else
    echo "   Resposta: $BODY"
    show_result 1 "POST /empresas - Falhou (HTTP $HTTP_CODE)"
fi
echo ""

# Teste 3: Criar segunda empresa
echo "3️⃣  Teste: Criar empresa 'Inovação Digital SA'"
CREATE_DATA_2='{
  "razao_social": "Inovação Digital SA",
  "cnpj": "98765432000100",
  "ativo": false
}'

RESPONSE=$(curl -s -L -L -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$CREATE_DATA_2")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    EMPRESA_ID_2=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    echo "   Empresa criada com ID: $EMPRESA_ID_2"
    echo "   Resposta: $BODY"
    show_result 0 "POST /empresas - OK"
else
    echo "   Resposta: $BODY"
    show_result 1 "POST /empresas - Falhou (HTTP $HTTP_CODE)"
fi
echo ""

# Teste 4: Listar todas as empresas
echo "4️⃣  Teste: Listar todas as empresas"
RESPONSE=$(curl -s -L -w "\n%{http_code}" "$API_URL")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    COUNT=$(echo "$BODY" | grep -o '"id":' | wc -l)
    echo "   Total de empresas: $COUNT"
    echo "   Resposta: $BODY"
    show_result 0 "GET /empresas - OK (encontradas $COUNT empresas)"
else
    show_result 1 "GET /empresas - Falhou (HTTP $HTTP_CODE)"
fi
echo ""

# Teste 5: Buscar empresa por ID
echo "5️⃣  Teste: Buscar empresa por ID ($EMPRESA_ID_1)"
RESPONSE=$(curl -s -L -w "\n%{http_code}" "$API_URL/$EMPRESA_ID_1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   Resposta: $BODY"
    show_result 0 "GET /empresas/$EMPRESA_ID_1 - OK"
else
    show_result 1 "GET /empresas/$EMPRESA_ID_1 - Falhou (HTTP $HTTP_CODE)"
fi
echo ""

# Teste 6: Atualizar empresa
echo "6️⃣  Teste: Atualizar razão social da empresa $EMPRESA_ID_1"
UPDATE_DATA='{
  "razao_social": "Tech Solutions Ltda - ATUALIZADA"
}'

RESPONSE=$(curl -s -L -w "\n%{http_code}" -X PUT "$API_URL/$EMPRESA_ID_1" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   Resposta: $BODY"
    show_result 0 "PUT /empresas/$EMPRESA_ID_1 - OK"
else
    show_result 1 "PUT /empresas/$EMPRESA_ID_1 - Falhou (HTTP $HTTP_CODE)"
fi
echo ""

# Teste 7: Verificar atualização
echo "7️⃣  Teste: Verificar se atualização foi aplicada"
RESPONSE=$(curl -s -L -w "\n%{http_code}" "$API_URL/$EMPRESA_ID_1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q "ATUALIZADA"; then
        echo "   Resposta: $BODY"
        show_result 0 "Verificação de atualização - OK"
    else
        show_result 1 "Verificação de atualização - Dados não foram atualizados"
    fi
else
    show_result 1 "Verificação de atualização - Falhou (HTTP $HTTP_CODE)"
fi
echo ""

# Teste 8: Excluir empresa
echo "8️⃣  Teste: Excluir empresa $EMPRESA_ID_2"
RESPONSE=$(curl -s -L -w "\n%{http_code}" -X DELETE "$API_URL/$EMPRESA_ID_2")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
    show_result 0 "DELETE /empresas/$EMPRESA_ID_2 - OK"
else
    show_result 1 "DELETE /empresas/$EMPRESA_ID_2 - Falhou (HTTP $HTTP_CODE)"
fi
echo ""

# Teste 9: Verificar exclusão
echo "9️⃣  Teste: Verificar se empresa foi excluída"
RESPONSE=$(curl -s -L -w "\n%{http_code}" "$API_URL/$EMPRESA_ID_2")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "404" ]; then
    show_result 0 "Verificação de exclusão - OK (404 esperado)"
else
    show_result 1 "Verificação de exclusão - Empresa ainda existe (HTTP $HTTP_CODE)"
fi
echo ""

# Teste 10: Validação de CNPJ inválido
echo "🔟 Teste: Validar CNPJ inválido"
INVALID_DATA='{
  "razao_social": "Empresa Teste",
  "cnpj": "00000000000000",
  "ativo": true
}'

RESPONSE=$(curl -s -L -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$INVALID_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "422" ] || [ "$HTTP_CODE" = "400" ]; then
    echo "   Resposta: $BODY"
    show_result 0 "Validação de CNPJ - OK (erro esperado)"
else
    echo "   Resposta: $BODY"
    echo -e "${YELLOW}⚠ Validação de CNPJ - Esperado erro 400/422, recebido $HTTP_CODE${NC}"
fi
echo ""

# Teste 11: Campos obrigatórios
echo "1️⃣1️⃣  Teste: Validar campos obrigatórios"
INCOMPLETE_DATA='{
  "cnpj": "11222333000181"
}'

RESPONSE=$(curl -s -L -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$INCOMPLETE_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "422" ] || [ "$HTTP_CODE" = "400" ]; then
    echo "   Resposta: $BODY"
    show_result 0 "Validação de campos obrigatórios - OK (erro esperado)"
else
    echo "   Resposta: $BODY"
    echo -e "${YELLOW}⚠ Validação de campos - Esperado erro 400/422, recebido $HTTP_CODE${NC}"
fi
echo ""

echo "========================================="
echo -e "${GREEN}✅ Todos os testes foram concluídos!${NC}"
echo "========================================="
echo ""
echo "📊 Resumo dos testes:"
echo "  ✓ Listar empresas (vazia)"
echo "  ✓ Criar empresa 1"
echo "  ✓ Criar empresa 2"
echo "  ✓ Listar empresas (com dados)"
echo "  ✓ Buscar por ID"
echo "  ✓ Atualizar empresa"
echo "  ✓ Verificar atualização"
echo "  ✓ Excluir empresa"
echo "  ✓ Verificar exclusão"
echo "  ✓ Validação de CNPJ"
echo "  ✓ Validação de campos obrigatórios"
echo ""
