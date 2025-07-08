// src/components/RegistrarServicoModal.jsx

import React, { useState } from 'react';

function RegistrarServicoModal({ veiculo, item, onClose, onSave }) {
  const [km, setKm] = useState(veiculo.km_atual);
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');

  const handleSave = () => {
    const kmNumerico = parseInt(km, 10);
    if (isNaN(kmNumerico) || kmNumerico < veiculo.km_atual) {
      setErro(`A quilometragem deve ser um número e não pode ser menor que a última registrada (${veiculo.km_atual} km).`);
      return;
    }
    onSave(veiculo.id, item.id, kmNumerico, observacoes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Registrar Manutenção Realizada</h2>
        <p className="text-gray-600 mb-6">Serviço: <span className="font-semibold">{item.nome}</span></p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quilometragem no momento do serviço
            </label>
            <input
              type="number"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Observações (opcional)</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows="3"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: Peças trocadas, nome da oficina..."
            />
          </div>
        </div>

        {erro && <p className="text-red-500 text-sm mt-2">{erro}</p>}

        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-md">Cancelar</button>
          <button onClick={handleSave} className="px-6 py-2 text-white bg-blue-600 rounded-md">Salvar Registro</button>
        </div>
      </div>
    </div>
  );
}
export default RegistrarServicoModal;