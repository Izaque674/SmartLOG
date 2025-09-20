import React from 'react';
import { FiPlusCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';

function EventoTimeline({ evento }) {
  // Converte o timestamp (que vem como string ISO do back-end) para um objeto Date
  const time = new Date(evento.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit'
  });
  
  // Mapeamento de ícones com base no TIPO do evento
  const ICONS = {
    'CRIACAO': <FiPlusCircle className="text-blue-500" />,
    // Agora o tipo é 'STATUS', e olhamos para 'novoStatus' para o ícone
    'STATUS': evento.novoStatus === 'Concluída' 
              ? <FiCheckCircle className="text-green-500" />
              : <FiXCircle className="text-red-500" />,
  };
  
  const icon = ICONS[evento.tipo] || null;

  return (
    <div className="relative pl-8">
      {/* Linha vertical da timeline */}
      <div className="absolute left-[2px] top-1 h-full w-0.5 bg-gray-200 dark:bg-slate-700"></div>
      
      {/* Ponto do evento com o ícone */}
      <div className="absolute left-[-9px] top-1 h-5 w-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center ring-4 ring-gray-100 dark:ring-slate-900">
        {icon}
      </div>
      
      {/* Conteúdo do evento */}
      <div className="mb-6">
        <p className="font-bold text-gray-500 dark:text-slate-400 text-sm">{time}</p>
        <p className="text-gray-700 dark:text-slate-300">{evento.texto}</p>
      </div>
    </div>
  );
}

export default EventoTimeline;