import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SaldosCRUD from '../components/SaldosCRUD';
import * as saldosHook from '../hooks/useSaldos';
import * as itensHook from '../hooks/useItens';
import * as locaisHook from '../hooks';

// Mock dos hooks
jest.mock('../hooks/useSaldos');
jest.mock('../hooks/useItens');
jest.mock('../hooks');

describe('SaldosCRUD', () => {
  const mockSaldos = [
    {
      id: 1,
      item_id: 1,
      item_codigo: 'ITEM001',
      item_nome: 'Produto Teste',
      local_id: 1,
      local_nome: 'Almoxarifado',
      lote_id: 1,
      lote_codigo: 'L001',
      quantidade: 70,
      custo_medio: 10.50,
      valor_total: 735.00,
    },
    {
      id: 2,
      item_id: 1,
      item_codigo: 'ITEM001',
      item_nome: 'Produto Teste',
      local_id: 2,
      local_nome: 'Loja Centro',
      lote_id: 1,
      lote_codigo: 'L001',
      quantidade: 30,
      custo_medio: 10.50,
      valor_total: 315.00,
    },
  ];

  const mockItens = [
    {
      id: 1,
      codigo: 'ITEM001',
      descricao: 'Produto Teste',
      tipo_item: 'Produto Acabado',
      unidade_id: 1,
      ativo: true,
    },
  ];

  const mockLocais = [
    {
      id: 1,
      codigo: 'ALM001',
      nome: 'Almoxarifado',
      ativo: true,
    },
    {
      id: 2,
      codigo: 'LOJ001',
      nome: 'Loja Centro',
      ativo: true,
    },
  ];

  beforeEach(() => {
    (saldosHook.useSaldos as jest.Mock).mockReturnValue({
      saldos: mockSaldos,
      loading: false,
      error: null,
      getTotalValue: jest.fn().mockReturnValue(1050.00),
    });

    (itensHook.useItens as jest.Mock).mockReturnValue({
      itens: mockItens,
      loading: false,
      error: null,
    });

    (locaisHook.useLocais as jest.Mock).mockReturnValue({
      locais: mockLocais,
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza tabela com saldos', async () => {
    render(<SaldosCRUD />);

    await waitFor(() => {
      expect(screen.getByText('Saldos de Estoque')).toBeInTheDocument();
      expect(screen.getByText('ITEM001')).toBeInTheDocument();
      expect(screen.getByText('Produto Teste')).toBeInTheDocument();
      expect(screen.getByText('Almoxarifado')).toBeInTheDocument();
      expect(screen.getByText('Loja Centro')).toBeInTheDocument();
      expect(screen.getByText('L001')).toBeInTheDocument();
    });
  });

  test('exibe cards de resumo corretamente', async () => {
    render(<SaldosCRUD />);

    await waitFor(() => {
      expect(screen.getByText('Total de Itens')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 saldos
      expect(screen.getByText('Quantidade Total')).toBeInTheDocument();
      expect(screen.getByText('100,00')).toBeInTheDocument(); // 70 + 30
      expect(screen.getByText('Valor Total')).toBeInTheDocument();
    });
  });

  test('formata valores monetários corretamente', async () => {
    render(<SaldosCRUD />);

    await waitFor(() => {
      expect(screen.getByText(/R\$\s*10,50/)).toBeInTheDocument(); // custo médio
      expect(screen.getByText(/R\$\s*735,00/)).toBeInTheDocument(); // valor total local 1
      expect(screen.getByText(/R\$\s*315,00/)).toBeInTheDocument(); // valor total local 2
    });
  });

  test('exibe alerta para estoque baixo', async () => {
    const saldosComEstoqueBaixo = [
      {
        ...mockSaldos[0],
        quantidade: 5, // Menos de 10
      },
    ];

    (saldosHook.useSaldos as jest.Mock).mockReturnValue({
      saldos: saldosComEstoqueBaixo,
      loading: false,
      error: null,
      getTotalValue: jest.fn().mockReturnValue(52.50),
    });

    render(<SaldosCRUD />);

    await waitFor(() => {
      expect(screen.getByText(/Atenção/i)).toBeInTheDocument();
      expect(screen.getByText(/estoque baixo/i)).toBeInTheDocument();
    });
  });

  test('permite filtrar por item', async () => {
    render(<SaldosCRUD />);

    const itemSelect = screen.getByLabelText(/Item/i);
    expect(itemSelect).toBeInTheDocument();
  });

  test('permite filtrar por local', async () => {
    render(<SaldosCRUD />);

    const localSelect = screen.getByLabelText(/Local/i);
    expect(localSelect).toBeInTheDocument();
  });

  test('exibe mensagem quando não há saldos', async () => {
    (saldosHook.useSaldos as jest.Mock).mockReturnValue({
      saldos: [],
      loading: false,
      error: null,
      getTotalValue: jest.fn().mockReturnValue(0),
    });

    render(<SaldosCRUD />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhum saldo encontrado/i)).toBeInTheDocument();
    });
  });

  test('exibe loading enquanto carrega', () => {
    (saldosHook.useSaldos as jest.Mock).mockReturnValue({
      saldos: [],
      loading: true,
      error: null,
      getTotalValue: jest.fn().mockReturnValue(0),
    });

    render(<SaldosCRUD />);

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  test('exibe erro quando há falha no carregamento', () => {
    (saldosHook.useSaldos as jest.Mock).mockReturnValue({
      saldos: [],
      loading: false,
      error: 'Erro ao carregar saldos',
      getTotalValue: jest.fn().mockReturnValue(0),
    });

    render(<SaldosCRUD />);

    expect(screen.getByText(/Erro ao carregar saldos/i)).toBeInTheDocument();
  });

  test('exibe total geral no rodapé da tabela', async () => {
    render(<SaldosCRUD />);

    await waitFor(() => {
      expect(screen.getByText('TOTAL GERAL')).toBeInTheDocument();
      expect(screen.getByText(/R\$\s*1\.050,00/)).toBeInTheDocument();
    });
  });
});
