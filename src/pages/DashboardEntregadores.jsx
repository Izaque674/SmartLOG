import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext, API_URL } from '../context/AppContext.jsx';
import { FiUsers, FiPlusCircle, FiTruck, FiCheckSquare, FiPlay, FiEye, FiLogOut, FiCalendar, FiMoreVertical } from 'react-icons/fi';

// Modais
import AdicionarEntregadorModal from '../components/AdicionarEntregadorModal.jsx';
import PerfilEntregadorModal from '../components/PerfilEntregadorModal.jsx';
import ConfirmacaoModal from '../components/ConfirmacaoModal.jsx';
import ResumoJornadaModal from '../components/ResumoJornadaModal.jsx';
import IniciarJornadaModal from '../components/IniciarJornadaModal.jsx';

// Novos Componentes do Centro de Comando
import BlocoStatusJornada from '../components/BlocoStatusJornada.jsx';
import BlocoProgresso from '../components/BlocoProgresso.jsx';
import BlocoEquipeAtiva from '../components/BlocoEquipeAtiva.jsx';

// Funções do Firebase
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config.js';

// Componente KpiCard - Atualizado com o novo design
function KpiCard({ title, value, icon, color = 'bg-gradient-to-br from-indigo-500 to-indigo-700' }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/60">
      <div className={`rounded-xl p-3 text-white shadow-md ${color}`}>{icon}</div>
      <div>
        <div className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</div>
        <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}

// Componente EntregadorCard - Atualizado com o novo design
function EntregadorCard({ entregador, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-center space-y-2 rounded-xl border border-gray-200 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in-out hover:scale-[1.02] hover:border-indigo-400 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-indigo-600 cursor-pointer"
    >
      <img
        src={entregador.fotoUrl || `https://i.pravatar.cc/80?u=${entregador.id}`}
        alt={entregador.nome}
        className="h-20 w-20 rounded-full border-2 border-indigo-300 object-cover shadow-sm dark:border-indigo-700"
      />
      <h4 className="text-base font-semibold text-gray-900 dark:text-white">{entregador.nome}</h4>
      <p className="text-xs text-gray-500 dark:text-slate-400">{entregador.telefone || 'Sem telefone'}</p>
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
  const [isResumoModalOpen, setIsResumoModalOpen] = useState(false);

  const [dadosOperacao, setDadosOperacao] = useState({ entregasAtivas: [], entregadoresAtivos: [] });

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const fetchKpis = async () => {
      try {
        const response = await fetch(`${API_URL}/kpis/${user.uid}`);
        if (!response.ok) throw new Error('Falha ao buscar KPIs');
        const data = await response.json();
        setKpis(data);
      } catch (error) {
        console.error("Erro ao buscar KPIs:", error);
        setKpis({ entregasConcluidasOntem: 'Erro' });
      }
    };
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

  const handleCloseModal = () => {
    setModalAberto(null);
    setEntregadorSelecionado(null);
    setIsResumoModalOpen(false);
  };

  const handleAbrirPerfil = (entregador) => { setEntregadorSelecionado(entregador); setModalAberto('perfil'); };
  const handleAbrirAdicionar = () => { setEntregadorSelecionado(null); setModalAberto('adicionar'); };
  const handleAbrirEditar = () => { setModalAberto('editar'); };
  const handleAbrirExcluir = () => { setModalAberto('excluir'); };
  const handleAbrirFinalizar = () => { setModalAberto('finalizar'); };
  const handleAbrirIniciarJornada = () => {
    if (entregadores.length === 0) {
      alert("Adicione pelo menos um entregador à sua equipe antes de iniciar o dia.");
      return;
    }
    setModalAberto('iniciarJornada');
  };

  const handleSaveEntregador = async (formData) => {
    const isEditing = modalAberto === 'editar';
    const url = isEditing ? `${API_URL}/entregadores/${entregadorSelecionado.id}` : `${API_URL}/entregadores`;
    const method = isEditing ? 'PUT' : 'POST';
    try {
      await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user.uid }),
      });
    } catch (error) {
      console.error("Erro ao salvar entregador via API:", error);
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteEntregador = async () => {
    if (!entregadorSelecionado) return;
    try {
      await fetch(`${API_URL}/entregadores/${entregadorSelecionado.id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Erro ao deletar entregador via API:", error);
    } finally {
      handleCloseModal();
    }
  };

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
      setModalAberto('resumo');
    } catch (error) {
      console.error("Erro ao finalizar dia:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 dark:bg-slate-900">
        <p className="text-gray-700 dark:text-slate-300">Carregando Painel de Controle...</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 dark:bg-slate-900 min-h-screen">
      <div className="mx-auto max-w-7xl">
        {jornadaAtiva ? (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Centro de Comando</h1>
              <p className="mt-1 text-base text-gray-500 dark:text-slate-400">Visão geral em tempo real da sua operação de entregas.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <BlocoStatusJornada jornada={jornadaAtiva} onFinalizar={handleAbrirFinalizar} />
              <BlocoProgresso entregas={dadosOperacao.entregasAtivas} />
              <BlocoEquipeAtiva entregadores={dadosOperacao.entregadoresAtivos} />
              {/* Adicione um KPI extra se desejar, ou ajuste o layout */}
              <KpiCard title="Total Entregadores Ativos" value={dadosOperacao.entregadoresAtivos.length} icon={<FiUsers className="h-6 w-6" />} color="bg-gradient-to-br from-purple-500 to-purple-700" />
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-10">
              
              <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">Gerencie e otimize suas entregas com eficiência.</p>
              <button
                onClick={handleAbrirIniciarJornada}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-green-600 px-8 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 ease-in-out hover:bg-green-700 hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-70 dark:focus:ring-green-700/60"
              >
                <FiPlay size={26} /><span>INICIAR DIA DE ENTREGAS</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <KpiCard title="Total de Entregadores" value={entregadores.length} icon={<FiUsers className="h-6 w-6" />} color="bg-gradient-to-br from-indigo-500 to-indigo-700" />
              <KpiCard title="Entregas Concluídas (Ontem)" value={kpis.entregasConcluidasOntem} icon={<FiCheckSquare className="h-6 w-6" />} color="bg-gradient-to-br from-emerald-500 to-green-600" />
              <KpiCard title="Entregadores em Rota" value={0} icon={<FiTruck className="h-6 w-6" />} color="bg-gradient-to-br from-amber-500 to-yellow-600" />
            </div>
          </>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sua Equipe de Entregadores</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Gerencie seus entregadores e adicione novos membros.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/entregas/historico"
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:focus:ring-slate-500"
              >
                <FiCalendar className="h-4 w-4" />
                <span>Ver Histórico</span>
              </Link>
              <button
                onClick={handleAbrirAdicionar}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
              >
                <FiPlusCircle className="h-5 w-5" />
                <span>Adicionar Entregador</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-5">
            {entregadores.length > 0 ? (
              entregadores.map(entregador =>
                <EntregadorCard
                  key={entregador.id}
                  entregador={entregador}
                  onClick={() => handleAbrirPerfil(entregador)}
                />
              )
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="mb-4 text-lg font-medium text-gray-600 dark:text-slate-400">Nenhum entregador cadastrado ainda.</p>
                <button
                  onClick={handleAbrirAdicionar}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-white shadow-md transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                >
                  <FiPlus className="h-5 w-5" /> {/* Use FiPlus para consistência */}
                  <span className="font-medium">Cadastrar Primeiro Entregador</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalAberto === 'perfil' && (<PerfilEntregadorModal entregador={entregadorSelecionado} onClose={handleCloseModal} onEdit={handleAbrirEditar} onDelete={handleAbrirExcluir} />)}
      {modalAberto === 'adicionar' && (<AdicionarEntregadorModal onClose={handleCloseModal} onSave={handleSaveEntregador} entregadorExistente={null} />)}
      {modalAberto === 'editar' && (<AdicionarEntregadorModal onClose={handleCloseModal} onSave={handleSaveEntregador} entregadorExistente={entregadorSelecionado} />)}
      {modalAberto === 'excluir' && (<ConfirmacaoModal titulo="Excluir Entregador" mensagem={`Tem certeza que deseja excluir ${entregadorSelecionado?.nome}?`} onConfirm={handleDeleteEntregador} onCancel={handleCloseModal} isDestructive={true} confirmText="Sim, Excluir" />)}
      {modalAberto === 'finalizar' && (<ConfirmacaoModal titulo="Finalizar Dia de Entregas" mensagem="Tem certeza que deseja finalizar a operação de hoje?" onConfirm={handleFinalizarDia} onCancel={handleCloseModal} confirmText="Sim, Finalizar" isDestructive={true} />)}
      {modalAberto === 'resumo' && (<ResumoJornadaModal resumo={dadosResumo} jornadaId={dadosResumo?.jornadaId} onClose={handleCloseModal} />)}
      {modalAberto === 'iniciarJornada' && (<IniciarJornadaModal entregadores={entregadores} onClose={handleCloseModal} onIniciar={handleIniciarDia} />)}
    </div>
  );
}

export default DashboardControleEntregas;