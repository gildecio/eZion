import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AjusteEstoqueCRUD from '@/features/estoque/components/AjusteEstoqueCRUD';

export default function AjustesPage() {
  const { empresa } = useAuth();

  if (!empresa) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Selecione uma empresa para continuar</p>
      </div>
    );
  }

  return <AjusteEstoqueCRUD empresaId={empresa.id} />;
}
