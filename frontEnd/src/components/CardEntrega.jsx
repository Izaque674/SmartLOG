import React from 'react';
import { FiMapPin, FiCheckCircle, FiX, FiInfo, FiTruck } from 'react-icons/fi';

function CardEntrega({ entrega }) {
  // =======================================================
  // === LOG DE DEPURAÇÃO FINAL ===
  // =======================================================
  // Este log nos dirá se este componente específico está sendo
  // re-renderizado e qual o valor de 'entrega.status' que ele recebeu.
  console.log(`CARD RENDER: ID ${entrega.id} com status "${entrega.status}"`);

  const statusInfo = {
    'Pendente': { 
      icon: <FiInfo className="text-gray-500" />, 
      bg: 'bg-gray-100', 
      text: 'text-gray-700',
      borderColor: 'border-gray-400'
    },
    'Em Trânsito': { 
      icon: <FiTruck className="text-blue-500" />, 
      bg: 'bg-blue-100', 
      text: 'text-blue-800',
      borderColor: 'border-blue-500'
    },
    'Concluída': { 
      icon: <FiCheckCircle className="text-green-500" />, 
      bg: 'bg-green-100', 
      text: 'text-green-800',
      borderColor: 'border-green-500'
    },
    'Falhou': { 
      icon: <FiX className="text-red-500" />, 
      bg: 'bg-red-100', 
      text: 'text-red-800',
      borderColor: 'border-red-500'
    },
  };

  const currentStatus = statusInfo[entrega.status] || statusInfo['Pendente'];

  return (
    <div className={`p-4 rounded-lg shadow-sm border-l-4 ${currentStatus.bg}`} style={{ borderColor: currentStatus.borderColor }}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-gray-800">{entrega.cliente}</p>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <FiMapPin className="mr-2 flex-shrink-0" />
            <span>{entrega.endereco}</span>
          </div>
        </div>
        <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${currentStatus.text} ${currentStatus.bg}`}>
          {currentStatus.icon}
          <span className="ml-1.5">{entrega.status}</span>
        </div>
      </div>
    </div>
  );
}

export default CardEntrega;