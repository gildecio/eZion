import React, { useState, useEffect } from 'react';
import { useDocumentos } from '../hooks/useDocumentos';
import { useEmpresas } from '@/features/contabil/hooks/useEmpresas';
import { useLocais } from '../hooks/useLocais';
import type { Documento, CreateDocumentoDTO, UpdateDocumentoDTO, TipoDocumento, CampoConfig } from '../types/documento';
import { CAMPOS_POR_TIPO } from '../types/documento';
import { DeleteConfirmModal } from '@/shared/components/DeleteConfirmModal';

export default function DocumentosCRUD() {
  const { documentos, loading, fetchDocumentos, createDocumento, updateDocumento, deleteDocumento } = useDocumentos();
  const { empresas, refresh: refreshEmpresas } = useEmpresas();
  const { locais, refresh: refreshLocais } = useLocais();
  
  const [showForm, setShowForm] = useState(false);
  const [editingDocumento, setEditingDocumento] = useState<Documento | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentoToDelete, setDocumentoToDelete] = useState<Documento | null>(null);

  useEffect(() => {
    fetchDocumentos();
    refreshEmpresas();
    refreshLocais();
  }, [fetchDocumentos, refreshEmpresas, refreshLocais]);

  const handleCreate = () => {
    setEditingDocumento(null);
    setShowForm(true);
  };

  const handleEdit = (documento: Documento) => {
    setEditingDocumento(documento);
    setShowForm(true);
  };

  const handleDelete = (documento: Documento) => {
    setDocumentoToDelete(documento);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (documentoToDelete) {
      await deleteDocumento(documentoToDelete.id);
      setDeleteModalOpen(false);
      setDocumentoToDelete(null);
    }
  };

  const handleFormSubmit = async (data: CreateDocumentoDTO | UpdateDocumentoDTO) => {
    if (editingDocumento) {
      await updateDocumento(editingDocumento.id, data as UpdateDocumentoDTO);
    } else {
      await createDocumento(data as CreateDocumentoDTO);
    }
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDocumento(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Documentos</h1>
        <button onClick={handleCreate} style={styles.addButton}>
          + Novo Documento
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {editingDocumento ? 'Editar Documento' : 'Novo Documento'}
          </h2>
          <DocumentoForm
            documento={editingDocumento}
            empresas={empresas}
            locais={locais}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isLoading={loading}
          />
        </div>
      )}

      {loading && <div style={styles.loading}>Carregando...</div>}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Número</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Data Registro</th>
              <th style={styles.th}>Valor</th>
              <th style={styles.th}>Empresa</th>
              <th style={styles.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((documento) => (
              <tr key={documento.id} style={styles.tr}>
                <td style={styles.td}>{documento.numero}</td>
                <td style={styles.td}>{documento.tipo_documento}</td>
                <td style={styles.td}>
                  {new Date(documento.data_registro).toLocaleDateString('pt-BR')}
                </td>
                <td style={styles.td}>
                  R$ {Number(documento.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style={styles.td}>
                  {empresas.find(e => e.id === documento.empresa_id)?.razao_social || '-'}
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => handleEdit(documento)}
                      style={styles.editButton}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(documento)}
                      style={styles.deleteButton}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteModalOpen && documentoToDelete && (
        <DeleteConfirmModal
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModalOpen(false)}
          itemName={`documento ${documentoToDelete.numero}`}
        />
      )}
    </div>
  );
}

// Componente do formulário
interface DocumentoFormProps {
  documento?: Documento | null;
  empresas: any[];
  locais: any[];
  onSubmit: (data: CreateDocumentoDTO | UpdateDocumentoDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function DocumentoForm({ documento, empresas, locais, onSubmit, onCancel, isLoading }: DocumentoFormProps) {
  const [formData, setFormData] = useState<any>({
    numero: documento?.numero || '',
    tipo_documento: documento?.tipo_documento || '',
    data_registro: documento?.data_registro?.split('T')[0] || new Date().toISOString().split('T')[0],
    data_entrada: documento?.data_entrada?.split('T')[0] || '',
    valor: documento?.valor || 0,
    empresa_id: documento?.empresa_id || '',
    observacoes: documento?.observacoes || '',
    
    // Campos específicos
    chave_nfe: documento?.chave_nfe || '',
    serie: documento?.serie || '',
    modelo: documento?.modelo || '',
    cnpj_emissor: documento?.cnpj_emissor || '',
    nome_emissor: documento?.nome_emissor || '',
    cnpj_destinatario: documento?.cnpj_destinatario || '',
    nome_destinatario: documento?.nome_destinatario || '',
    local_origem_id: documento?.local_origem_id || '',
    local_destino_id: documento?.local_destino_id || '',
    lote_producao: documento?.lote_producao || '',
    data_inicio_producao: documento?.data_inicio_producao?.split('T')[0] || '',
    data_fim_producao: documento?.data_fim_producao?.split('T')[0] || '',
    centro_custo: documento?.centro_custo || '',
    solicitante: documento?.solicitante || '',
    ordem_producao_referencia: documento?.ordem_producao_referencia || '',
    motivo_ajuste: documento?.motivo_ajuste || '',
    responsavel_ajuste: documento?.responsavel_ajuste || '',
    data_retorno_prevista: documento?.data_retorno_prevista?.split('T')[0] || '',
    destinatario_remessa: documento?.destinatario_remessa || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const tiposDocumento = Object.entries({
    'Nota Fiscal de Compra': 'NF_COMPRA',
    'Nota Fiscal de Venda': 'NF_VENDA',
    'Nota Fiscal de Devolução de Cliente': 'NF_DEVOLUCAO_CLIENTE',
    'Nota Fiscal de Devolução ao Fornecedor': 'NF_DEVOLUCAO_FORNECEDOR',
    'Transferência entre Locais (Entrada)': 'TRANSFERENCIA_ENTRADA',
    'Transferência entre Locais (Saída)': 'TRANSFERENCIA_SAIDA',
    'Ordem de Produção': 'ORDEM_PRODUCAO',
    'Requisição de Material': 'REQUISICAO_MATERIAL',
    'Nota de Remessa': 'NOTA_REMESSA',
    'Ajuste de Inventário Positivo': 'AJUSTE_POSITIVO',
    'Ajuste de Inventário Negativo': 'AJUSTE_NEGATIVO',
    'Ordem de Separação': 'ORDEM_SEPARACAO',
    'Ordem de Montagem/Desmontagem': 'ORDEM_MONTAGEM',
  });

  const camposEspecificos: CampoConfig[] = formData.tipo_documento 
    ? CAMPOS_POR_TIPO[formData.tipo_documento as TipoDocumento] || []
    : [];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.numero.trim()) newErrors.numero = 'Número é obrigatório';
    if (!formData.tipo_documento) newErrors.tipo_documento = 'Tipo é obrigatório';
    if (!formData.data_registro) newErrors.data_registro = 'Data de registro é obrigatória';
    if (!formData.valor || Number(formData.valor) < 0) newErrors.valor = 'Valor deve ser maior ou igual a zero';
    if (!formData.empresa_id) newErrors.empresa_id = 'Empresa é obrigatória';

    // Validar campos específicos obrigatórios
    camposEspecificos.forEach(campo => {
      if (campo.required && !formData[campo.name]) {
        newErrors[campo.name] = `${campo.label} é obrigatório`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Limpar campos não utilizados para o tipo selecionado
    const cleanedData: any = {
      numero: formData.numero,
      tipo_documento: formData.tipo_documento,
      data_registro: formData.data_registro,
      valor: Number(formData.valor),
      empresa_id: Number(formData.empresa_id),
    };

    if (formData.data_entrada) cleanedData.data_entrada = formData.data_entrada;
    if (formData.observacoes) cleanedData.observacoes = formData.observacoes;

    // Adicionar apenas campos relevantes para o tipo
    camposEspecificos.forEach(campo => {
      if (formData[campo.name]) {
        if (campo.name.includes('_id')) {
          cleanedData[campo.name] = Number(formData[campo.name]);
        } else {
          cleanedData[campo.name] = formData[campo.name];
        }
      }
    });

    await onSubmit(cleanedData);
  };

  const renderCampoEspecifico = (campo: CampoConfig) => {
    if (campo.type === 'select' && campo.name.includes('local')) {
      return (
        <select
          value={formData[campo.name] || ''}
          onChange={(e) => setFormData({ ...formData, [campo.name]: e.target.value })}
          style={{
            ...styles.input,
            ...(errors[campo.name] ? styles.inputError : {})
          }}
        >
          <option value="">Selecione...</option>
          {locais.map((local: any) => (
            <option key={local.id} value={local.id}>
              {local.codigo} - {local.nome}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={campo.type}
        value={formData[campo.name] || ''}
        onChange={(e) => setFormData({ ...formData, [campo.name]: e.target.value })}
        style={{
          ...styles.input,
          ...(errors[campo.name] ? styles.inputError : {})
        }}
        placeholder={campo.placeholder}
        maxLength={campo.maxLength}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGrid}>
        {/* Campos básicos */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Tipo de Documento *
            <select
              value={formData.tipo_documento}
              onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
              style={{
                ...styles.input,
                ...(errors.tipo_documento ? styles.inputError : {})
              }}
              disabled={!!documento}
            >
              <option value="">Selecione...</option>
              {tiposDocumento.map(([label, value]) => (
                <option key={value} value={label}>{label}</option>
              ))}
            </select>
          </label>
          {errors.tipo_documento && <span style={styles.errorText}>{errors.tipo_documento}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Número *
            <input
              type="text"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              style={{
                ...styles.input,
                ...(errors.numero ? styles.inputError : {})
              }}
              placeholder="Número do documento"
              maxLength={50}
            />
          </label>
          {errors.numero && <span style={styles.errorText}>{errors.numero}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Empresa *
            <select
              value={formData.empresa_id}
              onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
              style={{
                ...styles.input,
                ...(errors.empresa_id ? styles.inputError : {})
              }}
            >
              <option value="">Selecione...</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.razao_social}
                </option>
              ))}
            </select>
          </label>
          {errors.empresa_id && <span style={styles.errorText}>{errors.empresa_id}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Data Registro *
            <input
              type="date"
              value={formData.data_registro}
              onChange={(e) => setFormData({ ...formData, data_registro: e.target.value })}
              style={{
                ...styles.input,
                ...(errors.data_registro ? styles.inputError : {})
              }}
            />
          </label>
          {errors.data_registro && <span style={styles.errorText}>{errors.data_registro}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Data Entrada
            <input
              type="date"
              value={formData.data_entrada}
              onChange={(e) => setFormData({ ...formData, data_entrada: e.target.value })}
              style={styles.input}
            />
          </label>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Valor *
            <input
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              style={{
                ...styles.input,
                ...(errors.valor ? styles.inputError : {})
              }}
            />
          </label>
          {errors.valor && <span style={styles.errorText}>{errors.valor}</span>}
        </div>

        {/* Campos específicos por tipo */}
        {camposEspecificos.map((campo) => (
          <div key={campo.name} style={styles.formGroup}>
            <label style={styles.label}>
              {campo.label} {campo.required && '*'}
              {renderCampoEspecifico(campo)}
            </label>
            {errors[campo.name] && <span style={styles.errorText}>{errors[campo.name]}</span>}
          </div>
        ))}

        {/* Observações sempre visível */}
        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
          <label style={styles.label}>
            Observações
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
              maxLength={1000}
            />
          </label>
        </div>
      </div>

      <div style={styles.buttonGroup}>
        <button type="button" onClick={onCancel} style={styles.cancelButton} disabled={isLoading}>
          Cancelar
        </button>
        <button type="submit" style={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Salvando...' : documento ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}

const styles = {
  container: {
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600' as const,
    color: '#1f2937',
    margin: 0,
  },
  addButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500' as const,
    color: 'white',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    marginBottom: '20px',
    color: '#1f2937',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500' as const,
    color: '#374151',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: '12px',
    color: '#ef4444',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  cancelButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500' as const,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500' as const,
    color: 'white',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '20px',
    color: '#6b7280',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '12px',
    fontWeight: '600' as const,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#1f2937',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '6px 12px',
    fontSize: '13px',
    color: '#3b82f6',
    backgroundColor: 'transparent',
    border: '1px solid #3b82f6',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '6px 12px',
    fontSize: '13px',
    color: '#ef4444',
    backgroundColor: 'transparent',
    border: '1px solid #ef4444',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
