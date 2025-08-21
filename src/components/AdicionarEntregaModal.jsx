// src/components/AdicionarEntregaModal.jsx

import React, { useState } from 'react';

function AdicionarEntregaModal({ onClose, onSave }) {
  const [cliente, setCliente] = useState('');
  const [endereco, setEndereco] = useState('');
  const [pedido, setPedido] = useState('');
  const [isSaving, setIsSaving] = useState(false); // Estado para o feedback do botão

  const handleSave = async () => {
    if (!cliente || !endereco || !pedido) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setIsSaving(true); // Desabilita botões e mostra texto "Salvando..."
    await onSave({ cliente, endereco, pedido });
    setIsSaving(false); // Reabilita os botões
    onClose(); // Fecha o modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Adicionar Nova Entrega</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nº do Pedido/Nota</label>
            <input type="text" value={pedido} onChange={(e) => setPedido(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
            <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Endereço de Entrega</label>
            <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-md" />
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} disabled={isSaving} className="px-6 py-2 bg-gray-200 rounded-md disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 text-white bg-blue-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? 'Salvando...' : 'Salvar Entrega'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdicionarEntregaModal;