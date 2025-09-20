import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext, API_URL } from '../context/AppContext.jsx';
import AdicionarEntregaModal from '../components/AdicionarEntregaModal.jsx';
import ColunaOperacao from '../components/ColunaOperacao.jsx';
import { FiArrowLeft, FiTruck } from 'react-icons/fi';

function DashboardOperacaoEntregas() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const [entregadoresAtivos, setEntregadoresAtivos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalEntregaOpen, setIsModalEntregaOpen] = useState(false);
  const [entregadorParaNovaEntrega, setEntregadorParaNovaEntrega] = useState(null);

  const fetchData = async () => {
    try {
      if (!user?.uid) return;
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
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500 dark:text-slate-400">Carregando Operação...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-68px)]">
      {/* --- BARRA DE NAVEGAÇÃO INTERNA ADICIONADA AQUI --- */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        <Link 
          to="/entregas/controle" 
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <FiArrowLeft />
          Voltar para o Painel de Controle
        </Link>
      </div>

      {/* Container do Kanban */}
      <div className="flex-1 flex space-x-4 p-4 overflow-x-auto">
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
            <p className="text-gray-500 dark:text-slate-400">Nenhum entregador foi designado para esta jornada.</p>
          </div>
        )}
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