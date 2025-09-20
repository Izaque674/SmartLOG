import React, { useMemo } from 'react';
import { FiClipboard, FiCheckCircle, FiXCircle } from 'react-icons/fi';

function BlocoProgresso({ entregas }) {
  const stats = useMemo(() => {
    if (!entregas) return { total: 0, concluidas: 0, falhas: 0, progresso: 0 };
    
    const total = entregas.length;
    const concluidas = entregas.filter(e => e.status === 'Concluída').length;
    const falhas = entregas.filter(e => e.status === 'Falhou').length;
    const progresso = total > 0 ? (concluidas / total) * 100 : 0;
    
    return { total, concluidas, falhas, progresso };
  }, [entregas]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between h-full col-span-1 md:col-span-2 dark:bg-slate-800">
      <div>
        <h3 className="font-semibold text-lg text-gray-800 dark:text-slate-200 mb-4">Progresso do Dia</h3>
        
        {/* Barra de Progresso */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2 dark:bg-slate-700">
          <div 
            className="bg-green-500 h-4 rounded-full transition-all duration-500" 
            style={{ width: `${stats.progresso}%` }}
          ></div>
        </div>
        <p className="text-right text-sm font-bold text-gray-600 dark:text-slate-400">{stats.progresso.toFixed(0)}% Concluído</p>
      </div>

      {/* Números Detalhados */}
      <div className="mt-4 flex justify-around text-center">
        <div>
          <p className="text-2xl font-bold text-blue-600 flex items-center justify-center space-x-2">
            <FiClipboard />
            <span className="dark:text-blue-400">{stats.total}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">Total</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600 flex items-center justify-center space-x-2">
            <FiCheckCircle />
            <span className="dark:text-green-400">{stats.concluidas}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">Concluídas</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-600 flex items-center justify-center space-x-2">
            <FiXCircle />
            <span className="dark:text-red-400">{stats.falhas}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">Falhas</p>
        </div>
      </div>
    </div>
  );
}

export default BlocoProgresso;