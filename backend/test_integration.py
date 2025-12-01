"""
Teste de Integração Completo do Sistema eZion ERP

Este arquivo contém testes abrangentes para todas as funcionalidades principais do sistema,
incluindo autenticação, gestão de empresas, configurações, estoque, vendas e relatórios.

Para executar os testes:
    python -m pytest test_integration.py -v

Ou com ambiente virtual:
    source .venv/bin/activate && python -m pytest test_integration.py -v
"""

import pytest
import requests
import json
from typing import Dict, Any
import time


class TestEZionERPIntegration:
    """Classe de teste de integração para o sistema eZion ERP"""

    BASE_URL = "http://localhost:8000"
    API_PREFIX = "/api/v1"

    def setup_method(self):
        """Configuração inicial para cada teste"""
        self.session = requests.Session()
        self.token = None
        self.empresa_id = None
        self.test_data = {}

    def teardown_method(self):
        """Limpeza após cada teste"""
        if self.session:
            self.session.close()

    def get_auth_headers(self) -> Dict[str, str]:
        """Retorna headers com autenticação"""
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def login(self, username: str = "admin", password: str = "admin", empresa_id: int = 1) -> bool:
        """Realiza login e armazena token"""
        try:
            response = self.session.post(
                f"{self.BASE_URL}{self.API_PREFIX}/auth/login",
                json={
                    "username": username,
                    "password": password,
                    "empresa_id": empresa_id
                },
                headers={"Content-Type": "application/json"}
            )

            if response.status_code == 200:
                data = response.json()
                self.token = data.get("token")
                self.empresa_id = empresa_id
                return True
            return False
        except Exception as e:
            print(f"Erro no login: {e}")
            return False

    def test_01_health_check(self):
        """Testa se o servidor está respondendo"""
        try:
            response = self.session.get(f"{self.BASE_URL}/docs")
            assert response.status_code == 200, "Servidor não está respondendo"
            print("✅ Servidor está funcionando")
        except Exception as e:
            pytest.fail(f"Servidor não está acessível: {e}")

    def test_02_empresas_list(self):
        """Testa listagem de empresas (não requer autenticação)"""
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/contabil/empresas/",
            headers={"Content-Type": "application/json"}
        )

        assert response.status_code == 200, f"Erro ao listar empresas: {response.text}"
        empresas = response.json()
        assert isinstance(empresas, list), "Resposta deve ser uma lista"
        assert len(empresas) > 0, "Deve haver pelo menos uma empresa cadastrada"

        # Armazenar dados da primeira empresa para testes
        self.test_data['empresa'] = empresas[0]
        print(f"✅ Empresas listadas: {len(empresas)} empresa(s)")

    def test_03_authentication(self):
        """Testa autenticação"""
        success = self.login()
        assert success, "Falha no login"
        assert self.token is not None, "Token não foi gerado"
        print("✅ Autenticação realizada com sucesso")

    def test_04_sequencias_crud(self):
        """Testa CRUD completo de sequências"""
        # CREATE
        sequencia_data = {
            "documento_tipo": "TESTE_INTEGRACAO",
            "numero": 1,
            "serie": "2025",
            "numero_maximo": 999999,
            "tipo": "ANUAL",
            "empresa_id": self.empresa_id
        }

        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/configuracoes/sequencias/",
            json=sequencia_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao criar sequência: {response.text}"
        sequencia = response.json()
        self.test_data['sequencia_id'] = sequencia['id']
        print(f"✅ Sequência criada: {sequencia['documento_tipo']}")

        # READ - Listar
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/configuracoes/sequencias/?empresa_id={self.empresa_id}",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao listar sequências: {response.text}"
        sequencias = response.json()
        assert isinstance(sequencias, list), "Resposta deve ser uma lista"
        assert len(sequencias) > 0, "Deve haver sequências cadastradas"

        # READ - Por ID
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/configuracoes/sequencias/{self.test_data['sequencia_id']}",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao buscar sequência por ID: {response.text}"

        # UPDATE
        update_data = {
            "documento_tipo": "TESTE_INTEGRACAO_ATUALIZADO",
            "numero": 10,
            "serie": "2025",
            "numero_maximo": 999999,
            "tipo": "ANUAL",
            "empresa_id": self.empresa_id
        }

        response = self.session.put(
            f"{self.BASE_URL}{self.API_PREFIX}/configuracoes/sequencias/{self.test_data['sequencia_id']}",
            json=update_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao atualizar sequência: {response.text}"
        print("✅ Sequência atualizada")

        # DELETE
        response = self.session.delete(
            f"{self.BASE_URL}{self.API_PREFIX}/configuracoes/sequencias/{self.test_data['sequencia_id']}",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 204, f"Erro ao excluir sequência: {response.text}"
        print("✅ Sequência excluída")

    def test_05_unidades_crud(self):
        """Testa CRUD de unidades"""
        # CREATE
        unidade_data = {
            "nome": "Unidade Teste",
            "sigla": "UT",
            "ativo": True
        }

        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/",
            json=unidade_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao criar unidade: {response.text}"
        unidade = response.json()
        self.test_data['unidade_id'] = unidade['id']
        print(f"✅ Unidade criada: {unidade['nome']}")

        # READ - Listar
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao listar unidades: {response.text}"

        # UPDATE
        update_data = {
            "nome": "Unidade Teste Atualizada",
            "sigla": "UTA",
            "ativo": True
        }

        response = self.session.put(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/{self.test_data['unidade_id']}",
            json=update_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao atualizar unidade: {response.text}"
        print("✅ Unidade atualizada")

        # DELETE
        response = self.session.delete(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/{self.test_data['unidade_id']}",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 204, f"Erro ao excluir unidade: {response.text}"
        print("✅ Unidade excluída")

    def test_06_grupos_itens_crud(self):
        """Testa CRUD de grupos de itens"""
        # CREATE
        grupo_data = {
            "nome": "Grupo Teste Integração",
            "ativo": True
        }

        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/",
            json=grupo_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao criar grupo: {response.text}"
        grupo = response.json()
        self.test_data['grupo_id'] = grupo['id']
        print(f"✅ Grupo criado: {grupo['nome']}")

        # READ - Listar
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao listar grupos: {response.text}"

        # UPDATE
        update_data = {
            "nome": "Grupo Teste Atualizado",
            "ativo": True
        }

        response = self.session.put(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/{self.test_data['grupo_id']}",
            json=update_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao atualizar grupo: {response.text}"
        print("✅ Grupo atualizado")

        # DELETE
        response = self.session.delete(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/{self.test_data['grupo_id']}",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 204, f"Erro ao excluir grupo: {response.text}"
        print("✅ Grupo excluído")

    def test_07_embalagens_crud(self):
        """Testa CRUD de embalagens"""
        # Primeiro criar uma unidade para a embalagem
        unidade_data = {
            "nome": "Quilograma",
            "sigla": "KG",
            "ativo": True
        }

        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/",
            json=unidade_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao criar unidade para embalagem: {response.text}"
        unidade = response.json()
        unidade_id = unidade['id']

        # CREATE embalagem
        embalagem_data = {
            "nome": "Saco 25kg",
            "unidade_id": unidade_id,
            "fator_conversao": 25.0,
            "ativo": True
        }

        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/embalagens/",
            json=embalagem_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao criar embalagem: {response.text}"
        embalagem = response.json()
        self.test_data['embalagem_id'] = embalagem['id']
        print(f"✅ Embalagem criada: {embalagem['nome']}")

        # READ - Listar
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/embalagens/",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao listar embalagens: {response.text}"

        # UPDATE
        update_data = {
            "nome": "Saco 50kg",
            "unidade_id": unidade_id,
            "fator_conversao": 50.0,
            "ativo": True
        }

        response = self.session.put(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/embalagens/{self.test_data['embalagem_id']}",
            json=update_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao atualizar embalagem: {response.text}"
        print("✅ Embalagem atualizada")

        # DELETE
        response = self.session.delete(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/embalagens/{self.test_data['embalagem_id']}",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 204, f"Erro ao excluir embalagem: {response.text}"
        print("✅ Embalagem excluída")

        # Limpar unidade criada
        response = self.session.delete(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/{unidade_id}",
            headers=self.get_auth_headers()
        )

    def test_08_locais_crud(self):
        """Testa CRUD de locais"""
        # CREATE
        local_data = {
            "nome": "Depósito Central Teste",
            "ativo": True
        }

        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/locais/",
            json=local_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao criar local: {response.text}"
        local = response.json()
        self.test_data['local_id'] = local['id']
        print(f"✅ Local criado: {local['nome']}")

        # READ - Listar
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/locais/",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao listar locais: {response.text}"

        # UPDATE
        update_data = {
            "nome": "Depósito Central Atualizado",
            "ativo": True
        }

        response = self.session.put(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/locais/{self.test_data['local_id']}",
            json=update_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao atualizar local: {response.text}"
        print("✅ Local atualizado")

        # DELETE
        response = self.session.delete(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/locais/{self.test_data['local_id']}",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 204, f"Erro ao excluir local: {response.text}"
        print("✅ Local excluído")

    def test_09_itens_crud(self):
        """Testa CRUD completo de itens"""
        # Primeiro criar dependências
        # Unidade
        unidade_data = {"nome": "Unidade", "sigla": "UN", "ativo": True}
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/",
            json=unidade_data,
            headers=self.get_auth_headers()
        )
        unidade = response.json()
        unidade_id = unidade['id']

        # Grupo
        grupo_data = {"nome": "Grupo Itens Teste", "ativo": True}
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/",
            json=grupo_data,
            headers=self.get_auth_headers()
        )
        grupo = response.json()
        grupo_id = grupo['id']

        # CREATE item
        item_data = {
            "nome": "Item Teste Integração",
            "codigo": "ITEM001",
            "codigo_alternativo": "ALT001",
            "unidade_id": unidade_id,
            "grupo_id": grupo_id,
            "ativo": True
        }

        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/itens/",
            json=item_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao criar item: {response.text}"
        item = response.json()
        self.test_data['item_id'] = item['id']
        print(f"✅ Item criado: {item['nome']}")

        # READ - Listar
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/itens/",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao listar itens: {response.text}"

        # UPDATE
        update_data = {
            "nome": "Item Teste Atualizado",
            "codigo": "ITEM001UPD",
            "codigo_alternativo": "ALT001UPD",
            "unidade_id": unidade_id,
            "grupo_id": grupo_id,
            "ativo": True
        }

        response = self.session.put(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/itens/{self.test_data['item_id']}",
            json=update_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao atualizar item: {response.text}"
        print("✅ Item atualizado")

        # DELETE
        response = self.session.delete(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/itens/{self.test_data['item_id']}",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 204, f"Erro ao excluir item: {response.text}"
        print("✅ Item excluído")

        # Limpar dependências
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/{unidade_id}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/{grupo_id}", headers=self.get_auth_headers())

    def test_10_clientes_crud(self):
        """Testa CRUD de clientes"""
        # CREATE
        cliente_data = {
            "nome": "Cliente Teste Integração",
            "cpf_cnpj": "12345678901",
            "email": "cliente@teste.com",
            "telefone": "11999999999",
            "ativo": True
        }

        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/vendas/clientes/",
            json=cliente_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao criar cliente: {response.text}"
        cliente = response.json()
        self.test_data['cliente_id'] = cliente['id']
        print(f"✅ Cliente criado: {cliente['nome']}")

        # READ - Listar
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/vendas/clientes/",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao listar clientes: {response.text}"

        # UPDATE
        update_data = {
            "nome": "Cliente Teste Atualizado",
            "cpf_cnpj": "12345678901",
            "email": "cliente.atualizado@teste.com",
            "telefone": "11888888888",
            "ativo": True
        }

        response = self.session.put(
            f"{self.BASE_URL}{self.API_PREFIX}/vendas/clientes/{self.test_data['cliente_id']}",
            json=update_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao atualizar cliente: {response.text}"
        print("✅ Cliente atualizado")

        # DELETE
        response = self.session.delete(
            f"{self.BASE_URL}{self.API_PREFIX}/vendas/clientes/{self.test_data['cliente_id']}",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 204, f"Erro ao excluir cliente: {response.text}"
        print("✅ Cliente excluído")

    def test_11_estoque_operations(self):
        """Testa operações de estoque (movimentações, saldos, etc.)"""
        # Criar itens e locais necessários para teste
        # Unidade
        unidade_data = {"nome": "Peça", "sigla": "PC", "ativo": True}
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/",
            json=unidade_data,
            headers=self.get_auth_headers()
        )
        unidade = response.json()

        # Grupo
        grupo_data = {"nome": "Grupo Estoque Teste", "ativo": True}
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/",
            json=grupo_data,
            headers=self.get_auth_headers()
        )
        grupo = response.json()

        # Item
        item_data = {
            "nome": "Produto Teste",
            "codigo": "PROD001",
            "unidade_id": unidade['id'],
            "grupo_id": grupo['id'],
            "ativo": True
        }
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/itens/",
            json=item_data,
            headers=self.get_auth_headers()
        )
        item = response.json()

        # Local
        local_data = {"nome": "Almoxarifado Teste", "ativo": True}
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/locais/",
            json=local_data,
            headers=self.get_auth_headers()
        )
        local = response.json()

        # Lote
        lote_data = {
            "codigo": "LOTE001",
            "item_id": item['id'],
            "data_validade": "2026-12-31",
            "ativo": True
        }
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/lotes/",
            json=lote_data,
            headers=self.get_auth_headers()
        )
        lote = response.json()

        # Testar saldos
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/saldos/",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao consultar saldos: {response.text}"
        print("✅ Saldos consultados")

        # Testar movimentações
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/movimentacoes/",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao consultar movimentações: {response.text}"
        print("✅ Movimentações consultadas")

        # Limpar dados de teste
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/lotes/{lote['id']}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/locais/{local['id']}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/itens/{item['id']}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/{grupo['id']}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/{unidade['id']}", headers=self.get_auth_headers())

    def test_12_requisicoes_estoque(self):
        """Testa requisições de estoque"""
        # Criar dependências
        unidade_data = {"nome": "Caixa", "sigla": "CX", "ativo": True}
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/",
            json=unidade_data,
            headers=self.get_auth_headers()
        )
        unidade = response.json()

        grupo_data = {"nome": "Grupo Req Teste", "ativo": True}
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/",
            json=grupo_data,
            headers=self.get_auth_headers()
        )
        grupo = response.json()

        item_data = {
            "nome": "Material Requisicao",
            "codigo": "REQ001",
            "unidade_id": unidade['id'],
            "grupo_id": grupo['id'],
            "ativo": True
        }
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/itens/",
            json=item_data,
            headers=self.get_auth_headers()
        )
        item = response.json()

        embalagem_data = {
            "nome": "Caixa 10 unidades",
            "unidade_id": unidade['id'],
            "fator_conversao": 10.0,
            "ativo": True
        }
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/embalagens/",
            json=embalagem_data,
            headers=self.get_auth_headers()
        )
        embalagem = response.json()

        # CREATE requisição
        requisicao_data = {
            "solicitante": "Teste Integração",
            "itens": [
                {
                    "item_id": item['id'],
                    "embalagem_id": embalagem['id'],
                    "quantidade": 5
                }
            ]
        }

        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/requisicao/",
            json=requisicao_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao criar requisição: {response.text}"
        requisicao = response.json()
        print(f"✅ Requisição criada: {requisicao.get('id', 'ID não retornado')}")

        # READ - Listar requisições
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/requisicoes/",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao listar requisições: {response.text}"
        print("✅ Requisições listadas")

        # Limpar dados
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/embalagens/{embalagem['id']}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/itens/{item['id']}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/{grupo['id']}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/{unidade['id']}", headers=self.get_auth_headers())

    def test_13_ajustes_estoque(self):
        """Testa ajustes de estoque"""
        # Criar dependências
        unidade_data = {"nome": "Pacote", "sigla": "PCT", "ativo": True}
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/",
            json=unidade_data,
            headers=self.get_auth_headers()
        )
        unidade = response.json()

        grupo_data = {"nome": "Grupo Ajuste Teste", "ativo": True}
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/",
            json=grupo_data,
            headers=self.get_auth_headers()
        )
        grupo = response.json()

        item_data = {
            "nome": "Produto Ajuste",
            "codigo": "AJUSTE001",
            "unidade_id": unidade['id'],
            "grupo_id": grupo['id'],
            "ativo": True
        }
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/itens/",
            json=item_data,
            headers=self.get_auth_headers()
        )
        item = response.json()

        local_data = {"nome": "Depósito Ajuste", "ativo": True}
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/locais/",
            json=local_data,
            headers=self.get_auth_headers()
        )
        local = response.json()

        # CREATE ajuste
        ajuste_data = {
            "motivo": "Ajuste de teste de integração",
            "itens": [
                {
                    "item_id": item['id'],
                    "local_id": local['id'],
                    "quantidade": 10,
                    "tipo": "ENTRADA"
                }
            ]
        }

        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/ajuste/",
            json=ajuste_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao criar ajuste: {response.text}"
        ajuste = response.json()
        print(f"✅ Ajuste criado: {ajuste.get('id', 'ID não retornado')}")

        # READ - Listar ajustes
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/ajustes/",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao listar ajustes: {response.text}"
        print("✅ Ajustes listados")

        # Limpar dados
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/locais/{local['id']}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/itens/{item['id']}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/{grupo['id']}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/{unidade['id']}", headers=self.get_auth_headers())

    def test_14_pedidos_vendas(self):
        """Testa pedidos de vendas"""
        # Criar dependências
        cliente_data = {
            "nome": "Cliente Pedido Teste",
            "cpf_cnpj": "98765432100",
            "email": "cliente.pedido@teste.com",
            "ativo": True
        }
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/vendas/clientes/",
            json=cliente_data,
            headers=self.get_auth_headers()
        )
        cliente = response.json()

        unidade_data = {"nome": "Saco", "sigla": "SC", "ativo": True}
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/",
            json=unidade_data,
            headers=self.get_auth_headers()
        )
        unidade = response.json()

        grupo_data = {"nome": "Grupo Pedido Teste", "ativo": True}
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/",
            json=grupo_data,
            headers=self.get_auth_headers()
        )
        grupo = response.json()

        item_data = {
            "nome": "Produto Venda",
            "codigo": "VENDA001",
            "unidade_id": unidade['id'],
            "grupo_id": grupo['id'],
            "ativo": True
        }
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/itens/",
            json=item_data,
            headers=self.get_auth_headers()
        )
        item = response.json()

        # CREATE pedido
        pedido_data = {
            "cliente_id": cliente['id'],
            "itens": [
                {
                    "item_id": item['id'],
                    "quantidade": 2,
                    "preco_unitario": 50.00
                }
            ]
        }

        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/vendas/pedidos/",
            json=pedido_data,
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao criar pedido: {response.text}"
        pedido = response.json()
        print(f"✅ Pedido criado: {pedido.get('id', 'ID não retornado')}")

        # READ - Listar pedidos
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/vendas/pedidos/",
            headers=self.get_auth_headers()
        )

        assert response.status_code == 200, f"Erro ao listar pedidos: {response.text}"
        print("✅ Pedidos listados")

        # Limpar dados
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/vendas/clientes/{cliente['id']}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/itens/{item['id']}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/grupos/{grupo['id']}", headers=self.get_auth_headers())
        self.session.delete(f"{self.BASE_URL}{self.API_PREFIX}/estoque/unidades/{unidade['id']}", headers=self.get_auth_headers())

    def test_15_comprehensive_report(self):
        """Testa relatórios e consultas abrangentes"""
        # Testar endpoints de relatório/dashboard
        endpoints_to_test = [
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/saldos/",
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/movimentacoes/",
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/itens/",
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/locais/",
            f"{self.BASE_URL}{self.API_PREFIX}/estoque/lotes/",
            f"{self.BASE_URL}{self.API_PREFIX}/vendas/clientes/",
            f"{self.BASE_URL}{self.API_PREFIX}/vendas/pedidos/",
            f"{self.BASE_URL}{self.API_PREFIX}/configuracoes/sequencias/?empresa_id={self.empresa_id}",
        ]

        for endpoint in endpoints_to_test:
            response = self.session.get(endpoint, headers=self.get_auth_headers())
            assert response.status_code == 200, f"Erro no endpoint {endpoint}: {response.text}"

        print("✅ Todos os endpoints de relatório funcionando")

    def test_16_error_handling(self):
        """Testa tratamento de erros"""
        # Testar autenticação inválida
        response = self.session.post(
            f"{self.BASE_URL}{self.API_PREFIX}/auth/login",
            json={
                "username": "invalid",
                "password": "invalid",
                "empresa_id": 999
            },
            headers={"Content-Type": "application/json"}
        )

        assert response.status_code == 401, "Deve retornar erro 401 para credenciais inválidas"
        print("✅ Tratamento de erro de autenticação funcionando")

        # Testar acesso sem token
        response = self.session.get(
            f"{self.BASE_URL}{self.API_PREFIX}/configuracoes/sequencias/",
            headers={"Content-Type": "application/json"}
        )

        # Deve retornar erro (401 ou 403)
        assert response.status_code in [401, 403], f"Deve retornar erro para acesso sem token: {response.status_code}"
        print("✅ Controle de acesso funcionando")

    def run_all_tests(self):
        """Executa todos os testes em sequência"""
        print("🚀 Iniciando Testes de Integração do eZion ERP")
        print("=" * 60)

        test_methods = [
            method for method in dir(self)
            if method.startswith('test_') and callable(getattr(self, method))
        ]

        test_methods.sort()  # Executar em ordem

        passed = 0
        failed = 0

        for test_method in test_methods:
            print(f"\n📋 Executando: {test_method}")
            try:
                getattr(self, test_method)()
                passed += 1
                print(f"✅ {test_method}: PASSOU")
            except Exception as e:
                failed += 1
                print(f"❌ {test_method}: FALHOU - {str(e)}")

        print("\n" + "=" * 60)
        print("📊 RESULTADO FINAL:")
        print(f"✅ Testes Aprovados: {passed}")
        print(f"❌ Testes Reprovados: {failed}")
        print(f"📈 Taxa de Sucesso: {(passed / (passed + failed) * 100):.1f}%")
        if failed == 0:
            print("🎉 Todos os testes passaram! Sistema funcionando perfeitamente.")
        else:
            print("⚠️  Alguns testes falharam. Verifique os logs acima.")

        return failed == 0


if __name__ == "__main__":
    # Executar testes diretamente
    tester = TestEZionERPIntegration()
    success = tester.run_all_tests()

    if not success:
        import sys
        sys.exit(1)
