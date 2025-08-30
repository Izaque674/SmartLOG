import React from 'react';
import useTimer from '../hooks/useTimer'; // Importa nosso novo hook
import { FiLogOut } from 'react-icons/fi';

function BlocoStatusJornada({ jornada, onFinalizar }) {
  // A data de início precisa ser convertida para um formato que o hook entenda
  const dataInicioISO = jornada.dataInicio ? new Date(jornada.dataInicio.toDate()).toISOString() : null;
  const tempoDecorrido = useTimer(dataInicioISO);

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg flex flex-col justify-between h-full">
      <div>
        <h3 className="font-semibold text-lg text-gray-300">Jornada em Andamento</h3>
        <p className="text-4xl font-bold tracking-tighter my-2">{tempoDecorrido}</p>
        {jornada.dataInicio && (
          <p className="text-xs text-gray-400">
            Iniciada às {new Date(jornada.dataInicio.toDate()).toLocaleTimeString('pt-BR')}
          </p>
        )}
      </div>
      <button 
        onClick={onFinalizar} 
        className="w-full mt-4 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
      >
        <FiLogOut />
        <span>Finalizar Dia</span>
      </button>
    </div>
  );
}

export default BlocoStatusJornada;