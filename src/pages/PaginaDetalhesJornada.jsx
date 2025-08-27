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
    <tr className="border-b hover:bg-gray-50">
      <td className="p-4 font-medium flex items-center space-x-3">
        <img src={entregador.fotoUrl || `https://i.pravatar.cc/40?u=${entregador.id}`} alt={entregador.nome} className="w-10 h-10 rounded-full" />
        <span>{entregador.nome}</span>
      </td>
      <td className="p-4 text-center font-bold">{total}</td>
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
    return <div className="flex justify-center items-center h-screen">Carregando detalhes da jornada...</div>;
  }

  if (!dados) {
    return <div>Jornada não encontrada.</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm p-4 flex items-center space-x-4">
        <Link to="/entregas/controle" className="text-gray-500 hover:text-gray-800">
          <FiArrowLeft size={24} />
        </Link>
        <div>
            <h1 className="text-xl font-semibold text-gray-800">Análise da Jornada</h1>
            <p className="text-sm text-gray-500">
                {/* --- CORREÇÃO APLICADA AQUI --- */}
                {/* Simplesmente passamos a string da data para o construtor Date */}
                Finalizada em: {new Date(dados.jornada.dataFim).toLocaleString('pt-BR')}
            </p>
        </div>
      </header>
      <main className="p-8">
        {/* Seção de Resumo/KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <FiClipboard size={32} className="mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-gray-500">Total de Entregas</p>
                <p className="text-3xl font-bold">{dados.jornada.resumo.totalEntregas}</p>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <FiCheckCircle size={32} className="mx-auto text-green-500 mb-2" />
                <p className="text-sm text-gray-500">Concluídas</p>
                <p className="text-3xl font-bold">{dados.jornada.resumo.concluidas}</p>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <FiXCircle size={32} className="mx-auto text-red-500 mb-2" />
                <p className="text-sm text-gray-500">Falhas</p>
                <p className="text-3xl font-bold">{dados.jornada.resumo.falhas}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <FiTruck size={32} className="mx-auto text-gray-500 mb-2" />
                <p className="text-sm text-gray-500">Entregadores na Jornada</p>
                <p className="text-3xl font-bold">{dados.entregadores.length}</p>
            </div>
        </div>

        {/* Tabela de Desempenho por Entregador */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Desempenho da Equipe</h2>
            </div>
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase">
                    <tr>
                        <th className="p-4">Entregador</th>
                        <th className="p-4 text-center">Total Atribuído</th>
                        <th className="p-4 text-center">Concluídas</th>
                        <th className="p-4 text-center">Falhas</th>
                    </tr>
                </thead>
                <tbody>
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
      </main>
    </div>
  );
}

export default PaginaDetalhesJornada;