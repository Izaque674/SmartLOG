import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiEye } from 'react-icons/fi';

function BlocoEquipeAtiva({ entregadores }) {
  // Define quantos avatares mostrar antes de agrupar com um "+..."
  const maxAvatares = 4;
  const entregadoresVisiveis = entregadores.slice(0, maxAvatares);
  const entregadoresOcultos = entregadores.length - maxAvatares;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between h-full">
      <div>
        <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
          <FiUsers className="mr-2 text-gray-400" />
          Equipe em Rota
        </h3>
        
        {entregadores && entregadores.length > 0 ? (
          <div className="flex items-center space-x-2">
            {/* Avatares dos entregadores */}
            <div className="flex -space-x-4">
              {entregadoresVisiveis.map(entregador => (
                <img
                  key={entregador.id}
                  className="w-12 h-12 rounded-full border-2 border-white object-cover shadow"
                  src={entregador.fotoUrl || `https://i.pravatar.cc/48?u=${entregador.id}`}
                  alt={entregador.nome}
                  title={entregador.nome} // Mostra o nome ao passar o mouse
                />
              ))}
            </div>
            {/* Contador para entregadores ocultos */}
            {entregadoresOcultos > 0 && (
              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold border-2 border-white shadow">
                +{entregadoresOcultos}
              </div>
            )}
            <p className="font-bold text-3xl text-gray-700 ml-4">{entregadores.length}</p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm mt-4">Nenhum entregador na jornada.</p>
        )}
      </div>

      <Link 
        to="/entregas/operacao"
        className="w-full mt-6 bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 text-center"
      >
        <FiEye />
        <span>Ver Operação no Kanban</span>
      </Link>
    </div>
  );
}

export default BlocoEquipeAtiva;