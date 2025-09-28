// ...existing code...
import React, { useState, useMemo } from 'react';
import { FiCheckCircle, FiXCircle, FiTruck, FiChevronUp, FiChevronDown } from 'react-icons/fi';

// Componente para a linha da tabela de entregas
function EntregaRow({ entrega, nomeEntregador }) {
  const statusInfo = {
    'Em Trânsito': { text: 'text-blue-600', icon: <FiTruck /> },
    'Concluída': { text: 'text-green-600', icon: <FiCheckCircle /> },
    'Falhou': { text: 'text-red-600', icon: <FiXCircle /> }
  };
  const info = statusInfo[entrega.status] || { text: 'text-gray-600', icon: null };

  return (
    <tr className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-900">
      <td className={`p-4 font-semibold ${info.text} flex items-center`}>
        {info.icon}
        <span className="ml-2">{entrega.status}</span>
      </td>
      <td className="p-4 text-gray-800 dark:text-slate-200">{entrega.cliente}</td>
      <td className="p-4 text-gray-600 dark:text-slate-400">{entrega.endereco}</td>
      <td className="p-4 text-gray-600 dark:text-slate-400">{entrega.pedido}</td>
      <td className="p-4 text-gray-600 dark:text-slate-400">{nomeEntregador}</td>
    </tr>
  );
}

function TabelaEntregasJornada({ entregas = [], entregadores = [] }) {
  const [open, setOpen] = useState(true);

  // Cria um "mapa" de ID do entregador para nome, para fácil consulta.
  const entregadorMap = useMemo(() =>
    new Map(entregadores.map(e => [e.id, e.nome]))
  , [entregadores]);

  // KPIs rápidos para a visualização compacta
  const kpis = useMemo(() => {
    const total = entregas.length;
    const concluidas = entregas.filter(e => e.status === 'Concluída').length;
    const falhas = entregas.filter(e => e.status === 'Falhou').length;
    const transit = entregas.filter(e => e.status === 'Em Trânsito').length;
    return { total, concluidas, falhas, transit };
  }, [entregas]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-slate-800 transition-all">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Lista de Entregas da Jornada</h2>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 dark:text-slate-400">{open ? 'Expandida' : 'Fechada'}</div>
          <button
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Fechar tabela' : 'Abrir tabela'}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-transform"
            title={open ? 'Fechar' : 'Abrir'}
          >
            <span className={`inline-block transform transition-transform duration-300 ${open ? 'rotate-0' : 'rotate-180'}`}>
              {open ? <FiChevronUp className="h-5 w-5" /> : <FiChevronDown className="h-5 w-5" />}
            </span>
          </button>
        </div>
      </div>

      {/* Bloco fixo igual ao da LinhaDoTempo (altura 320px) */}
      <div className="relative overflow-hidden" style={{ height: 320 }}>
        {/* Conteúdo detalhado (scroll interno) */}
        <div
          className="absolute inset-0 transition-all duration-300 ease-in-out z-10"
          style={{
            transform: open ? 'translateY(0)' : 'translateY(-6%)',
            opacity: open ? 1 : 0,
            pointerEvents: open ? 'auto' : 'none'
          }}
        >
          <div className="h-full overflow-y-auto">
            <div className="overflow-x-auto px-4 pb-4 pt-2">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 uppercase">
                  <tr>
                    <th className="p-4">Status</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Endereço</th>
                    <th className="p-4">Pedido/OBS</th>
                    <th className="p-4">Atribuído a</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {entregas.length > 0 ? (
                    entregas.map(entrega => (
                      <EntregaRow
                        key={entrega.id}
                        entrega={entrega}
                        nomeEntregador={entregadorMap.get(entrega.entregadorId) || 'N/A'}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-8 text-gray-500 dark:text-slate-400">
                        Nenhuma entrega registrada para esta jornada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Visualização compacta quando fechado — ocupa mesmo espaço */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-20"
          style={{ opacity: open ? 0 : 1, pointerEvents: open ? 'none' : 'auto' }}
          aria-hidden={open}
        >
          <div className="text-center px-6">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-2">{`Total: ${kpis.total}`}</div>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-600" /> <span>{kpis.concluidas}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiXCircle className="text-red-600" /> <span>{kpis.falhas}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiTruck className="text-blue-600" /> <span>{kpis.transit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TabelaEntregasJornada;
