import React from 'react';
import { FiX, FiEdit, FiTrash2, FiPhone, FiTruck, FiMapPin } from 'react-icons/fi';

function PerfilEntregadorModal({ entregador, onClose, onEdit, onDelete }) {
  // Se por algum motivo o modal for renderizado sem um entregador, não mostra nada.
  if (!entregador) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative animate-slide-up">
        
        {/* Botão de Fechar no canto */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar modal"
        >
          <FiX size={24} />
        </button>

        {/* Conteúdo do Perfil */}
        <div className="p-6 pt-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <img 
              src={entregador.fotoUrl || `https://i.pravatar.cc/150?u=${entregador.id}`} 
              alt={entregador.nome} 
              className="w-32 h-32 rounded-full border-4 border-gray-100 shadow-md object-cover"
            />
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{entregador.nome}</h2>
              <div className="mt-3 space-y-2 text-gray-600">
                <p className="flex items-center justify-center sm:justify-start">
                  <FiPhone size={14} className="mr-2 text-gray-400" />
                  {entregador.telefone || 'Telefone não informado'}
                </p>
                <p className="flex items-center justify-center sm:justify-start">
                  <FiTruck size={14} className="mr-2 text-gray-400" />
                  {entregador.veiculo || 'Veículo não informado'}
                </p>
                <p className="flex items-center justify-center sm:justify-start">
                  <FiMapPin size={14} className="mr-2 text-gray-400" />
                  {entregador.rota || 'Rota não informada'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com os botões de Ação */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg border-t">
          <button 
            onClick={onEdit} // Chama a função onEdit passada pelo Dashboard
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <FiEdit />
            <span>Editar</span>
          </button>
          <button 
            onClick={onDelete} // Chama a função onDelete passada pelo Dashboard
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            <FiTrash2 />
            <span>Excluir</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PerfilEntregadorModal;