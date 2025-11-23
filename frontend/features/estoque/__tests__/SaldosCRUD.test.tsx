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
      item_descricao: 'Produto Teste',
      local_id: 1,
      local_nome: 'Almoxarifado',
      lote_id: 1,
      lote_codigo: 'L001',
      quantidade: 70,
      custo_medio: 10.50,
      valor_total: 735.00,
      unidade_padrao_sigla: 'UN',
    },
    {
      id: 2,
      item_id: 1,
      item_codigo: 'ITEM001',
      item_descricao: 'Produto Teste',
      local_id: 2,
      local_nome: 'Loja Centro',
      lote_id: 1,
      lote_codigo: 'L001',
      quantidade: 30,
      custo_medio: 10.50,
      valor_total: 315.00,
      unidade_padrao_sigla: 'UN',
    },
  ];

  const mockItens = [
    {
      id: 1,
      codigo: 'ITEM001',
      descricao: 'Produto Teste',
      tipo: 'P',
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

  test('renderiza título e descrição', async () => {
    render(<SaldosCRUD />);
    
    expect(screen.getByText('Saldos de Estoque')).toBeInTheDocument();
    expect(screen.getByText('Consulte o estoque atual e valores em estoque')).toBeInTheDocument();
  });

  test('renderiza filtros de item e local', () => {
    render(<SaldosCRUD />);
    
    expect(screen.getByText('Filtros')).toBeInTheDocument();
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2); // Item e Local
    expect(screen.getByText('Todos os itens')).toBeInTheDocument();
    expect(screen.getByText('Todos os locais')).toBeInTheDocument();
  });

  test('renderiza tabela com saldos quando há dados', async () => {
    render(<SaldosCRUD />);

    await waitFor(() => {
      // Verifica cabeçalhos da tabela - "Item" aparece no filtro e na tabela, usar getAllByText
      expect(screen.getByText('Código')).toBeInTheDocument();
      const itemHeaders = screen.getAllByText('Item');
      expect(itemHeaders.length).toBeGreaterThanOrEqual(1); // Aparece no filtro e na tabela
      const localHeaders = screen.getAllByText('Local');
      expect(localHeaders.length).toBeGreaterThanOrEqual(1); // Aparece no filtro e na tabela
      expect(screen.getByText('Lote')).toBeInTheDocument();
      expect(screen.getByText('Quantidade')).toBeInTheDocument();
      expect(screen.getByText('Unidade')).toBeInTheDocument();
      
      // Verifica dados na tabela
      expect(screen.getAllByText('ITEM001')).toHaveLength(2);
      expect(screen.getAllByText('Produto Teste')).toHaveLength(2);
      expect(screen.getByText('Almoxarifado')).toBeInTheDocument();
      expect(screen.getByText('Loja Centro')).toBeInTheDocument();
    });
  });

  test('exibe ícone de alerta para estoque baixo', async () => {
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
      const lowStockRow = screen.getByText('5,00').closest('tr');
      expect(lowStockRow).toHaveClass('low-stock');
    });
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
      expect(screen.getByText('Nenhum saldo encontrado')).toBeInTheDocument();
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

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  test('exibe erro quando há falha no carregamento', () => {
    (saldosHook.useSaldos as jest.Mock).mockReturnValue({
      saldos: [],
      loading: false,
      error: 'Erro ao carregar saldos',
      getTotalValue: jest.fn().mockReturnValue(0),
    });

    render(<SaldosCRUD />);

    expect(screen.getByText('Erro ao carregar saldos')).toBeInTheDocument();
  });

  test('formata quantidade com vírgula decimal', async () => {
    render(<SaldosCRUD />);

    await waitFor(() => {
      // Quantidade 70 deve aparecer como 70,00
      expect(screen.getByText('70,00')).toBeInTheDocument();
      // Quantidade 30 deve aparecer como 30,00
      expect(screen.getByText('30,00')).toBeInTheDocument();
    });
  });
});
