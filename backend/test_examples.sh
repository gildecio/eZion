# Exemplos de execução dos testes de integração
# Execute estes comandos do diretório backend/

# 1. Executar todos os testes
python -m pytest test_integration.py -v

# 2. Executar apenas um teste específico
python -m pytest test_integration.py::TestEZionERPIntegration::test_03_authentication -v

# 3. Executar testes de uma categoria (usando markers)
python -m pytest test_integration.py -m integration -v

# 4. Executar com output detalhado para debug
python -m pytest test_integration.py -v --tb=long

# 5. Executar testes em paralelo (se houver muitos)
python -m pytest test_integration.py -n 2

# 6. Executar apenas testes que falharam na última execução
python -m pytest test_integration.py --lf

# 7. Executar testes e parar no primeiro erro
python -m pytest test_integration.py -x

# 8. Ver cobertura de código (requer pytest-cov)
# pip install pytest-cov
# python -m pytest test_integration.py --cov=. --cov-report=html

# 9. Executar usando o script automático (recomendado)
./run_tests.sh

# 10. Executar testes específicos por padrão
# Sequências
python -m pytest test_integration.py::TestEZionERPIntegration::test_04_sequencias_crud -v

# Estoque básico
python -m pytest test_integration.py::TestEZionERPIntegration::test_05_unidades_crud -v
python -m pytest test_integration.py::TestEZionERPIntegration::test_06_grupos_itens_crud -v
python -m pytest test_integration.py::TestEZionERPIntegration::test_07_embalagens_crud -v
python -m pytest test_integration.py::TestEZionERPIntegration::test_08_locais_crud -v

# Itens completos
python -m pytest test_integration.py::TestEZionERPIntegration::test_09_itens_crud -v

# Vendas
python -m pytest test_integration.py::TestEZionERPIntegration::test_10_clientes_crud -v
python -m pytest test_integration.py::TestEZionERPIntegration::test_14_pedidos_vendas -v

# Operações de estoque
python -m pytest test_integration.py::TestEZionERPIntegration::test_11_estoque_operations -v
python -m pytest test_integration.py::TestEZionERPIntegration::test_12_requisicoes_estoque -v
python -m pytest test_integration.py::TestEZionERPIntegration::test_13_ajustes_estoque -v

# Relatórios e validações
python -m pytest test_integration.py::TestEZionERPIntegration::test_15_comprehensive_report -v
python -m pytest test_integration.py::TestEZionERPIntegration::test_16_error_handling -v</content>
<parameter name="filePath">/home/gildecio/projetos/eZion/backend/test_examples.sh