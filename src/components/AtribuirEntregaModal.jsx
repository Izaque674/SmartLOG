// src/components/AtribuirEntregaModal.jsx

import React, { useState } from 'react';

function AtribuirEntregaModal({ entrega, entregadores, onClose, onConfirm }) {
  const [entregadorId, setEntregadorId] = useState('');
  
  const handleConfirm = () => {
    if (!entregadorId) {
      alert('Por favor, selecione um entregador.');
      return;
    }
    onConfirm(entrega.id, parseInt(entregadorId));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Enviar Entrega</h2>
        <p className="text-gray-600 mb-6">
          Atribuir a entrega do pedido <span className="font-semibold">{entrega.pedido}</span> para um entregador.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700">Selecione o Entregador</label>
          <select
            value={entregadorId}
            onChange={(e) => setEntregadorId(e.target.value)}
            className="mt-1 w-full px-4 py-2 border rounded-md bg-white"
          >
            <option value="" disabled>Selecione...</option>
            {entregadores.map(entregador => (
              <option key={entregador.id} value={entregador.id}>
                {entregador.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-md">Cancelar</button>
          <button onClick={handleConfirm} className="px-6 py-2 text-white bg-green-600 rounded-md">Confirmar e Enviar</button>
        </div>
      </div>
    </div>
  );
}

export default AtribuirEntregaModal;