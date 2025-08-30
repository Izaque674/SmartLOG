import React, { useState } from 'react';
import { FiPlay } from 'react-icons/fi';

function IniciarJornadaModal({ entregadores, onClose, onIniciar }) {
  // Estado para guardar os IDs dos entregadores selecionados
  const [selecionados, setSelecionados] = useState([]);
  const [error, setError] = useState('');

  // Função para adicionar/remover um entregador da lista de selecionados
  const handleToggle = (id) => {
    setError(''); // Limpa o erro ao interagir
    setSelecionados(prev => 
      prev.includes(id) ? prev.filter(selId => selId !== id) : [...prev, id]
    );
  };

  const handleConfirmar = () => {
    if (selecionados.length === 0) {
      setError('Selecione pelo menos um entregador para iniciar o dia.');
      return;
    }
    onIniciar(selecionados); // Passa a lista de IDs para a função principal
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative animate-slide-up">
        <h2 className="text-xl font-bold mb-2">Iniciar Dia de Entregas</h2>
        <p className="text-gray-600 mb-4">Selecione os entregadores que participarão da operação de hoje.</p>

        <div className="space-y-2 max-h-64 overflow-y-auto border p-3 rounded-md bg-gray-50">
          {entregadores.length > 0 ? (
            entregadores.map(entregador => (
              <label key={entregador.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selecionados.includes(entregador.id)}
                  onChange={() => handleToggle(entregador.id)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <img src={entregador.fotoUrl || `https://i.pravatar.cc/40?u=${entregador.id}`} alt={entregador.nome} className="w-10 h-10 rounded-full object-cover" />
                <span className="font-medium text-gray-800">{entregador.nome}</span>
              </label>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Nenhum entregador cadastrado.</p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleConfirmar}
            disabled={selecionados.length === 0}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FiPlay />
            <span>Iniciar com {selecionados.length} Entregador(es)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default IniciarJornadaModal;