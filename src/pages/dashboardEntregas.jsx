import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { FiPlusCircle, FiTruck, FiCheck, FiClock, FiSend } from 'react-icons/fi';
import AdicionarEntregaModal from '../components/AdicionarEntregaModal.jsx';
import ColunaEntregador from '../components/ColunaEntregador.jsx';

function DashboardEntregas() {
  const { 
    user, 
    logout, 
    entregas, 
    entregadores, 
    loadInitialData,
    adicionarNovaEntrega,
    atualizarStatusEntrega 
  } = useAppContext();
  
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entregadorParaAdicionar, setEntregadorParaAdicionar] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      // Se a lista de entregas já tiver dados, não precisamos buscar de novo.
      // Isso evita buscar dados toda vez que o usuário navega de volta para o dashboard.
      if (entregas.length > 0) {
        setIsLoading(false);
        return;
      }
      
      console.log("Buscando dados iniciais da API...");
      await loadInitialData();
      setIsLoading(false);
    };

    carregarDados();
  }, [entregas.length, loadInitialData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenAddModal = (entregadorId) => {
    setEntregadorParaAdicionar(entregadorId);
    setIsModalOpen(true);
  };
  
  const handleSaveNovaEntrega = async (dadosDaEntrega) => {
    const novaEntrega = {
      ...dadosDaEntrega,
      entregadorId: entregadorParaAdicionar,
      status: 'Em Trânsito' // Assume que ao adicionar, já está em trânsito
    };
    
    const sucesso = await adicionarNovaEntrega(novaEntrega);
    if (!sucesso) {
      alert("Falha ao adicionar entrega. Verifique o console e o backend.");
    }
  };
  
  const entregasPorEntregador = useMemo(() => {
    const agrupado = {};
    if (entregadores && entregadores.length > 0) {
      entregadores.forEach(entregador => {
        agrupado[entregador.id] = entregas.filter(e => e.entregadorId === entregador.id);
      });
    }
    return agrupado;
  }, [entregas, entregadores]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-600 animate-pulse">Carregando dados...</p>
      </div>
    );
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
          {entregadores && entregadores.length > 0 ? (
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

      {isModalOpen && (
        <AdicionarEntregaModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveNovaEntrega}
        />
      )}
    </div>
  );
}

export default DashboardEntregas;