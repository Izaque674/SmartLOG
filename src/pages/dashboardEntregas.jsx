import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext, API_URL } from '../context/AppContext.jsx';
import AdicionarEntregaModal from '../components/AdicionarEntregaModal.jsx';
import ColunaOperacao from '../components/ColunaOperacao.jsx';
// A importação do Header e dos ícones não é mais necessária aqui

function DashboardOperacaoEntregas() {
  const { user } = useAppContext(); // Não precisamos do logout aqui
  const navigate = useNavigate();

  const [entregadoresAtivos, setEntregadoresAtivos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalEntregaOpen, setIsModalEntregaOpen] = useState(false);
  const [entregadorParaNovaEntrega, setEntregadorParaNovaEntrega] = useState(null);

  const fetchData = async () => {
    // A função fetchData permanece a mesma
    try {
      const response = await fetch(`${API_URL}/operacao/${user.uid}`);
      if (!response.ok) throw new Error('Falha ao buscar dados da operação');
      const data = await response.json();
      
      if (data.entregadoresAtivos.length === 0 && data.entregasAtivas.length === 0 && !isLoading) {
        navigate('/entregas/controle');
      } else {
        setEntregadoresAtivos(data.entregadoresAtivos);
        setEntregas(data.entregasAtivas);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da operação:", error);
      navigate('/entregas/controle');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // O useEffect permanece o mesmo
    if (user) {
      fetchData();
      const intervalId = setInterval(fetchData, 5000);
      return () => clearInterval(intervalId);
    }
  }, [user, navigate, isLoading]);

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
      await fetchData();
    } catch (error) {
      console.error("Erro ao salvar entrega:", error);
      alert("Falha ao adicionar a entrega.");
    }
  };
  
  const handleUpdateStatus = async (entregaId, novoStatus) => {
    try {
      const response = await fetch(`${API_URL}/entregas/${entregaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (!response.ok) throw new Error('Falha ao atualizar o status');
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
    // A tela de loading agora fica dentro do padding da página
    return (
        <div className="p-8 flex justify-center items-center">
            <p>Carregando Operação...</p>
        </div>
    );
  }

  return (
    // O Header e a div de fundo foram removidos.
    // A altura é calculada para preencher o espaço ABAIXO do header do MainLayout.
    <div className="flex h-[calc(100vh-68px)] space-x-4 p-4 overflow-x-auto">
      {entregadoresAtivos.length > 0 ? (
        entregadoresAtivos.map(entregador => (
          <ColunaOperacao
            key={entregador.id}
            entregador={entregador}
            entregas={entregasPorEntregador[entregador.id] || []}
            onAddEntregaClick={handleAbrirModalEntrega}
            onUpdateStatus={handleUpdateStatus}
          />
        ))
      ) : (
        <div className="w-full flex flex-col justify-center items-center">
          <p className="text-gray-500">Nenhum entregador foi designado para esta jornada.</p>
          <Link to="/entregas/controle" className="mt-2 text-blue-600 hover:underline">
            Voltar para o painel de controle.
          </Link>
        </div>
      )}
      
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