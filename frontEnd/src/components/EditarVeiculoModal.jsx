import React, { useState } from 'react';

function EditarVeiculoModal({ veiculo, onClose, onSave }) {
  // Cria um estado para o formulário, inicializado com os dados atuais do veículo
  const [formData, setFormData] = useState({
    placa: veiculo.placa || '',
    modelo: veiculo.modelo || '',
    ano: veiculo.ano || '',
  });
  const [error, setError] = useState('');

  // Função para atualizar o estado conforme o usuário digita
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validação simples para garantir que os campos não estão vazios
    if (!formData.placa || !formData.modelo || !formData.ano) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    // Chama a função onSave, passando os dados atualizados
    onSave({
      ...formData,
      ano: parseInt(formData.ano, 10), // Garante que o ano seja um número
    });
    onClose(); // Fecha o modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4">Editar Informações do Veículo</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="placa" className="block text-sm font-medium text-gray-700">Placa</label>
              <input
                id="placa"
                name="placa"
                type="text"
                value={formData.placa}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="modelo" className="block text-sm font-medium text-gray-700">Modelo</label>
              <input
                id="modelo"
                name="modelo"
                type="text"
                value={formData.modelo}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="ano" className="block text-sm font-medium text-gray-700">Ano</label>
              <input
                id="ano"
                name="ano"
                type="number"
                value={formData.ano}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

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
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarVeiculoModal;