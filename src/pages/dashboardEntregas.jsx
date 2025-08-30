import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext, API_URL } from '../context/AppContext.jsx';
import AdicionarEntregaModal from '../components/AdicionarEntregaModal.jsx';
import ColunaOperacao from '../components/ColunaOperacao.jsx'; // Usando o componente isolado
import CardEntrega from '../components/CardEntrega.jsx'; // Embora não usado aqui, é bom ter em mente
import { FiArrowLeft } from 'react-icons/fi';

function DashboardOperacaoEntregas() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const [entregadoresAtivos, setEntregadoresAtivos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalEntregaOpen, setIsModalEntregaOpen] = useState(false);
  const [entregadorParaNovaEntrega, setEntregadorParaNovaEntrega] = useState(null);

  // Função para buscar dados da API de operação
  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/operacao/${user.uid}`);
      if (!response.ok) throw new Error('Falha ao buscar dados da operação');
      const data = await response.json();
      
      // Verifica se a jornada ainda está ativa
      if (data.entregadoresAtivos.length === 0 && data.entregasAtivas.length === 0 && !isLoading) {
        navigate('/entregas/controle');
      } else {
        setEntregadoresAtivos(data.entregadoresAtivos);
        setEntregas(data.entregasAtivas);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da operação:", error);
      navigate('/entregas/controle'); // Em caso de erro, volta para o controle
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para buscar dados periodicamente (polling)
  useEffect(() => {
    if (!user) return;
    fetchData(); // Busca inicial
    const intervalId = setInterval(fetchData, 5000); // Re-busca a cada 5 segundos
    return () => clearInterval(intervalId); // Limpa o intervalo ao sair da página
  }, [user, navigate, isLoading]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleAbrirModalEntrega = (entregadorId) => {
    setEntregadorParaNovaEntrega(entregadorId);
    setIsModalEntregaOpen(true);
  };
  
  const handleSalvarNovaEntrega = async (dadosDaEntrega) => {
    try {
      await fetch(`${API_URL}/entregas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dadosDaEntrega, entregadorId: entregadorParaNovaEntrega }),
      });
      setIsModalEntregaOpen(false);
    } catch (error) {
      console.error("Erro ao salvar entrega:", error);
      alert("Falha ao adicionar a entrega.");
    }
  };
  
  // Função para o gestor atualizar o status de uma entrega
  const handleUpdateStatus = async (entregaId, novoStatus) => {
    try {
      const response = await fetch(`${API_URL}/entregas/${entregaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar o status da entrega na API');
      }
      
      // Força uma re-busca imediata dos dados para refletir a mudança
      await fetchData();

    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Não foi possível atualizar o status da entrega.");
    }
  };
  
  const entregasPorEntregador = useMemo(() => {
    const agrupado = {};
    entregadoresAtivos.forEach(entregador => {
      agrupado[entregador.id] = entregas.filter(e => e.entregadorId === entregador.id);
    });
    return agrupado;
  }, [entregas, entregadoresAtivos]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando Operação...</div>;
  }

  return (
    <div className="relative">
      <div className="bg-white min-h-screen flex flex-col">
        <header className="sticky top-0 bg-white/80 backdrop-blur-lg z-10 border-b p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/entregas/controle" className="text-gray-500 hover:text-gray-800"><FiArrowLeft size={24} /></Link>
            <h1 className="text-2xl font-bold text-gray-800">Operação de Entregas (Ao Vivo)</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Olá, {user?.email}</span>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-red-600">Sair</button>
          </div>
        </header>
        <main className="flex-grow flex space-x-4 p-4 overflow-x-auto">
          {entregadoresAtivos.length > 0 ? (
            entregadoresAtivos.map(entregador => (
              <ColunaOperacao
                key={entregador.id}
                entregador={entregador}
                entregas={entregasPorEntregador[entregador.id] || []}
                onAddEntregaClick={handleAbrirModalEntrega}
                onUpdateStatus={handleUpdateStatus} // Passa a função para a coluna
              />
            ))
          ) : (
            <div className="w-full text-center mt-10">
              <p className="text-gray-500">Nenhum entregador foi designado para esta jornada.</p>
              <Link to="/entregas/controle" className="mt-2 text-blue-600 hover:underline">
                Voltar para o painel de controle.
              </Link>
            </div>
          )}
        </main>
      </div>
      
      {isModalEntregaOpen && (
        <AdicionarEntregaModal 
          onClose={() => setIsModalEntregaOpen(false)} 
          onSave={handleSalvarNovaEntrega} 
        />
      )}
    </div>
  );
}

export default DashboardOperacaoEntregas;