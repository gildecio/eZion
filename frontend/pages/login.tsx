import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { empresaService } from '@/features/contabil/services/empresa.service';
import type { Empresa } from '@/features/contabil/types/empresa';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      const data = await empresaService.getAll();
      console.log('Empresas carregadas:', data);
      setEmpresas(data);
      if (data.length > 0) {
        setEmpresaId(data[0].id);
      }
      // Limpar erro se conseguiu carregar
      setError('');
    } catch (err: any) {
      console.error('Erro ao carregar empresas:', err);
      const errorMsg = err.message || 'Erro de conexão com o servidor';
      
      // Verificar se é erro de rede
      if (errorMsg.includes('NetworkError') || errorMsg.includes('fetch')) {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 8000.');
      } else {
        setError('Erro ao carregar empresas: ' + errorMsg);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!empresaId) {
      setError('Selecione uma empresa');
      return;
    }

    setLoading(true);

    try {
      await login(username, password, empresaId);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="brand">
          <h1>eZion ERP</h1>
          <p>Sistema Integrado de Gestão Empresarial</p>
        </div>
        <div className="features">
          <div className="feature">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            <span>Gestão de Estoque Completa</span>
          </div>
          <div className="feature">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 3v18"/>
            </svg>
            <span>Controle Financeiro</span>
          </div>
          <div className="feature">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <span>Gestão de Vendas</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="form-header">
            <h2>Acesso ao Sistema</h2>
            <p>Entre com suas credenciais</p>
          </div>

          {error && (
            <div className="error-alert">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
              {error.includes('servidor') && (
                <button
                  type="button"
                  onClick={loadEmpresas}
                  className="retry-btn"
                  style={{ marginLeft: 'auto', padding: '0.25rem 0.75rem', background: '#556b2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  Tentar novamente
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="empresa">Empresa</label>
              <select
                id="empresa"
                value={empresaId || ''}
                onChange={(e) => setEmpresaId(Number(e.target.value))}
                required
                disabled={loading}
              >
                <option value="">Selecione uma empresa...</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.razao_social} - {empresa.cnpj}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="username">Usuário</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="login-hint">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 4v4M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Usuário padrão: <strong>admin</strong> / Senha: <strong>admin</strong></span>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }

        .login-left {
          background: linear-gradient(135deg, #556b2f 0%, #6d8b3c 100%);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem;
        }

        .brand {
          margin-bottom: 4rem;
        }

        .brand h1 {
          font-size: 3rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
        }

        .brand p {
          font-size: 1.25rem;
          opacity: 0.9;
          margin: 0;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .feature svg {
          flex-shrink: 0;
        }

        .feature span {
          font-size: 1.125rem;
        }

        .login-right {
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .login-form-wrapper {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
          padding: 3rem;
          width: 100%;
          max-width: 450px;
        }

        .form-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .form-header h2 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }

        .form-header p {
          color: #6b7280;
          margin: 0;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #991b1b;
          margin-bottom: 1.5rem;
        }

        .error-alert svg {
          flex-shrink: 0;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group select {
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #556b2f;
          box-shadow: 0 0 0 3px rgba(85, 107, 47, 0.1);
        }

        .form-group input:disabled,
        .form-group select:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .btn-login {
          padding: 0.875rem 1.5rem;
          background: #556b2f;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .btn-login:hover:not(:disabled) {
          background: #465a26;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(85, 107, 47, 0.3);
        }

        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #dbeafe;
          border-radius: 8px;
          color: #1e40af;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .login-hint svg {
          flex-shrink: 0;
        }

        @media (max-width: 1024px) {
          .login-container {
            grid-template-columns: 1fr;
          }

          .login-left {
            display: none;
          }

          .login-right {
            min-height: 100vh;
          }
        }

        @media (max-width: 640px) {
          .login-form-wrapper {
            padding: 2rem 1.5rem;
          }

          .form-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
