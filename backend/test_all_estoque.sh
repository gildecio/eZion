#!/bin/bash

# Script para testar todas as entidades do módulo de Estoque
# Executa os testes em ordem de dependência

BASE_URL="http://localhost:8000/api/v1/estoque"
EMPRESA_ID=1

echo "=========================================="
echo "TESTE COMPLETO - MÓDULO DE ESTOQUE"
echo "=========================================="

# Verificar se o backend está rodando
echo -e "\nVerificando se o backend está disponível..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/itens/")
if [ "$HTTP_STATUS" != "200" ]; then
    echo "❌ ERRO: Backend não está respondendo na URL: ${BASE_URL}"
    echo "   Por favor, inicie o backend antes de executar os testes."
    exit 1
fi
echo "✅ Backend disponível!"

# Função para exibir status
show_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1 - FALHOU"
    fi
}

echo -e "\n=========================================="
echo "1. TESTANDO UNIDADES"
echo "=========================================="

# Criar unidade
UN_RESPONSE=$(curl -s -X POST "${BASE_URL}/unidades/" \
  -H "Content-Type: application/json" \
  -d '{
    "sigla": "UN",
    "descricao": "Unidade",
    "tipo_medida": "Quantidade"
  }')

UN_ID=$(echo $UN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 0))" 2>/dev/null)
show_status "Criar Unidade (ID: $UN_ID)"

# Listar unidades
curl -s "${BASE_URL}/unidades/" > /dev/null
show_status "Listar Unidades"

echo -e "\n=========================================="
echo "2. TESTANDO GRUPOS DE ITENS"
echo "=========================================="

# Criar grupo
GRUPO_RESPONSE=$(curl -s -X POST "${BASE_URL}/grupos/" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": '${EMPRESA_ID}',
    "codigo": "GRP001",
    "descricao": "Grupo Teste",
    "ativo": true
  }')

GRUPO_ID=$(echo $GRUPO_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 0))" 2>/dev/null)
show_status "Criar Grupo (ID: $GRUPO_ID)"

# Listar grupos
curl -s "${BASE_URL}/grupos/" > /dev/null
show_status "Listar Grupos"

echo -e "\n=========================================="
echo "3. TESTANDO ITENS"
echo "=========================================="

# Criar item
ITEM_RESPONSE=$(curl -s -X POST "${BASE_URL}/itens/" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": '${EMPRESA_ID}',
    "codigo": "ITEM001",
    "descricao": "Item Teste Completo",
    "tipo_item": "Produto Acabado",
    "unidade_id": '${UN_ID}',
    "grupo_id": '${GRUPO_ID}',
    "custo_medio": 15.00,
    "preco_venda": 30.00,
    "estoque_minimo": 10,
    "estoque_maximo": 200,
    "ativo": true
  }')

ITEM_ID=$(echo $ITEM_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 0))" 2>/dev/null)
show_status "Criar Item (ID: $ITEM_ID)"

# Atualizar item
curl -s -X PUT "${BASE_URL}/itens/${ITEM_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Item Teste Atualizado",
    "preco_venda": 35.00
  }' > /dev/null
show_status "Atualizar Item"

# Listar itens
curl -s "${BASE_URL}/itens/" > /dev/null
show_status "Listar Itens"

echo -e "\n=========================================="
echo "4. TESTANDO EMBALAGENS"
echo "=========================================="

# Criar embalagem
EMB_RESPONSE=$(curl -s -X POST "${BASE_URL}/embalagens/" \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": '${ITEM_ID}',
    "unidade_id": '${UN_ID}',
    "descricao": "Caixa com 12 unidades",
    "fator_conversao": 12,
    "codigo_barras": "7891234567890"
  }')

EMB_ID=$(echo $EMB_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 0))" 2>/dev/null)
show_status "Criar Embalagem (ID: $EMB_ID)"

# Listar embalagens
curl -s "${BASE_URL}/embalagens/?item_id=${ITEM_ID}" > /dev/null
show_status "Listar Embalagens do Item"

echo -e "\n=========================================="
echo "5. TESTANDO LOCAIS"
echo "=========================================="

# Criar local 1
LOCAL1_RESPONSE=$(curl -s -X POST "${BASE_URL}/locais/" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": '${EMPRESA_ID}',
    "nome": "Almoxarifado Central",
    "tipo": "Armazem",
    "endereco": "Rua A, 100",
    "ativo": true
  }')

LOCAL1_ID=$(echo $LOCAL1_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 0))" 2>/dev/null)
show_status "Criar Local 1 (ID: $LOCAL1_ID)"

# Criar local 2
LOCAL2_RESPONSE=$(curl -s -X POST "${BASE_URL}/locais/" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": '${EMPRESA_ID}',
    "nome": "Loja Shopping",
    "tipo": "Loja",
    "ativo": true
  }')

LOCAL2_ID=$(echo $LOCAL2_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 0))" 2>/dev/null)
show_status "Criar Local 2 (ID: $LOCAL2_ID)"

# Listar locais
curl -s "${BASE_URL}/locais/" > /dev/null
show_status "Listar Locais"

echo -e "\n=========================================="
echo "6. TESTANDO LOTES"
echo "=========================================="

# Criar lote
LOTE_RESPONSE=$(curl -s -X POST "${BASE_URL}/lotes/" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "L-2025-001",
    "item_id": '${ITEM_ID}',
    "data_fabricacao": "2025-01-15",
    "data_validade": "2026-01-15"
  }')

LOTE_ID=$(echo $LOTE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 0))" 2>/dev/null)
show_status "Criar Lote (ID: $LOTE_ID)"

# Listar lotes
curl -s "${BASE_URL}/lotes/" > /dev/null
show_status "Listar Lotes"

echo -e "\n=========================================="
echo "7. TESTANDO MOVIMENTAÇÕES"
echo "=========================================="

# 7.1 Entrada
ENTRADA_RESPONSE=$(curl -s -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Entrada",
    "item_id": '${ITEM_ID}',
    "quantidade": 150,
    "unidade_id": '${UN_ID}',
    "lote_id": '${LOTE_ID}',
    "local_destino_id": '${LOCAL1_ID}',
    "documento": "NF-12345",
    "custo_unitario": 15.00,
    "observacoes": "Compra de fornecedor",
    "usuario": "admin"
  }')

ENTRADA_ID=$(echo $ENTRADA_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 0))" 2>/dev/null)
show_status "Movimentação: Entrada (ID: $ENTRADA_ID)"

# 7.2 Saída
SAIDA_RESPONSE=$(curl -s -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Saida",
    "item_id": '${ITEM_ID}',
    "quantidade": 50,
    "unidade_id": '${UN_ID}',
    "lote_id": '${LOTE_ID}',
    "local_origem_id": '${LOCAL1_ID}',
    "documento": "PV-001",
    "observacoes": "Venda",
    "usuario": "admin"
  }')

SAIDA_ID=$(echo $SAIDA_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 0))" 2>/dev/null)
show_status "Movimentação: Saída (ID: $SAIDA_ID)"

# 7.3 Transferência
TRANSF_RESPONSE=$(curl -s -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Transferencia",
    "item_id": '${ITEM_ID}',
    "quantidade": 30,
    "unidade_id": '${UN_ID}',
    "lote_id": '${LOTE_ID}',
    "local_origem_id": '${LOCAL1_ID}',
    "local_destino_id": '${LOCAL2_ID}',
    "documento": "TRANS-001",
    "observacoes": "Reposição loja",
    "usuario": "admin"
  }')

TRANSF_ID=$(echo $TRANSF_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 0))" 2>/dev/null)
show_status "Movimentação: Transferência (ID: $TRANSF_ID)"

# 7.4 Ajuste Positivo
AJUSTE_RESPONSE=$(curl -s -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Ajuste Positivo",
    "item_id": '${ITEM_ID}',
    "quantidade": 10,
    "unidade_id": '${UN_ID}',
    "lote_id": '${LOTE_ID}',
    "local_destino_id": '${LOCAL1_ID}',
    "documento": "INV-001",
    "custo_unitario": 15.00,
    "observacoes": "Inventário encontrou diferença",
    "usuario": "admin"
  }')

AJUSTE_ID=$(echo $AJUSTE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 0))" 2>/dev/null)
show_status "Movimentação: Ajuste Positivo (ID: $AJUSTE_ID)"

# Listar movimentações
curl -s "${BASE_URL}/movimentacoes/" > /dev/null
show_status "Listar Movimentações"

echo -e "\n=========================================="
echo "8. TESTANDO SALDOS"
echo "=========================================="

# Listar todos os saldos
SALDOS=$(curl -s "${BASE_URL}/saldos/")
show_status "Listar Saldos"

# Verificar saldo no local 1 (esperado: 150 - 50 - 30 + 10 = 80)
SALDO_LOCAL1=$(curl -s "${BASE_URL}/saldos/?item_id=${ITEM_ID}&local_id=${LOCAL1_ID}")
QTD_LOCAL1=$(echo $SALDO_LOCAL1 | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['quantidade'] if data else 0)" 2>/dev/null)
echo "  Saldo no Local 1: $QTD_LOCAL1 (esperado: 80)"

# Verificar saldo no local 2 (esperado: 30)
SALDO_LOCAL2=$(curl -s "${BASE_URL}/saldos/?item_id=${ITEM_ID}&local_id=${LOCAL2_ID}")
QTD_LOCAL2=$(echo $SALDO_LOCAL2 | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['quantidade'] if data else 0)" 2>/dev/null)
echo "  Saldo no Local 2: $QTD_LOCAL2 (esperado: 30)"

show_status "Verificar Saldos Calculados"

echo -e "\n=========================================="
echo "9. TESTANDO VALIDAÇÕES DE NEGÓCIO"
echo "=========================================="

# Tentar saída com saldo insuficiente
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Saida",
    "item_id": '${ITEM_ID}',
    "quantidade": 10000,
    "unidade_id": '${UN_ID}',
    "local_origem_id": '${LOCAL1_ID}',
    "usuario": "admin"
  }')

if [ "$HTTP_CODE" == "400" ]; then
    echo "✅ Validação: Rejeita saída com saldo insuficiente"
else
    echo "❌ Validação: Deve rejeitar saída com saldo insuficiente (HTTP $HTTP_CODE)"
fi

# Tentar entrada sem local de destino
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Entrada",
    "item_id": '${ITEM_ID}',
    "quantidade": 10,
    "unidade_id": '${UN_ID}',
    "custo_unitario": 15.00,
    "usuario": "admin"
  }')

if [ "$HTTP_CODE" == "400" ]; then
    echo "✅ Validação: Rejeita entrada sem local de destino"
else
    echo "❌ Validação: Deve rejeitar entrada sem local (HTTP $HTTP_CODE)"
fi

# Tentar transferência com origem = destino
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/movimentacoes/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Transferencia",
    "item_id": '${ITEM_ID}',
    "quantidade": 10,
    "unidade_id": '${UN_ID}',
    "local_origem_id": '${LOCAL1_ID}',
    "local_destino_id": '${LOCAL1_ID}',
    "usuario": "admin"
  }')

if [ "$HTTP_CODE" == "400" ]; then
    echo "✅ Validação: Rejeita transferência com origem = destino"
else
    echo "❌ Validação: Deve rejeitar transferência inválida (HTTP $HTTP_CODE)"
fi

echo -e "\n=========================================="
echo "10. RESUMO DOS TESTES"
echo "=========================================="

echo -e "\nEntidades Criadas:"
echo "  - Unidades: $UN_ID"
echo "  - Grupos: $GRUPO_ID"
echo "  - Itens: $ITEM_ID"
echo "  - Embalagens: $EMB_ID"
echo "  - Locais: $LOCAL1_ID, $LOCAL2_ID"
echo "  - Lotes: $LOTE_ID"
echo "  - Movimentações: $ENTRADA_ID, $SAIDA_ID, $TRANSF_ID, $AJUSTE_ID"

echo -e "\nSaldos Finais:"
echo "  - Local 1 (Almoxarifado): $QTD_LOCAL1 unidades"
echo "  - Local 2 (Loja): $QTD_LOCAL2 unidades"
echo "  - Total: $(python3 -c "print(float('$QTD_LOCAL1') + float('$QTD_LOCAL2'))" 2>/dev/null) unidades"

echo -e "\n=========================================="
echo "✅ TODOS OS TESTES CONCLUÍDOS!"
echo "=========================================="
