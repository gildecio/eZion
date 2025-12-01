#!/bin/bash

# Script para executar testes de integração do eZion ERP
# Uso: ./run_tests.sh

echo "🧪 Executando Testes de Integração - eZion ERP"
echo "================================================"

# Verificar se estamos no diretório correto
if [ ! -f "test_integration.py" ]; then
    echo "❌ Arquivo test_integration.py não encontrado!"
    echo "📂 Execute este script do diretório backend/"
    exit 1
fi

# Verificar se o ambiente virtual existe
if [ ! -d ".venv" ] && [ ! -d ".venv_new" ]; then
    echo "❌ Ambiente virtual não encontrado!"
    echo "📦 Criando ambiente virtual..."
    python3 -m venv .venv
    echo "📦 Instalando dependências..."
    .venv/bin/pip install -r requirements.txt
fi

# Ativar ambiente virtual
if [ -d ".venv" ]; then
    source .venv/bin/activate
elif [ -d ".venv_new" ]; then
    source .venv_new/bin/activate
fi

# Instalar pytest se não estiver instalado
if ! python -c "import pytest" 2>/dev/null; then
    echo "📦 Instalando pytest..."
    pip install pytest requests
fi

# Verificar se o servidor está rodando
echo "🔍 Verificando se o servidor backend está rodando..."
if ! curl -s http://localhost:8000/docs > /dev/null; then
    echo "⚠️  Servidor backend não está rodando!"
    echo "🚀 Iniciando servidor backend..."

    # Matar processos anteriores
    pkill -f "uvicorn" 2>/dev/null
    sleep 2

    # Iniciar servidor em background
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 > /tmp/ezion-test-backend.log 2>&1 &
    BACKEND_PID=$!

    echo "⏳ Aguardando servidor inicializar..."
    sleep 5

    # Verificar novamente
    if ! curl -s http://localhost:8000/docs > /dev/null; then
        echo "❌ Falha ao iniciar servidor backend!"
        echo "📋 Logs: tail -f /tmp/ezion-test-backend.log"
        exit 1
    fi

    echo "✅ Servidor backend iniciado (PID: $BACKEND_PID)"
fi

echo ""
echo "🧪 Executando testes..."
echo ""

# Executar testes
python -m pytest test_integration.py -v --tb=short

# Capturar código de saída
TEST_EXIT_CODE=$?

echo ""
echo "================================================"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "🎉 Todos os testes passaram!"
else
    echo "❌ Alguns testes falharam!"
    echo "📋 Para mais detalhes, execute:"
    echo "   python -m pytest test_integration.py -v --tb=long"
fi

# Manter servidor rodando se testes passaram
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Sistema validado com sucesso!"
    echo "🌐 API Docs: http://localhost:8000/api/v1/docs"
    echo "🖥️  Frontend: http://localhost:3000"
    echo ""
    echo "💡 O servidor backend continuará rodando."
    echo "   Para pará-lo: pkill -f uvicorn"
else
    echo ""
    echo "🔧 Para debug:"
    echo "   Backend logs: tail -f /tmp/ezion-test-backend.log"
    echo "   Testes detalhados: python -m pytest test_integration.py -v --tb=long"
fi

exit $TEST_EXIT_CODE</content>
<parameter name="filePath">/home/gildecio/projetos/eZion/backend/run_tests.sh