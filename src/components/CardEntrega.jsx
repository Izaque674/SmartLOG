import React from 'react';
import { FiMapPin, FiCheckCircle, FiXCircle, FiTruck, FiThumbsUp, FiThumbsDown, FiAlertCircle } from 'react-icons/fi';

function CardEntrega({ entrega, onUpdateStatus }) {
  // # MUDANÇA 1: A nova condição para o destaque
  // O card fica roxo se foi concluído E requer atenção.
  const requerAtencao = entrega.status === 'Concluída' && entrega.requerAtencao === true;

  const statusInfo = {
    'Em Trânsito': { 
      bg: 'bg-blue-100', 
      borderColor: 'border-blue-500', 
      icon: <FiTruck className="text-blue-500" /> 
    },
    // # MUDANÇA 2: Estilo condicional para o status 'Concluída'
    'Concluída': { 
      bg: requerAtencao ? 'bg-purple-100' : 'bg-green-100',
      borderColor: requerAtencao ? 'border-purple-500' : 'border-green-500',
      icon: <FiCheckCircle className={requerAtencao ? "text-purple-500" : "text-green-500"} />
    },
    'Falhou': { 
      bg: 'bg-red-100',
      borderColor: 'border-red-500',
      icon: <FiXCircle className="text-red-500" />
    },
  };

  const currentStatus = statusInfo[entrega.status] || statusInfo['Em Trânsito'];

  return (
    <div className={`p-3 rounded-lg shadow-sm border-l-4 ${currentStatus.bg} ${currentStatus.borderColor} space-y-2 transition-colors duration-300`}>
      <div>
        <p className="font-bold text-gray-800 dark:text-slate-200">{entrega.cliente}</p>
        <p className="text-xs text-gray-600 dark:text-slate-400">{entrega.pedido}</p>
        <div className="flex items-center text-sm text-gray-500 dark:text-slate-400 mt-1">
          <FiMapPin className="mr-1.5 flex-shrink-0" />
          <span>{entrega.endereco}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center border-t dark:border-slate-600 pt-2">
        <div className={`flex items-center text-xs font-semibold`}>
          {currentStatus.icon}
          {/* # MUDANÇA 3: Texto do status muda para indicar a pendência */}
          <span className="ml-1.5">{requerAtencao ? 'Concluída (com Obs.)' : entrega.status}</span>
        </div>
        
        {entrega.status === 'Em Trânsito' && (
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => onUpdateStatus(entrega.id, 'Concluída')}
              className="p-1.5 text-green-600 bg-green-100 rounded-full hover:bg-green-200"
              title="Marcar como Concluída"
            ><FiThumbsUp size={14} /></button>
            <button
              onClick={() => onUpdateStatus(entrega.id, 'Falhou')}
              className="p-1.5 text-red-600 bg-red-100 rounded-full hover:bg-red-200"
              title="Marcar como Falhou"
            ><FiThumbsDown size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardEntrega;