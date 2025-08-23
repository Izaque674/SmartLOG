import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext, API_URL } from '../context/AppContext.jsx';
import AdicionarEntregaModal from '../components/AdicionarEntregaModal.jsx';
import ColunaEntregador from '../components/ColunaEntregador.jsx';
import { FiArrowLeft } from 'react-icons/fi';

// As importações do Firebase foram COMPLETAMENTE REMOVIDAS daqui.

function DashboardOperacaoEntregas() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const [entregadoresAtivos, setEntregadoresAtivos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entregadorParaAdicionar, setEntregadorParaAdicionar] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/operacao/${user.uid}`);
        if (!response.ok) throw new Error('Falha ao buscar dados da operação');
        const data = await response.json();
        
        // Se a API não retorna entregadores, a jornada pode ter acabado.
        if (data.entregadoresAtivos.length === 0 && data.entregasAtivas.length === 0) {
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
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [user, navigate]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleOpenAddModal = (entregadorId) => { setEntregadorParaAdicionar(entregadorId); setIsModalOpen(true); };
  const handleSaveNovaEntrega = async (dadosDaEntrega) => {
    try {
      await fetch(`${API_URL}/entregas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dadosDaEntrega, entregadorId: entregadorParaAdicionar }),
      });
      setIsModalOpen(false);
    } catch (error) { console.error("Erro ao salvar entrega:", error); }
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
              <ColunaEntregador
                key={entregador.id}
                entregador={entregador}
                entregas={entregasPorEntregador[entregador.id] || []}
                onAddEntrega={handleOpenAddModal}
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
      {isModalOpen && <AdicionarEntregaModal onClose={() => setIsModalOpen(false)} onSave={handleSaveNovaEntrega} />}
    </div>
  );
}

export default DashboardOperacaoEntregas;