import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext, API_URL } from '../context/AppContext.jsx';
import { FiPlusCircle, FiTruck, FiCheck, FiClock } from 'react-icons/fi';
import AdicionarEntregaModal from '../components/AdicionarEntregaModal.jsx';
import ColunaEntregador from '../components/ColunaEntregador.jsx';

function DashboardEntregas() {
  const { 
    user, 
    logout, 
    entregas, 
    setEntregas, // Pega o setter de entregas
    entregadores,
    setEntregadores, // Pega o setter de entregadores
    adicionarNovaEntrega,
  } = useAppContext();
  
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entregadorParaAdicionar, setEntregadorParaAdicionar] = useState(null);

  // Criamos a função de carregamento aqui, usando os setters do contexto
  const loadData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/dados`, { cache: 'no-cache' });
      const data = await response.json();
      console.log("Dashboard buscando e atualizando dados. Status da entrega 103:", data.entregas.find(e => e.id === 103)?.status);
      setEntregas(data.entregas || []);
      setEntregadores(data.entregadores || []);
    } catch (error) {
      console.error("Erro ao carregar dados no Dashboard:", error);
    }
  }, [setEntregas, setEntregadores]); // Depende dos setters, que são estáveis

  // Efeito de carregamento e polling
  useEffect(() => {
    const fetchData = async () => {
      await loadData();
      if (isLoading) {
        setIsLoading(false);
      }
    };
    fetchData(); // Carga inicial
    const intervalId = setInterval(fetchData, 5000); // Polling
    return () => clearInterval(intervalId);
  }, [isLoading, loadData]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleOpenAddModal = (entregadorId) => { setEntregadorParaAdicionar(entregadorId); setIsModalOpen(true); };
  
  const handleSaveNovaEntrega = async (dadosDaEntrega) => {
    const novaEntrega = { ...dadosDaEntrega, entregadorId: entregadorParaAdicionar, status: 'Em Trânsito' };
    const sucesso = await adicionarNovaEntrega(novaEntrega); // Esta função já atualiza o estado no contexto
    if (!sucesso) { alert("Falha ao adicionar entrega."); }
  };
  
  const entregasPorEntregador = useMemo(() => {
    const agrupado = {};
    if (entregadores?.length > 0) {
      entregadores.forEach(entregador => {
        agrupado[entregador.id] = entregas.filter(e => e.entregadorId === entregador.id);
      });
    }
    return agrupado;
  }, [entregas, entregadores]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100"><p className="text-xl font-semibold text-gray-600 animate-pulse">Carregando...</p></div>;
  }

  return (
    <div className="relative">
      <div className="bg-white min-h-screen flex flex-col">
        <header className="sticky top-0 bg-white/80 backdrop-blur-lg z-10 border-b p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard de Entregas</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Olá, {user?.name || 'Gestor'}</span>
            <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-600">Sair</button>
          </div>
        </header>
        <main className="flex-grow flex space-x-4 p-4 overflow-x-auto">
          {entregadores?.length > 0 ? (
            entregadores.map(entregador => (
              <ColunaEntregador
                key={entregador.id}
                entregador={entregador}
                entregas={entregasPorEntregador[entregador.id] || []}
                onAddEntrega={handleOpenAddModal}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 w-full mt-10">Nenhum entregador encontrado.</p>
          )}
        </main>
      </div>
      {isModalOpen && <AdicionarEntregaModal onClose={() => setIsModalOpen(false)} onSave={handleSaveNovaEntrega} />}
    </div>
  );
}

export default DashboardEntregas;