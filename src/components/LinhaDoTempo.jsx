import React, { useState } from 'react';
import EventoTimeline from './EventoTimeline';
import { FiPlay, FiFlag, FiChevronDown, FiChevronUp } from 'react-icons/fi';

/**
 * LinhaDoTempo com transição suave, mantém tamanho do bloco e conteúdo interno rolável.
 * - bloco externo tem altura fixa (ajuste h-72 conforme necessário)
 * - conteúdo interno faz slide + fade
 * - quando fechado, mostra resumo mas bloco não muda de tamanho
 */
function LinhaDoTempo({ eventos = [], jornada }) {
  const [open, setOpen] = useState(true);

  const startTime = jornada?.dataInicio
    ? new Date(jornada.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '—';
  const endTime = jornada?.dataFim
    ? new Date(jornada.dataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 dark:bg-slate-800 transition-all" style={{ maxWidth: '100%' }}>
      {/* Cabeçalho (sempre visível) */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Linha do Tempo da Jornada</h2>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            {open ? 'Expandida' : 'Fechada'}
          </div>

          <button
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Fechar linha do tempo' : 'Abrir linha do tempo'}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-transform"
            title={open ? 'Fechar' : 'Abrir'}
          >
            {/* ícone rotaciona suavemente */}
            <span className={`inline-block transform transition-transform duration-300 ${open ? 'rotate-0' : 'rotate-180'}`}>
              {open ? <FiChevronUp className="h-5 w-5" /> : <FiChevronDown className="h-5 w-5" />}
            </span>
          </button>
        </div>
      </div>

      {/* Bloco fixo: altera só o conteúdo interno para não mudar o tamanho do componente */}
      <div className="relative overflow-hidden rounded-md" style={{ height: 320 /* ajuste conforme necessário (px) para manter tamanho constante) */ }}>
        {/* Linha vertical decorativa (visível sempre) */}
        <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-gray-100 dark:bg-slate-700 z-0" />

        {/* Conteúdo com slide/fade (mantém altura total) */}
        <div
          className={`absolute inset-0 transition-all duration-300 ease-in-out z-10 flex flex-col`}
          style={{
            transform: open ? 'translateY(0)' : 'translateY(-6%)',
            opacity: open ? 1 : 0.0,
            pointerEvents: open ? 'auto' : 'none'
          }}
        >
          {/* área interna rolável (o "deslize") */}
          <div className="px-8 pt-1 pb-4 overflow-y-auto pr-4">
            {/* Evento de Início */}
            <div className="relative pl-0 mb-6">
              <div className="absolute left-[-18px] top-2 h-8 w-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center ring-4 ring-white dark:ring-slate-800 z-20">
                <FiPlay className="text-green-500" />
              </div>
              <div className="ml-2">
                <p className="font-bold text-gray-500 dark:text-slate-400 text-sm">{startTime}</p>
                <p className="text-gray-700 dark:text-slate-300">Início da jornada de trabalho.</p>
              </div>
            </div>

            {/* Eventos intermediários (scrollable) */}
            {(eventos || []).map(evento => (
              <div key={evento.id} className="mb-4">
                <EventoTimeline evento={evento} />
              </div>
            ))}

            {/* Evento de Fim */}
            {endTime && (
              <div className="relative pl-0 mt-2">
                <div className="absolute left-[-18px] top-1 h-8 w-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center ring-4 ring-white dark:ring-slate-800 z-20">
                  <FiFlag className="text-gray-500" />
                </div>
                <div className="ml-2">
                  <p className="font-bold text-gray-500 dark:text-slate-400 text-sm">{endTime}</p>
                  <p className="text-gray-700 dark:text-slate-300">Fim da jornada de trabalho.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visualização compacta quando fechado — ocupa mesmo espaço mas não quebra layout */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-20`}
          style={{ opacity: open ? 0 : 1, pointerEvents: open ? 'none' : 'auto' }}
          aria-hidden={open}
        >
          <div className="text-center px-6">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">
              {`Eventos: ${eventos?.length || 0}`}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {`Início: ${startTime}${endTime ? ` • Fim: ${endTime}` : ''}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinhaDoTempo;