import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext, API_URL } from '../context/AppContext.jsx';
import { FiArrowLeft, FiClipboard, FiCheckCircle, FiXCircle, FiTruck } from 'react-icons/fi';

// Componente para a linha da tabela de desempenho
function DesempenhoRow({ entregador, entregas }) {
  const concluidas = entregas.filter(e => e.status === 'Concluída').length;
  const falhas = entregas.filter(e => e.status === 'Falhou').length;
  const total = entregas.length;

  return (
    <tr className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-900">
      <td className="p-4 font-medium flex items-center space-x-3">
        <img src={entregador.fotoUrl || `https://i.pravatar.cc/40?u=${entregador.id}`} alt={entregador.nome} className="w-10 h-10 rounded-full object-cover" />
        <span className="text-gray-800 dark:text-slate-200">{entregador.nome}</span>
      </td>
      <td className="p-4 text-center font-bold text-gray-700 dark:text-slate-300">{total}</td>
      <td className="p-4 text-center font-bold text-green-600">{concluidas}</td>
      <td className="p-4 text-center font-bold text-red-600">{falhas}</td>
    </tr>
  );
}

function PaginaDetalhesJornada() {
  const { jornadaId } = useParams();
  const { user } = useAppContext();
  const [dados, setDados] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !jornadaId) return;

    const fetchDetalhes = async () => {
      try {
        const response = await fetch(`${API_URL}/jornadas/${jornadaId}/detalhes`);
        if (!response.ok) throw new Error('Falha ao buscar detalhes da jornada');
        const data = await response.json();
        setDados(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetalhes();
  }, [user, jornadaId]);

  const entregasPorEntregador = useMemo(() => {
    if (!dados) return {};
    const agrupado = {};
    dados.entregadores.forEach(entregador => {
      agrupado[entregador.id] = dados.entregas.filter(e => e.entregadorId === entregador.id);
    });
    return agrupado;
  }, [dados]);


  if (isLoading) {
    return <div className="p-8 text-center">Carregando detalhes da jornada...</div>;
  }

  if (!dados) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-slate-300">Jornada não encontrada</h2>
        <Link to="/entregas/historico" className="mt-4 text-blue-600 hover:underline">Voltar para o histórico</Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        
        {/* --- BOTÃO DE VOLTAR ADICIONADO AQUI --- */}
        <div className="mb-6">
          <Link 
            to="/entregas/historico" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <FiArrowLeft />
            Voltar para o Histórico
          </Link>
        </div>

        {/* Seção de Resumo/KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center dark:bg-slate-800">
                <FiClipboard size={32} className="mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-gray-500 dark:text-slate-400">Total de Entregas</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{dados.jornada.resumo.totalEntregas}</p>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md text-center dark:bg-slate-800">
                <FiCheckCircle size={32} className="mx-auto text-green-500 mb-2" />
                <p className="text-sm text-gray-500 dark:text-slate-400">Concluídas</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{dados.jornada.resumo.concluidas}</p>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md text-center dark:bg-slate-800">
                <FiXCircle size={32} className="mx-auto text-red-500 mb-2" />
                <p className="text-sm text-gray-500 dark:text-slate-400">Falhas</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{dados.jornada.resumo.falhas}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center dark:bg-slate-800">
                <FiTruck size={32} className="mx-auto text-gray-500 dark:text-slate-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-slate-400">Entregadores na Jornada</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{dados.entregadores.length}</p>
            </div>
        </div>

        {/* Tabela de Desempenho por Entregador */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-slate-800">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Desempenho da Equipe</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 uppercase">
                        <tr>
                            <th className="p-4">Entregador</th>
                            <th className="p-4 text-center">Total Atribuído</th>
                            <th className="p-4 text-center">Concluídas</th>
                            <th className="p-4 text-center">Falhas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {dados.entregadores.map(entregador => (
                            <DesempenhoRow 
                                key={entregador.id} 
                                entregador={entregador}
                                entregas={entregasPorEntregador[entregador.id] || []}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}

export default PaginaDetalhesJornada;