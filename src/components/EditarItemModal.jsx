import React, { useState, useEffect } from 'react'; // Adicionado useEffect

function EditarItemModal({ item, onClose, onSave }) {
  
  // --- A CORREÇÃO PRINCIPAL ESTÁ AQUI ---
  // Se 'item' não for passado (ou for nulo), não renderize nada e evite o erro.
  if (!item) {
    return null; 
  }
  // --- FIM DA CORREÇÃO ---

  // Estado para o formulário, agora inicializado de forma segura
  const [formData, setFormData] = useState({
    nome: '',
    intervalo_km: '',
  });
  const [error, setError] = useState('');

  // # MUDANÇA ADICIONAL: Usar useEffect para popular o formulário quando o 'item' mudar
  // Isso garante que o formulário sempre tenha os dados mais recentes, mesmo se o modal permanecer montado.
  useEffect(() => {
    if (item) {
      setFormData({
        nome: item.nome || '',
        intervalo_km: item.intervalo_km || '',
      });
    }
  }, [item]); // Roda sempre que a prop 'item' mudar

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

    if (!formData.nome || !formData.intervalo_km) {
      setError('Ambos os campos são obrigatórios.');
      return;
    }

    // Passa os dados atualizados para a função onSave
    onSave({
      ...formData,
      intervalo_km: parseInt(formData.intervalo_km, 10),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md dark:bg-slate-800">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Editar Item de Manutenção</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Nome do Serviço</label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="intervalo_km" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Intervalo (em KM)</label>
              <input
                id="intervalo_km"
                name="intervalo_km"
                type="number"
                value={formData.intervalo_km}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarItemModal;