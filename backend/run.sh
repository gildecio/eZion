#!/bin/bash

# Script para executar a API eZion com PostgreSQL

echo "🚀 Iniciando eZion API..."

# Navegar para o diretório do script
cd "$(dirname "$0")"

# Verificar se o ambiente virtual existe
if [ ! -d ".venv" ]; then
    echo "❌ Ambiente virtual não encontrado!"
    echo "📦 Criando ambiente virtual..."
    python3 -m venv .venv
    echo "📦 Instalando dependências..."
    .venv/bin/pip install -r requirements.txt
fi

# Executar a API diretamente com o Python do venv
echo "✅ Iniciando servidor..."
echo "📚 Documentação: http://localhost:8000/api/v1/docs"
echo "🗄️  Banco de dados: PostgreSQL (ezion_db)"
echo ""
.venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000
