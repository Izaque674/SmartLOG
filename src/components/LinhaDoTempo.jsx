import React from 'react';
import EventoTimeline from './EventoTimeline';
import { FiPlay, FiFlag } from 'react-icons/fi';

function LinhaDoTempo({ eventos = [], jornada }) {
  const startTime = new Date(jornada.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const endTime = jornada.dataFim ? new Date(jornada.dataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 dark:bg-slate-800">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Linha do Tempo da Jornada</h2>
      <div className="relative">
        <div className="absolute left-[2px] top-1 bottom-1 w-0.5 bg-gray-200 dark:bg-slate-700"></div>
        {/* Evento de Início */}
        <div className="relative pl-8">
            <div className="absolute left-[-9px] top-1 h-5 w-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center ring-4 ring-white dark:ring-slate-800">
                <FiPlay className="text-green-500" />
            </div>
            <div className="mb-6">
                <p className="font-bold text-gray-500 dark:text-slate-400 text-sm">{startTime}</p>
                <p className="text-gray-700 dark:text-slate-300">Início da jornada de trabalho.</p>
            </div>
        </div>
        
        {/* Eventos intermediários */}
        {eventos.map(evento => <EventoTimeline key={evento.id} evento={evento} />)}

        {/* Evento de Fim */}
        {endTime && (
            <div className="relative pl-8">
            <div className="absolute left-[-9px] top-1 h-5 w-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center ring-4 ring-white dark:ring-slate-800">
                <FiFlag className="text-gray-500" />
            </div>
            <div>
                <p className="font-bold text-gray-500 dark:text-slate-400 text-sm">{endTime}</p>
                <p className="text-gray-700 dark:text-slate-300">Fim da jornada de trabalho.</p>
            </div>
            </div>
        )}
      </div>
    </div>
  );
}
export default LinhaDoTempo;