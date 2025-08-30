import React, { useState } from 'react';

function AdicionarEntregaModal({ onClose, onSave }) {
  // Estado para os campos de UMA ENTREGA
  const [formData, setFormData] = useState({
    cliente: '',
    endereco: '',
    pedido: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log('[MODAL-DEBUG] Botão Salvar clicado. Dados do formulário de ENTREGA:', formData);

    if (!formData.cliente || !formData.endereco) {
      alert('Cliente e Endereço são obrigatórios.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSave}>
          <h2 className="text-xl font-bold mb-4">Adicionar Nova Entrega</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="cliente" className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
              <input 
                id="cliente" 
                name="cliente" 
                type="text" 
                value={formData.cliente} 
                onChange={handleChange} 
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" 
                required 
              />
            </div>
            <div>
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">Endereço de Entrega</label>
              <input 
                id="endereco" 
                name="endereco" 
                type="text" 
                value={formData.endereco} 
                onChange={handleChange} 
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" 
                required 
              />
            </div>
            <div>
              <label htmlFor="pedido" className="block text-sm font-medium text-gray-700">Nº do Pedido / Observação</label>
              <input 
                id="pedido" 
                name="pedido" 
                type="text" 
                value={formData.pedido} 
                onChange={handleChange} 
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" 
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
              Salvar Entrega
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdicionarEntregaModal;