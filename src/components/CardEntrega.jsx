import React from 'react';
import { FiMapPin, FiCheckCircle, FiXCircle, FiTruck, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';

// O card agora recebe a função onUpdateStatus
function CardEntrega({ entrega, onUpdateStatus }) {
  const statusInfo = {
    'Em Trânsito': { bg: 'bg-blue-100', borderColor: 'border-blue-500', icon: <FiTruck className="text-blue-500" /> },
    'Concluída': { bg: 'bg-green-100', borderColor: 'border-green-500', icon: <FiCheckCircle className="text-green-500" /> },
    'Falhou': { bg: 'bg-red-100', borderColor: 'border-red-500', icon: <FiXCircle className="text-red-500" /> },
  };
  const currentStatus = statusInfo[entrega.status] || statusInfo['Em Trânsito'];

  return (
    <div className={`p-3 rounded-lg shadow-sm border-l-4 ${currentStatus.bg} ${currentStatus.borderColor} space-y-2`}>
      {/* Informações da entrega */}
      <div>
        <p className="font-bold text-gray-800">{entrega.cliente}</p>
        <p className="text-xs text-gray-600">{entrega.pedido}</p>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <FiMapPin className="mr-1.5 flex-shrink-0" />
          <span>{entrega.endereco}</span>
        </div>
      </div>
      
      {/* Badge de Status e Botões de Ação */}
      <div className="flex justify-between items-center border-t pt-2">
        <div className={`flex items-center text-xs font-semibold`}>
          {currentStatus.icon}
          <span className="ml-1.5">{entrega.status}</span>
        </div>
        {/* Mostra os botões apenas se a entrega estiver 'Em Trânsito' */}
        {entrega.status === 'Em Trânsito' && (
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => onUpdateStatus(entrega.id, 'Concluída')}
              className="p-1.5 text-green-600 bg-green-100 rounded-full hover:bg-green-200"
              title="Marcar como Concluída"
            >
              <FiThumbsUp size={14} />
            </button>
            <button
              onClick={() => onUpdateStatus(entrega.id, 'Falhou')}
              className="p-1.5 text-red-600 bg-red-100 rounded-full hover:bg-red-200"
              title="Marcar como Falhou"
            >
              <FiThumbsDown size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default CardEntrega;