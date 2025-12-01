#!/bin/bash

# Script para executar testes E2E do eZion ERP Frontend
# Este script configura o ambiente e executa os testes end-to-end

echo "🚀 Iniciando testes E2E do eZion ERP Frontend..."

# Verificar se o backend está rodando
echo "📋 Verificando se o backend está rodando..."
if ! curl -s http://localhost:8000/docs > /dev/null; then
    echo "❌ Backend não está rodando. Inicie o backend primeiro:"
    echo "   cd ../backend && source .venv/bin/activate && python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    exit 1
fi

# Verificar se o frontend está rodando
echo "📋 Verificando se o frontend está rodando..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Frontend não está rodando. Inicie o frontend primeiro:"
    echo "   npm run dev"
    exit 1
fi

echo "✅ Ambiente verificado com sucesso!"

# Executar testes
echo "🧪 Executando testes E2E..."
npx playwright test

# Verificar resultado
if [ $? -eq 0 ]; then
    echo "✅ Todos os testes E2E passaram!"
    echo "📊 Para ver o relatório HTML: npx playwright show-report"
else
    echo "❌ Alguns testes falharam."
    echo "📊 Para ver o relatório HTML: npx playwright show-report"
    exit 1
fi