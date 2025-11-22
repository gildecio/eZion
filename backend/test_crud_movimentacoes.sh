#!/bin/bash

# Script para testar CRUD de Movimentações de Estoque
# Testa as validações e regras de negócio

BASE_URL="http://localhost:8000/api/v1/estoque"
EMPRESA_ID=1

echo "=========================================="
echo "Teste de CRUD - Movimentações de Estoque"
echo "=========================================="

# Limpar dados anteriores (se necessário)
echo -e "\n1. Preparando ambiente de teste..."

# Criar item de teste
ITEM_RESPONSE=$(curl -s -X POST "${BASE_URL}/itens/" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": '${EMPRESA_ID}',
    "codigo": "ITEM-TEST-001",
    "descricao": "Item para Teste de Movimentação",
    "tipo_item": "Produto Acabado",
    "unidade_id": 1,
    "custo_medio": 10.00,
    "preco_venda": 20.00,
    "estoque_minimo": 5,
    "estoque_maximo": 100,
    "ativo": true
  }')

ITEM_ID=$(echo $ITEM_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
echo "Item criado - ID: $ITEM_ID"

# Criar local de teste 1
LOCAL1_RESPONSE=$(curl -s -X POST "${BASE_URL}/locais/" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": '${EMPRESA_ID}',
    "nome": "Almoxarifado Principal",
    "tipo": "Armazem",
    "ativo": true
  }')

LOCAL1_ID=$(echo $LOCAL1_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
echo "Local 1 criado - ID: $LOCAL1_ID"

# Criar local de teste 2
LOCAL2_RESPONSE=$(curl -s -X POST "${BASE_URL}/locais/" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": '${EMPRESA_ID}',
    "nome": "Loja Centro",
    "tipo": "Loja",
    "ativo": true
  }')

LOCAL2_ID=$(echo $LOCAL2_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
echo "Local 2 criado - ID: $LOCAL2_ID"

# Criar lote de teste
LOTE_RESPONSE=$(curl -s -X POST "${BASE_URL}/lotes/" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "LOTE-TEST-001",
    "item_id": '${ITEM_ID}',
    "data_fabricacao": "2025-01-01",
    "data_validade": "2026-01-01"
  }')

LOTE_ID=$(echo $LOTE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
echo "Lote criado - ID: $LOTE_ID"

echo -e "\n=========================================="
echo "2. Testando ENTRADA de Estoque"
echo "=========================================="

ENTRADA_RESPONSE=$(curl -s -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Entrada",
    "item_id": '${ITEM_ID}',
    "quantidade": 100,
    "unidade_id": 1,
    "lote_id": '${LOTE_ID}',
    "local_destino_id": '${LOCAL1_ID}',
    "documento": "NF-001",
    "observacoes": "Primeira entrada de teste",
    "custo_unitario": 10.50,
    "usuario": "admin"
  }')

echo "Resposta da Entrada:"
echo $ENTRADA_RESPONSE | python3 -m json.tool

ENTRADA_ID=$(echo $ENTRADA_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'ERRO'))" 2>/dev/null)
echo "Movimentação de Entrada criada - ID: $ENTRADA_ID"

# Verificar saldo após entrada
echo -e "\nVerificando saldo após entrada..."
SALDO_RESPONSE=$(curl -s "${BASE_URL}/saldos/?item_id=${ITEM_ID}&local_id=${LOCAL1_ID}")
echo $SALDO_RESPONSE | python3 -m json.tool

echo -e "\n=========================================="
echo "3. Testando SAÍDA de Estoque"
echo "=========================================="

SAIDA_RESPONSE=$(curl -s -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Saida",
    "item_id": '${ITEM_ID}',
    "quantidade": 30,
    "unidade_id": 1,
    "lote_id": '${LOTE_ID}',
    "local_origem_id": '${LOCAL1_ID}',
    "documento": "PV-001",
    "observacoes": "Venda para cliente",
    "usuario": "admin"
  }')

echo "Resposta da Saída:"
echo $SAIDA_RESPONSE | python3 -m json.tool

SAIDA_ID=$(echo $SAIDA_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'ERRO'))" 2>/dev/null)
echo "Movimentação de Saída criada - ID: $SAIDA_ID"

# Verificar saldo após saída
echo -e "\nVerificando saldo após saída (esperado: 70)..."
curl -s "${BASE_URL}/saldos/?item_id=${ITEM_ID}&local_id=${LOCAL1_ID}" | python3 -m json.tool

echo -e "\n=========================================="
echo "4. Testando TRANSFERÊNCIA entre Locais"
echo "=========================================="

TRANSF_RESPONSE=$(curl -s -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Transferencia",
    "item_id": '${ITEM_ID}',
    "quantidade": 20,
    "unidade_id": 1,
    "lote_id": '${LOTE_ID}',
    "local_origem_id": '${LOCAL1_ID}',
    "local_destino_id": '${LOCAL2_ID}',
    "documento": "TRANS-001",
    "observacoes": "Transferência para loja",
    "usuario": "admin"
  }')

echo "Resposta da Transferência:"
echo $TRANSF_RESPONSE | python3 -m json.tool

TRANSF_ID=$(echo $TRANSF_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'ERRO'))" 2>/dev/null)
echo "Movimentação de Transferência criada - ID: $TRANSF_ID"

# Verificar saldos após transferência
echo -e "\nVerificando saldo no Almoxarifado (esperado: 50)..."
curl -s "${BASE_URL}/saldos/?item_id=${ITEM_ID}&local_id=${LOCAL1_ID}" | python3 -m json.tool

echo -e "\nVerificando saldo na Loja (esperado: 20)..."
curl -s "${BASE_URL}/saldos/?item_id=${ITEM_ID}&local_id=${LOCAL2_ID}" | python3 -m json.tool

echo -e "\n=========================================="
echo "5. Testando AJUSTE POSITIVO"
echo "=========================================="

AJUSTE_POS_RESPONSE=$(curl -s -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Ajuste Positivo",
    "item_id": '${ITEM_ID}',
    "quantidade": 5,
    "unidade_id": 1,
    "lote_id": '${LOTE_ID}',
    "local_destino_id": '${LOCAL1_ID}',
    "documento": "INV-001",
    "observacoes": "Ajuste de inventário - encontrados itens extras",
    "custo_unitario": 10.50,
    "usuario": "admin"
  }')

echo "Resposta do Ajuste Positivo:"
echo $AJUSTE_POS_RESPONSE | python3 -m json.tool

echo -e "\nVerificando saldo após ajuste positivo (esperado: 55)..."
curl -s "${BASE_URL}/saldos/?item_id=${ITEM_ID}&local_id=${LOCAL1_ID}" | python3 -m json.tool

echo -e "\n=========================================="
echo "6. Testando VALIDAÇÕES"
echo "=========================================="

echo -e "\n6.1. Tentando saída sem saldo suficiente..."
curl -s -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Saida",
    "item_id": '${ITEM_ID}',
    "quantidade": 1000,
    "unidade_id": 1,
    "lote_id": '${LOTE_ID}',
    "local_origem_id": '${LOCAL1_ID}',
    "usuario": "admin"
  }' | python3 -m json.tool

echo -e "\n6.2. Tentando entrada sem local de destino..."
curl -s -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Entrada",
    "item_id": '${ITEM_ID}',
    "quantidade": 10,
    "unidade_id": 1,
    "custo_unitario": 10.00,
    "usuario": "admin"
  }' | python3 -m json.tool

echo -e "\n6.3. Tentando transferência com origem = destino..."
curl -s -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Transferencia",
    "item_id": '${ITEM_ID}',
    "quantidade": 10,
    "unidade_id": 1,
    "local_origem_id": '${LOCAL1_ID}',
    "local_destino_id": '${LOCAL1_ID}',
    "usuario": "admin"
  }' | python3 -m json.tool

echo -e "\n=========================================="
echo "7. Listando Movimentações"
echo "=========================================="

echo -e "\nTodas as movimentações:"
curl -s "${BASE_URL}/movimentacoes/" | python3 -m json.tool

echo -e "\nMovimentações filtradas por item:"
curl -s "${BASE_URL}/movimentacoes/?item_id=${ITEM_ID}" | python3 -m json.tool

echo -e "\nMovimentações filtradas por local:"
curl -s "${BASE_URL}/movimentacoes/?local_id=${LOCAL1_ID}" | python3 -m json.tool

echo -e "\nMovimentações filtradas por tipo:"
curl -s "${BASE_URL}/movimentacoes/?tipo=Entrada" | python3 -m json.tool

echo -e "\n=========================================="
echo "8. Resumo Final dos Saldos"
echo "=========================================="

echo -e "\nTodos os saldos:"
curl -s "${BASE_URL}/saldos/" | python3 -m json.tool

echo -e "\n=========================================="
echo "Testes Concluídos!"
echo "=========================================="
