import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SequenciasCRUD } from '@/features/configuracoes';

const SequenciasPage: React.FC = () => {
  const { empresa } = useAuth();

  if (!empresa) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Selecione uma empresa para gerenciar sequências</p>
      </div>
    );
  }

  return <SequenciasCRUD empresaId={empresa.id} />;
};

export default SequenciasPage;
