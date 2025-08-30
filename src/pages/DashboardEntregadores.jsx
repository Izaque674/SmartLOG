import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext, API_URL } from '../context/AppContext.jsx';
import { FiUsers, FiPlusCircle, FiTruck, FiCheckSquare, FiPlay, FiEye, FiLogOut, FiCalendar } from 'react-icons/fi';

// Modais
import AdicionarEntregadorModal from '../components/AdicionarEntregadorModal.jsx';
import PerfilEntregadorModal from '../components/PerfilEntregadorModal.jsx';
import ConfirmacaoModal from '../components/ConfirmacaoModal.jsx';
import ResumoJornadaModal from '../components/ResumoJornadaModal.jsx';
import IniciarJornadaModal from '../components/IniciarJornadaModal.jsx'; // Importa o novo modal

// Novos Componentes do Centro de Comando
import BlocoStatusJornada from '../components/BlocoStatusJornada.jsx';
import BlocoProgresso from '../components/BlocoProgresso.jsx';
import BlocoEquipeAtiva from '../components/BlocoEquipeAtiva.jsx'; // Importa o bloco da equipe

// Funções do Firebase
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config.js';

// Componentes KpiCard e EntregadorCard (sem alterações)
function KpiCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
      <div className="text-3xl text-blue-500">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function EntregadorCard({ entregador, onClick }) {
  return (
    <div onClick={onClick} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center transition-transform transform hover:scale-105 cursor-pointer border hover:border-blue-500 hover:shadow-xl">
      <img src={entregador.fotoUrl || `https://i.pravatar.cc/80?u=${entregador.id}`} alt={entregador.nome} className="w-20 h-20 rounded-full mb-3 border-2 border-gray-200 object-cover" />
      <h4 className="font-semibold text-gray-800">{entregador.nome}</h4>
      <p className="text-xs text-gray-500">{entregador.telefone || 'Sem telefone'}</p>
    </div>
  );
}

// --- Componente Principal ---
function DashboardControleEntregas() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const [entregadores, setEntregadores] = useState([]);
  const [jornadaAtiva, setJornadaAtiva] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState({ entregasConcluidasOntem: '...' });
  
  const [modalAberto, setModalAberto] = useState(null);
  const [entregadorSelecionado, setEntregadorSelecionado] = useState(null);
  const [dadosResumo, setDadosResumo] = useState(null);
  
  const [dadosOperacao, setDadosOperacao] = useState({ entregasAtivas: [], entregadoresAtivos: [] });

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const fetchKpis = async () => { /* ...código sem alterações... */ };
    fetchKpis();

    const qJornadas = query(collection(db, 'jornadas'), where("userId", "==", user.uid), where("status", "==", "ativa"));
    const unsubJornadas = onSnapshot(qJornadas, (snapshot) => {
      if (!snapshot.empty) {
        const jornadaDoc = snapshot.docs[0];
        setJornadaAtiva({ id: jornadaDoc.id, ...jornadaDoc.data() });
      } else {
        setJornadaAtiva(null);
        setDadosOperacao({ entregasAtivas: [], entregadoresAtivos: [] });
      }
    });

    const qEntregadores = query(collection(db, 'entregadores'), where("userId", "==", user.uid));
    const unsubEntregadores = onSnapshot(qEntregadores, (snapshot) => {
      setEntregadores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });

    return () => {
      unsubJornadas();
      unsubEntregadores();
    };
  }, [user]);

  useEffect(() => {
    if (!jornadaAtiva || !user) return;
    
    const fetchOperacaoData = async () => {
      try {
        const response = await fetch(`${API_URL}/operacao/${user.uid}`);
        if (!response.ok) throw new Error('Falha ao buscar dados da operação');
        const data = await response.json();
        setDadosOperacao(data);
      } catch (error) {
        console.error("Erro ao carregar dados da operação:", error);
      }
    };
    
    fetchOperacaoData();
    const intervalId = setInterval(fetchOperacaoData, 10000);
    return () => clearInterval(intervalId);

  }, [jornadaAtiva, user]);

  const handleCloseModal = () => { setModalAberto(null); setEntregadorSelecionado(null); };
  const handleAbrirPerfil = (entregador) => { setEntregadorSelecionado(entregador); setModalAberto('perfil'); };
  const handleAbrirAdicionar = () => { setEntregadorSelecionado(null); setModalAberto('adicionar'); };
  const handleAbrirEditar = () => { setModalAberto('editar'); };
  const handleAbrirExcluir = () => { setModalAberto('excluir'); };
  const handleAbrirFinalizar = () => { setModalAberto('finalizar'); };
  
  // Nova função para abrir o modal de seleção
  const handleAbrirIniciarJornada = () => {
    if (entregadores.length === 0) {
      alert("Adicione pelo menos um entregador à sua equipe antes de iniciar o dia.");
      return;
    }
    setModalAberto('iniciarJornada');
  };

  const handleSaveEntregador = async (formData) => {
    const isEditing = modalAberto === 'editar';
    
    // Define a URL e o método com base na ação (criar ou editar)
    const url = isEditing
      ? `${API_URL}/entregadores/${entregadorSelecionado.id}`
      : `${API_URL}/entregadores`;
      
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        // Garante que o userId seja sempre enviado para o backend
        body: JSON.stringify({ ...formData, userId: user.uid }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao salvar entregador na API: ${errorText}`);
      }
      
      // Se a operação foi bem-sucedida, o onSnapshot cuidará de atualizar a UI.
      // Não precisamos chamar fetchData() aqui.
      
    } catch (error) {
      console.error("Erro ao salvar entregador via API:", error);
      alert(`Não foi possível salvar o entregador. Causa: ${error.message}`);
    } finally {
      // Fecha o modal independentemente do resultado
      handleCloseModal();
    }
  };

  const handleDeleteEntregador = async () => {
    if (!entregadorSelecionado) return;
    try {
      const response = await fetch(`${API_URL}/entregadores/${entregadorSelecionado.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao deletar entregador na API: ${errorText}`);
      }

      // O onSnapshot cuidará de remover o card da UI.

    } catch (error) {
      console.error("Erro ao deletar entregador via API:", error);
      alert(`Não foi possível deletar o entregador. Causa: ${error.message}`);
    } finally {
      handleCloseModal();
    }
  };

  // Função 'Iniciar Dia' agora recebe os IDs do modal
  const handleIniciarDia = async (idsDosEntregadores) => {
    if (!idsDosEntregadores || idsDosEntregadores.length === 0) return;
    await addDoc(collection(db, 'jornadas'), {
      userId: user.uid,
      dataInicio: serverTimestamp(),
      dataFim: null,
      status: "ativa",
      entregadoresIds: idsDosEntregadores,
      resumo: {}
    });
    navigate('/entregas/operacao');
  };
  
  const handleFinalizarDia = async () => {
    const idJornadaFinalizada = jornadaAtiva?.id;
    if (!idJornadaFinalizada) return;
    handleCloseModal();
    try {
      const response = await fetch(`${API_URL}/jornadas/${idJornadaFinalizada}/finalizar`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Falha ao finalizar jornada');
      const resumo = await response.json();
      setDadosResumo({ ...resumo, jornadaId: idJornadaFinalizada });
      setModalAberto('resumo'); // Usa o estado geral de modais
    } catch (error) {
      console.error("Erro ao finalizar dia:", error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando Painel de Controle...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Painel de Controle de Entregas</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Olá, {user?.email}</span>
          <button onClick={logout} className="text-sm text-gray-600 hover:text-red-600">Sair</button>
        </div>
      </header>
      <main className="p-8">
        
        {jornadaAtiva ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <BlocoStatusJornada jornada={jornadaAtiva} onFinalizar={handleAbrirFinalizar} />
            <BlocoProgresso entregas={dadosOperacao.entregasAtivas} />
            <BlocoEquipeAtiva entregadores={dadosOperacao.entregadoresAtivos} />
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <button onClick={handleAbrirIniciarJornada} className="bg-green-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 flex items-center justify-center space-x-3 mx-auto">
                <FiPlay size={24} /><span>INICIAR DIA DE ENTREGAS</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <KpiCard title="Total de Entregadores" value={entregadores.length} icon={<FiUsers />} />
              <KpiCard title="Entregas Concluídas (Ontem)" value={kpis.entregasConcluidasOntem} icon={<FiCheckSquare />} />
              <KpiCard title="Entregadores em Rota" value={0} icon={<FiTruck />} />
            </div>
          </>
        )}
        
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 flex justify-between items-center border-b">
            <h2 className="text-lg font-semibold">Sua Equipe</h2>
            <div className="flex items-center space-x-2">
              <Link to="/entregas/historico" className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                <FiCalendar /><span>Ver Histórico</span>
              </Link>
              <button onClick={handleAbrirAdicionar} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FiPlusCircle /><span>Adicionar Entregador</span>
              </button>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {entregadores.length > 0 ? (
              entregadores.map(entregador => 
                <EntregadorCard 
                  key={entregador.id} 
                  entregador={entregador} 
                  onClick={() => handleAbrirPerfil(entregador)}
                />
              )
            ) : (
              <p className="col-span-full text-center text-gray-500 py-8">Nenhum entregador cadastrado.</p>
            )}
          </div>
        </div>
      </main>
      
      {modalAberto === 'perfil' && ( <PerfilEntregadorModal entregador={entregadorSelecionado} onClose={handleCloseModal} onEdit={handleAbrirEditar} onDelete={handleAbrirExcluir} /> )}
      {(modalAberto === 'adicionar' || modalAberto === 'editar') && ( <AdicionarEntregadorModal onClose={handleCloseModal} onSave={handleSaveEntregador} entregadorExistente={modalAberto === 'editar' ? entregadorSelecionado : null} /> )}
      {modalAberto === 'excluir' && ( <ConfirmacaoModal titulo="Excluir Entregador" mensagem={`Tem certeza que deseja excluir ${entregadorSelecionado?.nome}?`} onConfirm={handleDeleteEntregador} onCancel={handleCloseModal} isDestructive={true} confirmText="Sim, Excluir" /> )}
      {modalAberto === 'finalizar' && ( <ConfirmacaoModal titulo="Finalizar Dia de Entregas" mensagem="Tem certeza que deseja finalizar a operação de hoje?" onConfirm={handleFinalizarDia} onCancel={handleCloseModal} confirmText="Sim, Finalizar" isDestructive={true} /> )}
      {modalAberto === 'resumo' && ( <ResumoJornadaModal resumo={dadosResumo} jornadaId={dadosResumo?.jornadaId} onClose={handleCloseModal} /> )}

      {modalAberto === 'iniciarJornada' && (
        <IniciarJornadaModal
          entregadores={entregadores}
          onClose={handleCloseModal}
          onIniciar={handleIniciarDia}
        />
      )}
    </div>
  );
}

export default DashboardControleEntregas;