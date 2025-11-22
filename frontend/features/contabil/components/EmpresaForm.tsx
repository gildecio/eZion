import { useState, useEffect } from 'react';
import type { Empresa, CreateEmpresaDTO, UpdateEmpresaDTO } from '../types';
import { formatCNPJ } from '@/utils/formatters';
import { isValidCNPJ } from '@/utils/validators';

interface EmpresaFormProps {
  empresa?: Empresa;
  onSubmit: (data: CreateEmpresaDTO | UpdateEmpresaDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EmpresaForm({ empresa, onSubmit, onCancel, isLoading }: EmpresaFormProps) {
  const [formData, setFormData] = useState({
    razao_social: empresa?.razao_social || '',
    cnpj: empresa?.cnpj || '',
    ativo: empresa?.ativo ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cnpjDisplay, setCnpjDisplay] = useState('');

  useEffect(() => {
    if (empresa?.cnpj) {
      setCnpjDisplay(formatCNPJ(empresa.cnpj));
    }
  }, [empresa]);

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, cnpj: value });
    setCnpjDisplay(formatCNPJ(value));
    
    if (errors.cnpj) {
      setErrors({ ...errors, cnpj: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.razao_social.trim()) {
      newErrors.razao_social = 'Razão social é obrigatória';
    }

    if (!formData.cnpj) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!isValidCNPJ(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="empresa-form">
      <div className="form-group">
        <label htmlFor="razao_social">
          Razão Social <span className="required">*</span>
        </label>
        <input
          type="text"
          id="razao_social"
          value={formData.razao_social}
          onChange={(e) => {
            setFormData({ ...formData, razao_social: e.target.value });
            if (errors.razao_social) {
              setErrors({ ...errors, razao_social: '' });
            }
          }}
          className={errors.razao_social ? 'error' : ''}
          disabled={isLoading}
          placeholder="Digite a razão social"
        />
        {errors.razao_social && <span className="error-message">{errors.razao_social}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="cnpj">
          CNPJ <span className="required">*</span>
        </label>
        <input
          type="text"
          id="cnpj"
          value={cnpjDisplay}
          onChange={handleCNPJChange}
          className={errors.cnpj ? 'error' : ''}
          disabled={isLoading}
          placeholder="00.000.000/0000-00"
          maxLength={18}
        />
        {errors.cnpj && <span className="error-message">{errors.cnpj}</span>}
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={formData.ativo}
            onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
            disabled={isLoading}
          />
          <span>Ativo</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={isLoading} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Salvando...' : empresa ? 'Atualizar' : 'Cadastrar'}
        </button>
      </div>

      <style jsx>{`
        .empresa-form {
          max-width: 600px;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .required {
          color: #ef4444;
        }

        .form-group input[type="text"] {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .form-group input[type="text"]:focus {
          outline: none;
          border-color: #556b2f;
          box-shadow: 0 0 0 3px rgba(85, 107, 47, 0.1);
        }

        .form-group input.error {
          border-color: #ef4444;
        }

        .error-message {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.875rem;
          color: #ef4444;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          width: 1.25rem;
          height: 1.25rem;
          margin-right: 0.5rem;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 0.875rem;
        }

        .btn-primary {
          background: #556b2f;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #6b8e23;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-primary:disabled,
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}
