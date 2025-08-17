import React, { useState } from 'react';

function RegistrarServicoModal({ item, veiculoKm, onClose, onSave }) {
  // Inicializamos o formulário com dados padrão
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0], // Pega a data de hoje no formato YYYY-MM-DD
    km_servico: veiculoKm || '',
    custo: '',
    observacoes: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.data || !formData.km_servico) {
      setError('Data e Quilometragem são obrigatórios.');
      return;
    }

    // Prepara os dados para salvar, convertendo o que for necessário para número
    const dadosParaSalvar = {
      ...formData,
      custo: parseFloat(formData.custo) || 0,
      km_servico: parseInt(formData.km_servico, 10),
    };

    onSave(dadosParaSalvar);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-2">Registrar Serviço Realizado</h2>
          <p className="text-gray-600 mb-4">Item: <span className="font-semibold">{item.nome}</span></p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="data" className="block text-sm font-medium text-gray-700">Data do Serviço</label>
              <input id="data" name="data" type="date" value={formData.data} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label htmlFor="km_servico" className="block text-sm font-medium text-gray-700">KM no momento do Serviço</label>
              <input id="km_servico" name="km_servico" type="number" value={formData.km_servico} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label htmlFor="custo" className="block text-sm font-medium text-gray-700">Custo (R$) <span className="text-gray-400">(Opcional)</span></label>
              <input id="custo" name="custo" type="number" step="0.01" value={formData.custo} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ex: 150.50" />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Observações <span className="text-gray-400">(Opcional)</span></label>
            <textarea id="observacoes" name="observacoes" value={formData.observacoes} onChange={handleChange} rows="3" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ex: Utilizado óleo 5W-30 sintético."></textarea>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar Registro</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegistrarServicoModal;