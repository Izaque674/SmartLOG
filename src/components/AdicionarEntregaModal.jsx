import React, { useState } from 'react';

function AdicionarEntregaModal({ onClose, onSave }) {
  // # MUDANÇA 1: Adicionar 'tipo' e 'valorCobrar' ao estado inicial
  const [formData, setFormData] = useState({
    cliente: '',
    endereco: '',
    pedido: '',
    tipo: 'Entrega', // Valor padrão
    valorCobrar: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Converte o valor para número antes de salvar
    const dadosParaSalvar = {
        ...formData,
        valorCobrar: parseFloat(formData.valorCobrar) || 0,
    };

    if (!dadosParaSalvar.cliente || !dadosParaSalvar.endereco) {
      alert('Cliente e Endereço são obrigatórios.');
      return;
    }
    onSave(dadosParaSalvar);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSave}>
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Adicionar Nova Tarefa</h2>
          
          <div className="space-y-4">
            
            {/* # MUDANÇA 2: Seletor de Tipo (Entrega/Coleta) */}
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Tipo de Tarefa</label>
              <select 
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option>Entrega</option>
                <option>Coleta</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Nome do Cliente</label>
                <input 
                  id="cliente" name="cliente" type="text" value={formData.cliente} onChange={handleChange} 
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" required 
                />
              </div>

              {/* # MUDANÇA 3: Campo de Valor a Cobrar */}
              <div>
                <label htmlFor="valorCobrar" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Valor a Cobrar (R$)</label>
                <input 
                  id="valorCobrar" name="valorCobrar" type="number" step="0.01" placeholder="0.00"
                  value={formData.valorCobrar} onChange={handleChange} 
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                />
              </div>
            </div>

            <div>
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Endereço</label>
              <input 
                id="endereco" name="endereco" type="text" value={formData.endereco} onChange={handleChange} 
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" required 
              />
            </div>

            <div>
              <label htmlFor="pedido" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Nº do Pedido / Observação</label>
              <textarea 
                id="pedido" name="pedido" value={formData.pedido} onChange={handleChange} rows="2"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
              Salvar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdicionarEntregaModal;