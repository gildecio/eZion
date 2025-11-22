#!/bin/bash

# Script para testar consulta de Saldos de Estoque

BASE_URL="http://localhost:8000/api/v1/estoque"

echo "=========================================="
echo "Teste de Consulta - Saldos de Estoque"
echo "=========================================="

echo -e "\n1. Consultando todos os saldos"
curl -s "${BASE_URL}/saldos/" | python3 -m json.tool

echo -e "\n=========================================="
echo "2. Consultando saldos com filtros"
echo "=========================================="

# Pegar primeiro item da lista
ITEM_ID=$(curl -s "${BASE_URL}/itens/" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else 1)" 2>/dev/null)
echo -e "\nFiltro por Item ID: $ITEM_ID"
curl -s "${BASE_URL}/saldos/?item_id=${ITEM_ID}" | python3 -m json.tool

# Pegar primeiro local da lista
LOCAL_ID=$(curl -s "${BASE_URL}/locais/" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else 1)" 2>/dev/null)
echo -e "\nFiltro por Local ID: $LOCAL_ID"
curl -s "${BASE_URL}/saldos/?local_id=${LOCAL_ID}" | python3 -m json.tool

echo -e "\n=========================================="
echo "3. Consultando saldo específico por ID"
echo "=========================================="

SALDO_ID=$(curl -s "${BASE_URL}/saldos/" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else 1)" 2>/dev/null)
echo -e "\nBuscando saldo ID: $SALDO_ID"
curl -s "${BASE_URL}/saldos/${SALDO_ID}" | python3 -m json.tool

echo -e "\n=========================================="
echo "4. Consultando saldos por múltiplos filtros"
echo "=========================================="

echo -e "\nItem + Local:"
curl -s "${BASE_URL}/saldos/?item_id=${ITEM_ID}&local_id=${LOCAL_ID}" | python3 -m json.tool

echo -e "\n=========================================="
echo "Testes de Saldos Concluídos!"
echo "=========================================="
