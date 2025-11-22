import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MovimentacoesCRUD } from '../components/MovimentacoesCRUD';
import * as movimentacoesHook from '../hooks/useMovimentacoes';
import * as itensHook from '../hooks/useItens';
import * as locaisHook from '../hooks';
import * as lotesHook from '../hooks/useLotes';

// Mock dos hooks
jest.mock('../hooks/useMovimentacoes');
jest.mock('../hooks/useItens');
jest.mock('../hooks');
jest.mock('../hooks/useLotes');

describe('MovimentacoesCRUD', () => {
  const mockMovimentacoes = [
    {
      id: 1,
      tipo: 'Entrada',
      item_id: 1,
      item_codigo: 'ITEM001',
      item_nome: 'Produto Teste',
      quantidade: 100,
      unidade_id: 1,
      local_destino_id: 1,
      local_destino_nome: 'Almoxarifado',
      custo_unitario: 10.50,
      data_movimentacao: '2025-11-22T10:00:00',
      documento: 'NF-001',
      usuario: 'admin',
    },
    {
      id: 2,
      tipo: 'Saida',
      item_id: 1,
      item_codigo: 'ITEM001',
      item_nome: 'Produto Teste',
      quantidade: 30,
      unidade_id: 1,
      local_origem_id: 1,
      local_origem_nome: 'Almoxarifado',
      data_movimentacao: '2025-11-22T14:00:00',
      documento: 'PV-001',
      usuario: 'admin',
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
  ];

  const mockLotes = [
    {
      id: 1,
      codigo: 'L001',
      item_id: 1,
      data_fabricacao: '2025-01-01',
      data_validade: '2026-01-01',
    },
  ];

  beforeEach(() => {
    (movimentacoesHook.useMovimentacoes as jest.Mock).mockReturnValue({
      movimentacoes: mockMovimentacoes,
      loading: false,
      error: null,
      registrarMovimentacao: jest.fn().mockResolvedValue(true),
      remover: jest.fn().mockResolvedValue(true),
      refresh: jest.fn(),
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

    (lotesHook.useLotes as jest.Mock).mockReturnValue({
      lotes: mockLotes,
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza tabela com movimentações', async () => {
    render(<MovimentacoesCRUD />);

    await waitFor(() => {
      expect(screen.getByText('Movimentações de Estoque')).toBeInTheDocument();
      expect(screen.getByText('ITEM001')).toBeInTheDocument();
      expect(screen.getByText('Produto Teste')).toBeInTheDocument();
      expect(screen.getByText('NF-001')).toBeInTheDocument();
      expect(screen.getByText('PV-001')).toBeInTheDocument();
    });
  });

  test('exibe badges de tipo corretamente', async () => {
    render(<MovimentacoesCRUD />);

    await waitFor(() => {
      expect(screen.getByText('Entrada')).toBeInTheDocument();
      expect(screen.getByText('Saida')).toBeInTheDocument();
    });
  });

  test('permite filtrar por item', async () => {
    render(<MovimentacoesCRUD />);

    const itemSelect = screen.getByLabelText(/Item/i);
    fireEvent.change(itemSelect, { target: { value: '1' } });

    await waitFor(() => {
      expect(itemSelect).toHaveValue('1');
    });
  });

  test('exibe mensagem quando não há movimentações', async () => {
    (movimentacoesHook.useMovimentacoes as jest.Mock).mockReturnValue({
      movimentacoes: [],
      loading: false,
      error: null,
      registrarMovimentacao: jest.fn(),
      remover: jest.fn(),
      refresh: jest.fn(),
    });

    render(<MovimentacoesCRUD />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma movimentação encontrada/i)).toBeInTheDocument();
    });
  });

  test('exibe loading enquanto carrega', () => {
    (movimentacoesHook.useMovimentacoes as jest.Mock).mockReturnValue({
      movimentacoes: [],
      loading: true,
      error: null,
      registrarMovimentacao: jest.fn(),
      remover: jest.fn(),
      refresh: jest.fn(),
    });

    render(<MovimentacoesCRUD />);

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  test('exibe erro quando há falha no carregamento', () => {
    (movimentacoesHook.useMovimentacoes as jest.Mock).mockReturnValue({
      movimentacoes: [],
      loading: false,
      error: 'Erro ao carregar movimentações',
      registrarMovimentacao: jest.fn(),
      remover: jest.fn(),
      refresh: jest.fn(),
    });

    render(<MovimentacoesCRUD />);

    expect(screen.getByText(/Erro ao carregar movimentações/i)).toBeInTheDocument();
  });

  test('permite registrar entrada', async () => {
    const mockRegistrar = jest.fn().mockResolvedValue(true);
    (movimentacoesHook.useMovimentacoes as jest.Mock).mockReturnValue({
      movimentacoes: mockMovimentacoes,
      loading: false,
      error: null,
      registrarMovimentacao: mockRegistrar,
      remover: jest.fn(),
      refresh: jest.fn(),
    });

    render(<MovimentacoesCRUD />);

    // Selecionar tipo
    const tipoSelect = screen.getByLabelText(/Tipo de Movimentação/i);
    fireEvent.change(tipoSelect, { target: { value: 'Entrada' } });

    // Preencher formulário
    const itemSelect = screen.getByLabelText(/Item/i);
    fireEvent.change(itemSelect, { target: { value: '1' } });

    const quantidadeInput = screen.getByLabelText(/Quantidade/i);
    fireEvent.change(quantidadeInput, { target: { value: '50' } });

    const custoInput = screen.getByLabelText(/Custo Unitário/i);
    fireEvent.change(custoInput, { target: { value: '10.50' } });

    const localDestinoSelect = screen.getByLabelText(/Local de Destino/i);
    fireEvent.change(localDestinoSelect, { target: { value: '1' } });

    // Submeter
    const submitButton = screen.getByRole('button', { name: /Registrar Movimentação/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegistrar).toHaveBeenCalledWith(expect.objectContaining({
        tipo: 'Entrada',
        item_id: 1,
        quantidade: 50,
        custo_unitario: 10.50,
        local_destino_id: 1,
      }));
    });
  });
});
