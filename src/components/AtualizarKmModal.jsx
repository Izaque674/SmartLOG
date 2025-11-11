import React, { useState } from 'react';

function AtualizarKmModal({ veiculo, onClose, onSave }) {
  // Estado para armazenar o valor do input da nova quilometragem
  const [novaKm, setNovaKm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const kmNumerico = parseInt(novaKm, 10);
    const kmAtual = parseInt(veiculo.km_atual, 10);

    // Validação: Garante que um valor foi digitado
    if (!novaKm) {
      setError('Por favor, insira a nova quilometragem.');
      return;
    }

    // Validação: Garante que a nova KM não é menor que a atual
    if (kmNumerico < kmAtual) {
      setError(`A nova quilometragem não pode ser menor que a atual (${kmAtual.toLocaleString('pt-BR')} km).`);
      return;
    }


    onClose();



     try {
    await onSave(kmNumerico); // Espera a função onSave (que é uma promise) terminar
  } catch (error) {
    console.error("Erro ao salvar a KM:", error);
    // Você pode reabrir o modal com uma mensagem de erro se quiser
    setError("Falha ao salvar. Tente novamente."); 
  }
  };


  return (
    // Overlay do modal
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Conteúdo do modal */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-2">Atualizar Quilometragem</h2>
          <p className="text-sm text-gray-600 mb-4">
            Veículo: {veiculo.placa} ({veiculo.modelo})
          </p>

          <div>
            <label htmlFor="novaKm" className="block text-sm font-medium text-gray-700">
              Nova Quilometragem Total (KM)
            </label>
            <input
              id="novaKm"
              type="number"
              value={novaKm}
              onChange={(e) => setNovaKm(e.target.value)}
              placeholder={veiculo.km_atual.toLocaleString('pt-BR')}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              autoFocus // Foca no input assim que o modal abre
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {/* Botões de ação */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AtualizarKmModal;