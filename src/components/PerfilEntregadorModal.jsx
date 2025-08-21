import React, { useState, useEffect } from 'react';

// O modal agora pode receber um entregador existente para edição
function AdicionarEntregadorModal({ onClose, onSave, entregadorExistente }) {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    veiculo: '',
    rota: ''
  });
  const [error, setError] = useState('');

  // Se for uma edição, preenche o formulário com os dados existentes
  useEffect(() => {
    if (entregadorExistente) {
      setFormData({
        nome: entregadorExistente.nome || '',
        telefone: entregadorExistente.telefone || '',
        veiculo: entregadorExistente.veiculo || '',
        rota: entregadorExistente.rota || ''
      });
    }
  }, [entregadorExistente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome) {
      setError('O nome é obrigatório.');
      return;
    }
    // A função onSave agora recebe apenas os dados do formulário
    onSave(formData);
    onClose();
  };

  const isEditing = !!entregadorExistente;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4">
            {isEditing ? 'Editar Entregador' : 'Adicionar Novo Entregador'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium">Nome Completo</label>
              <input id="nome" name="nome" type="text" value={formData.nome} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium">Telefone</label>
              <input id="telefone" name="telefone" type="text" value={formData.telefone} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="veiculo" className="block text-sm font-medium">Veículo Utilizado</label>
              <input id="veiculo" name="veiculo" type="text" value={formData.veiculo} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ex: Moto Honda CG 160" />
            </div>
            <div>
              <label htmlFor="rota" className="block text-sm font-medium">Rota Principal / Área</label>
              <input id="rota" name="rota" type="text" value={formData.rota} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ex: Zona Sul, Centro" />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AdicionarEntregadorModal;