import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiEye } from 'react-icons/fi';

function BlocoEquipeAtiva({ entregadores }) {
  // Garante que 'entregadores' seja sempre um array para evitar erros
  const equipe = entregadores || [];
  
  const maxAvatares = 4;
  const entregadoresVisiveis = equipe.slice(0, maxAvatares);
  const entregadoresOcultos = equipe.length - maxAvatares;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between h-full dark:bg-slate-800">
      <div>
        <h3 className="font-semibold text-lg text-gray-800 dark:text-slate-200 mb-4 flex items-center">
          <FiUsers className="mr-2 text-gray-400 dark:text-slate-500" />
          Equipe em Rota
        </h3>
        
        {equipe.length > 0 ? (
          <div className="flex items-center space-x-2">
            {/* Avatares dos entregadores */}
            <div className="flex -space-x-4">
              {entregadoresVisiveis.map(entregador => (
                <img
                  key={entregador.id}
                  className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 object-cover shadow"
                  src={entregador.fotoUrl || `https://i.pravatar.cc/48?u=${entregador.id}`}
                  alt={entregador.nome}
                  title={entregador.nome}
                />
              ))}
            </div>
            
            {/* Contador para entregadores ocultos */}
            {entregadoresOcultos > 0 && (
              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold border-2 border-white dark:bg-slate-700 dark:text-slate-300 dark:border-slate-800 shadow">
                +{entregadoresOcultos}
              </div>
            )}
            
            <p className="font-bold text-3xl text-gray-700 dark:text-slate-300 ml-4">{equipe.length}</p>
          </div>
        ) : (
          <p className="text-gray-400 dark:text-slate-500 text-sm mt-4">Nenhum entregador em rota.</p>
        )}
      </div>

      <Link 
        to="/entregas/operacao"
        className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 text-center"
      >
        <FiEye />
        <span>Ver Operação </span>
      </Link>
    </div>
  );
}

export default BlocoEquipeAtiva;