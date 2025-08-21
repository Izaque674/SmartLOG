import React, { useState, useEffect } from 'react';
import { FiUpload } from 'react-icons/fi';

// O modal agora pode receber um entregador existente para edição
function AdicionarEntregadorModal({ onClose, onSave, entregadorExistente }) {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    veiculo: '',
    rota: ''
  });
  const [fotoFile, setFotoFile] = useState(null); // Para o arquivo da foto
  const [fotoPreview, setFotoPreview] = useState(null); // Para a pré-visualização da imagem
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Se for uma edição, preenche o formulário com os dados existentes
  useEffect(() => {
    if (entregadorExistente) {
      setFormData({
        nome: entregadorExistente.nome || '',
        telefone: entregadorExistente.telefone || '',
        veiculo: entregadorExistente.veiculo || '',
        rota: entregadorExistente.rota || ''
      });
      if (entregadorExistente.fotoUrl) {
        setFotoPreview(entregadorExistente.fotoUrl);
      }
    }
  }, [entregadorExistente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      // Cria uma URL temporária para a pré-visualização
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome) {
      setError('O nome é obrigatório.');
      return;
    }
    // A função onSave agora recebe tanto os dados do formulário quanto o arquivo da foto
    onSave(formData, fotoFile, setIsUploading);
  };

  const isEditing = !!entregadorExistente;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4">
            {isEditing ? 'Editar Entregador' : 'Adicionar Novo Entregador'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Coluna da Foto */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Entregador</label>
              <div className="w-32 h-32 rounded-full bg-gray-200 mb-2 flex items-center justify-center overflow-hidden">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FiUpload className="text-gray-400" size={40} />
                )}
              </div>
              <input 
                type="file" 
                id="fotoInput" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFotoChange}
              />
              <label htmlFor="fotoInput" className="cursor-pointer bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-md border hover:bg-gray-200">
                Escolher Arquivo
              </label>
            </div>

            {/* Coluna dos Dados */}
            <div className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium">Nome Completo</label>
                <input id="nome" name="nome" type="text" value={formData.nome} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium">Telefone</label>
                <input id="telefone" name="telefone" type="text" value={formData.telefone} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>

            {/* Campos de Veículo e Rota */}
            <div className="md:col-span-2">
              <label htmlFor="veiculo" className="block text-sm font-medium">Veículo Utilizado</label>
              <input id="veiculo" name="veiculo" type="text" value={formData.veiculo} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ex: Moto Honda CG 160, Placa ABC-1234" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="rota" className="block text-sm font-medium">Rota Principal / Área de Atuação</label>
              <input id="rota" name="rota" type="text" value={formData.rota} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ex: Zona Sul, Centro" />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md" disabled={isUploading}>Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400" disabled={isUploading}>
              {isUploading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AdicionarEntregadorModal