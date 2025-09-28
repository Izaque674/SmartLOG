import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext, API_URL } from '../context/AppContext.jsx';
import { FiUsers, FiPlusCircle, FiTruck, FiCheckSquare, FiPlay, FiCalendar } from 'react-icons/fi';
import { MapContainer, TileLayer } from 'react-leaflet';

// Modais
import AdicionarEntregadorModal from '../components/AdicionarEntregadorModal.jsx';
import PerfilEntregadorModal from '../components/PerfilEntregadorModal.jsx';
import ConfirmacaoModal from '../components/ConfirmacaoModal.jsx';
import ResumoJornadaModal from '../components/ResumoJornadaModal.jsx';
import IniciarJornadaModal from '../components/IniciarJornadaModal.jsx';

// Componentes do Centro de Comando
import BlocoStatusJornada from '../components/BlocoStatusJornada.jsx';
import BlocoProgresso from '../components/BlocoProgresso.jsx';
import BlocoEquipeAtiva from '../components/BlocoEquipeAtiva.jsx';
import BlocoMapaBuscaOpenSource from '../components/BlocoMapaBuscaOpenSource.jsx';

// Funções do Firebase
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config.js';

// --- SUB-COMPONENTES DE UI ---

function KpiCard({ title, value, icon, color }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className={`rounded-xl p-3 text-white shadow-md ${color}`}>{icon}</div>
      <div>
        <div className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</div>
        <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}

function EntregadorCard({ entregador, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-center space-y-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 ease-in-out hover:scale-[1.02] hover:border-indigo-400 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600 cursor-pointer"
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

// --- COMPONENTE PRINCIPAL ---
function DashboardControleEntregas() {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [entregadores, setEntregadores] = useState([]);
  const [jornadaAtiva, setJornadaAtiva] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState({ entregasConcluidasOntem: '...' });
  const [modalAberto, setModalAberto] = useState(null);
  const [entregadorSelecionado, setEntregadorSelecionado] = useState(null);
  const [dadosResumo, setDadosResumo] = useState(null);
  const [dadosOperacao, setDadosOperacao] = useState({ entregasAtivas: [], entregadoresAtivos: [] });
  
  const mapPosition = [-25.4284, -49.2733]; // Posição do mapa (ex: Curitiba)

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
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
      setJornadaAtiva(snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    });

    const qEntregadores = query(collection(db, 'entregadores'), where("userId", "==", user.uid));
    const unsubEntregadores = onSnapshot(qEntregadores, (snapshot) => {
      setEntregadores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setIsLoading(false);

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
  };

  const handleAbrirPerfil = (entregador) => {
    setEntregadorSelecionado(entregador);
    setModalAberto('perfil');
  };
  
  const handleAbrirAdicionar = () => {
    setEntregadorSelecionado(null);
    setModalAberto('adicionar');
  };
  
  const handleAbrirEditar = () => {
    setModalAberto('editar');
  };
  
  const handleAbrirExcluir = () => {
    setModalAberto('excluir');
  };
  
  const handleAbrirFinalizar = () => {
    setModalAberto('finalizar');
  };
  
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
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900">
        <p className="text-gray-700 dark:text-slate-300">Carregando Painel de Controle...</p>
      </div>
    );
  }

  // LAYOUT QUANDO A JORNADA ESTÁ ATIVA
  if (jornadaAtiva) {
    return (
      <div className="p-6 sm:p-8 dark:bg-slate-900 min-h-screen">
        <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Centro de Comando</h1>
              <p className="mt-1 text-base text-gray-500 dark:text-slate-400">Visão geral em tempo real da sua operação de entregas.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <BlocoStatusJornada jornada={jornadaAtiva} onFinalizar={handleAbrirFinalizar} />
              <BlocoProgresso entregas={dadosOperacao.entregasAtivas} />
              <BlocoEquipeAtiva entregadores={dadosOperacao.entregadoresAtivos} />
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <h3 className="font-semibold text-gray-800 dark:text-slate-200">Ações Rápidas</h3>
                <button onClick={() => navigate('/entregas/operacao')} className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Ver Mapa de Operação</button>
              </div>
            </div>
        </div>
      </div>
    );
  }

  // LAYOUT DA TELA INICIAL COM O MAPA EM BLOCO
  return (
    <div className="p-6 sm:p-8 dark:bg-slate-900 min-h-screen">
      <div className="mx-auto max-w-7xl">

        {/* --- CABEÇALHO E BOTÃO DE AÇÃO --- */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Painel de Controle de Entregas</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 mt-2 mb-8">Gerencie e otimize suas entregas com eficiência.</p>
          <button
            onClick={handleAbrirIniciarJornada}
            className="inline-flex items-center justify-center gap-3 rounded-full bg-green-600 px-8 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 ease-in-out hover:bg-green-700 hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-green-500/70"
          >
            <FiPlay size={26} /><span>INICIAR DIA DE ENTREGAS</span>
          </button>
        </div>

        {/* --- KPIs --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KpiCard title="Total de Entregadores" value={entregadores.length} icon={<FiUsers className="h-6 w-6" />} color="bg-gradient-to-br from-indigo-500 to-indigo-700" />
          <KpiCard title="Entregas Concluídas (Ontem)" value={kpis.entregasConcluidasOntem} icon={<FiCheckSquare className="h-6 w-6" />} color="bg-gradient-to-br from-emerald-500 to-green-600" />
          <KpiCard title="Entregadores em Rota" value={0} icon={<FiTruck className="h-6 w-6" />} color="bg-gradient-to-br from-amber-500 to-yellow-600" />
        </div>

        {/* --- CONTEÚDO PRINCIPAL (EQUIPE E MAPA EM BLOCOS) --- */}
        <div className="space-y-8">

          {/* BLOCO DA EQUIPE */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sua Equipe de Entregadores</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Gerencie seus membros.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/entregas/historico" className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:focus:ring-slate-500">
                  <FiCalendar className="h-4 w-4" /><span>Ver Histórico</span>
                </Link>
                <button onClick={handleAbrirAdicionar} className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <FiPlusCircle className="h-5 w-5" /><span>Adicionar</span>
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
                <div className="col-span-full flex items-center justify-center text-center py-8">
                   <p className="text-gray-500 dark:text-slate-400">Nenhum entregador cadastrado.</p>
                </div>
              )}
            </div>
          </div>

          {/* BLOCO DO MAPA */}
<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 h-96 flex flex-col">
    
    {/*
      Toda a lógica de título, mapa, interação, etc.,
      agora está dentro deste componente, deixando seu Dashboard mais limpo.
    */}
    <BlocoMapaBuscaOpenSource />

</div>
        </div>
      </div>

      {/* Seus modais continuam aqui, funcionando perfeitamente */}
      {modalAberto === 'iniciarJornada' && (<IniciarJornadaModal entregadores={entregadores} onClose={handleCloseModal} onIniciar={handleIniciarDia} />)}
      {modalAberto === 'perfil' && (<PerfilEntregadorModal entregador={entregadorSelecionado} onClose={handleCloseModal} onEdit={handleAbrirEditar} onDelete={handleAbrirExcluir} />)}
      {modalAberto === 'adicionar' && (<AdicionarEntregadorModal onClose={handleCloseModal} onSave={handleSaveEntregador} entregadorExistente={null} />)}
      {modalAberto === 'editar' && (<AdicionarEntregadorModal onClose={handleCloseModal} onSave={handleSaveEntregador} entregadorExistente={entregadorSelecionado} />)}
      {modalAberto === 'excluir' && (<ConfirmacaoModal titulo="Excluir Entregador" mensagem={`Tem certeza que deseja excluir ${entregadorSelecionado?.nome}?`} onConfirm={handleDeleteEntregador} onCancel={handleCloseModal} isDestructive={true} confirmText="Sim, Excluir" />)}
      {modalAberto === 'finalizar' && (<ConfirmacaoModal titulo="Finalizar Dia de Entregas" mensagem="Tem certeza que deseja finalizar a operação de hoje?" onConfirm={handleFinalizarDia} onCancel={handleCloseModal} confirmText="Sim, Finalizar" isDestructive={true} />)}
      {modalAberto === 'resumo' && (<ResumoJornadaModal resumo={dadosResumo} jornadaId={dadosResumo?.jornadaId} onClose={handleCloseModal} />)}
    </div>
  );
}

export default DashboardControleEntregas;