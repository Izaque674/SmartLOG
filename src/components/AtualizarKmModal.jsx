import React, { useState } from 'react';

function AtualizarKmModal({ veiculo, onClose, onSave }) {
  const [novaKm, setNovaKm] = useState(veiculo.km_atual);
  const [erro, setErro] = useState('');

  const handleSaveClick = () => {
    const kmNumerico = parseInt(novaKm, 10);
    
    if (isNaN(kmNumerico) || kmNumerico < veiculo.km_atual) {
      setErro(`A nova quilometragem deve ser um número maior ou igual a ${veiculo.km_atual}.`);
      return;
    }
    
    // Chama a função onSave passada pelo componente pai (DetalhesVeiculoPage)
    onSave(veiculo.id, kmNumerico);
    onClose(); // Fecha o modal após salvar
  };

  return (
    // Overlay de fundo
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      {/* Conteúdo do Modal */}
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Atualizar Quilometragem</h2>
        <p className="text-gray-600 mb-6">
          Veículo: <span className="font-semibold">{veiculo.modelo} ({veiculo.placa})</span>
        </p>

        <div>
          <label htmlFor="km_atual" className="block text-sm font-medium text-gray-700">
            Nova Quilometragem Total (KM)
          </label>
          <input
            type="number"
            id="km_atual"
            value={novaKm}
            onChange={(e) => setNovaKm(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus // Foca no input assim que o modal abre
          />
        </div>
        
        {erro && <p className="text-red-500 text-sm mt-2">{erro}</p>}

        {/* Botões de Ação */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveClick}
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 active:scale-95 transition-all"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AtualizarKmModal;