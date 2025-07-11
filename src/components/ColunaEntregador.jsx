// src/components/ColunaEntregador.jsx

import React from 'react';
import CardEntrega from './CardEntrega.jsx';
import { FiPlus } from 'react-icons/fi';

function ColunaEntregador({ entregador, entregas, onAddEntrega, onUpdateStatus }) {
  return (
    <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4 bg-gray-50 rounded-xl p-4 border border-gray-200">
      {/* Cabeçalho da Coluna */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">{entregador.nome}</h3>
        <span className="text-sm font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
          {entregas.length}
        </span>
      </div>

      {/* Botão de Adicionar */}
      <button 
        onClick={() => onAddEntrega(entregador.id)}
        className="w-full flex justify-center items-center space-x-2 py-3 mb-4 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all"
      >
        <FiPlus />
        <span>Adicionar Entrega</span>
      </button>

      {/* Lista de Cards de Entrega */}
      <div className="space-y-3 h-[calc(100vh-250px)] overflow-y-auto pr-2">
        {entregas.map(entrega => (
          <CardEntrega 
            key={entrega.id} 
            entrega={entrega}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
        {entregas.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-10">Nenhuma entrega atribuída.</p>
        )}
      </div>
    </div>
  );
}

export default ColunaEntregador;