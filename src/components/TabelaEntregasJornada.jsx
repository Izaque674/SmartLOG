import React from 'react';
import { FiCheckCircle, FiXCircle, FiTruck } from 'react-icons/fi';

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

function TabelaEntregasJornada({ entregas, entregadores }) {
  // Cria um "mapa" de ID do entregador para nome, para fácil consulta.
  const entregadorMap = React.useMemo(() => 
    new Map(entregadores.map(e => [e.id, e.nome]))
  , [entregadores]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-slate-800">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Lista de Entregas da Jornada</h2>
      </div>
      <div className="overflow-x-auto">
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
                  // Busca o nome do entregador no mapa
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
  );
}

export default TabelaEntregasJornada;