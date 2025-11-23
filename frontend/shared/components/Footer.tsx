import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const Footer: React.FC = () => {
  const { empresa } = useAuth();

  if (!empresa) return null;

  return (
    <>
      <footer className="app-footer">
        <div className="empresa-info">
          <div className="empresa-label">Empresa Selecionada:</div>
          <div className="empresa-details">
            <strong>{empresa.razao_social}</strong>
            <span className="cnpj">CNPJ: {empresa.cnpj}</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .app-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #556b2f;
          color: white;
          padding: 0.75rem 2rem;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .empresa-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .empresa-label {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .empresa-details {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .empresa-details strong {
          font-size: 0.95rem;
        }

        .cnpj {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .app-footer {
            padding: 0.5rem 1rem;
          }

          .empresa-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .empresa-details {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
    </>
  );
};
