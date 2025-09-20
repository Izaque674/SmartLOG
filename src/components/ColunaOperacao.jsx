import React from 'react';
import CardEntrega from './CardEntrega.jsx';
import { FiPlus } from 'react-icons/fi';

function ColunaOperacao({ entregador, entregas = [], onAddEntregaClick, onUpdateStatus }) {
  
  return (
    <div className="flex-shrink-0 w-full md:w-80 bg-gray-100 rounded-xl p-3 shadow-sm border border-gray-200 dark:bg-slate-800/50 dark:border-slate-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800 dark:text-slate-200">{entregador.nome}</h3>
        <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full dark:bg-blue-900/50 dark:text-blue-200">
          {entregas.length}
        </span>
      </div>

      <button 
        onClick={() => onAddEntregaClick(entregador.id)}
        className="w-full flex justify-center items-center space-x-2 py-2.5 mb-3 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
      >
        <FiPlus />
        <span>Adicionar Entrega</span>
      </button>

      <div className="space-y-3 h-[calc(100vh-250px)] overflow-y-auto pr-1">
        {entregas.map(entrega => (
          <CardEntrega 
            key={entrega.id} 
            entrega={entrega}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
        {entregas.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-10 dark:text-slate-500">Nenhuma entrega atribuída.</p>
        )}
      </div>
    </div>
  );
}

export default ColunaOperacao;