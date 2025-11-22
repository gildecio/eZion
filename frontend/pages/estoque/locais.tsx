import React from 'react';
import Layout from '@/shared/layouts/Layout';
import LocaisCRUD from '@/features/estoque/components/LocaisCRUD';

export default function LocaisPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locais de Armazenamento</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gerencie os locais onde os itens do estoque são armazenados
          </p>
        </div>
        <LocaisCRUD />
      </div>
    </Layout>
  );
}
