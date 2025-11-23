#!/bin/bash

# Script para iniciar backend e frontend do eZion
# Mata processos anteriores e inicia novos

echo "🛑 Parando processos existentes..."

# Matar processos do backend (uvicorn/python)
pkill -f "uvicorn" 2>/dev/null
pkill -f "main.py" 2>/dev/null

# Matar processos do frontend (next/node)
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Aguardar um momento para os processos terminarem
sleep 2

echo "✅ Processos anteriores encerrados"
echo ""

# Navegar para o diretório do script
cd "$(dirname "$0")"

# Iniciar o backend
echo "🚀 Iniciando Backend..."
cd backend

# Verificar se o ambiente virtual existe
if [ ! -d ".venv" ]; then
    echo "❌ Ambiente virtual não encontrado!"
    echo "📦 Criando ambiente virtual..."
    python3 -m venv .venv
    echo "📦 Instalando dependências..."
    .venv/bin/pip install -r requirements.txt
fi

# Executar o backend em background com uvicorn
.venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000 > /tmp/ezion-backend.log 2>&1 &
BACKEND_PID=$!

echo "✅ Backend iniciado (PID: $BACKEND_PID)"
echo "📚 Documentação: http://localhost:8000/api/v1/docs"
echo "🗄️  Banco de dados: PostgreSQL (ezion_db)"
echo "📋 Logs: /tmp/ezion-backend.log"
echo ""

# Voltar para a raiz e iniciar o frontend
cd ..

echo "🚀 Iniciando Frontend..."
cd frontend

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "❌ Dependências do frontend não encontradas!"
    echo "📦 Instalando dependências..."
    npm install
fi

# Executar o frontend em background
npm run dev > /tmp/ezion-frontend.log 2>&1 &
FRONTEND_PID=$!

echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
echo "🌐 Interface: http://localhost:3000"
echo "📋 Logs: /tmp/ezion-frontend.log"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ eZion está rodando!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Backend:  http://localhost:8000"
echo "🖥️  Frontend: http://localhost:3000"
echo "📖 API Docs: http://localhost:8000/api/v1/docs"
echo ""
echo "Para parar os serviços:"
echo "  pkill -f uvicorn && pkill -f 'next dev'"
echo ""
echo "Para ver os logs:"
echo "  Backend:  tail -f /tmp/ezion-backend.log"
echo "  Frontend: tail -f /tmp/ezion-frontend.log"
echo ""
