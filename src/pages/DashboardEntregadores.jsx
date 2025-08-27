import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext, API_URL } from '../context/AppContext.jsx';
import { FiUsers, FiPlusCircle, FiTruck, FiCheckSquare, FiPlay, FiEye, FiLogOut } from 'react-icons/fi';

// Modais
import AdicionarEntregadorModal from '../components/AdicionarEntregadorModal.jsx';
import PerfilEntregadorModal from '../components/PerfilEntregadorModal.jsx';
import ConfirmacaoModal from '../components/ConfirmacaoModal.jsx';
import ResumoJornadaModal from '../components/ResumoJornadaModal.jsx';

// Funções do Firebase
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config.js';

// Componente KpiCard
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

// Componente EntregadorCard
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
  
  const [modalAberto, setModalAberto] = useState(null);
  const [entregadorSelecionado, setEntregadorSelecionado] = useState(null);
  
  const [dadosResumo, setDadosResumo] = useState(null);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    
    const qJornadas = query(collection(db, 'jornadas'), where("userId", "==", user.uid), where("status", "==", "ativa"));
    const unsubJornadas = onSnapshot(qJornadas, (snapshot) => {
      if (!snapshot.empty) {
        const jornadaDoc = snapshot.docs[0];
        setJornadaAtiva({ id: jornadaDoc.id, ...jornadaDoc.data() });
      } else {
        setJornadaAtiva(null);
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

  const handleCloseModal = () => {
    setModalAberto(null);
    setEntregadorSelecionado(null);
    setDadosResumo(null); // Limpa o resumo ao fechar qualquer modal
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

  const handleSaveEntregador = async (formData) => {
    const isEditing = modalAberto === 'editar';
    const url = isEditing ? `${API_URL}/entregadores/${entregadorSelecionado.id}` : `${API_URL}/entregadores`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user.uid }),
      });
      if (!response.ok) throw new Error('Falha ao salvar entregador na API');
    } catch (error) {
      console.error("Erro ao salvar entregador via API:", error);
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteEntregador = async () => {
    if (!entregadorSelecionado) return;
    try {
      const response = await fetch(`${API_URL}/entregadores/${entregadorSelecionado.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao deletar entregador na API');
    } catch (error) {
      console.error("Erro ao deletar entregador via API:", error);
    } finally {
      handleCloseModal();
    }
  };

  const handleIniciarDia = async () => {
    if (entregadores.length === 0) {
      alert("Adicione pelo menos um entregador antes de iniciar o dia.");
      return;
    }
    const idsDosEntregadores = entregadores.map(e => e.id);
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

    // Fecha o modal de CONFIRMAÇÃO
    setModalAberto(null);

    try {
      const response = await fetch(`${API_URL}/jornadas/${idJornadaFinalizada}/finalizar`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Falha ao finalizar jornada na API');

      const resumo = await response.json();
      
      // Salva os dados do resumo e abre o modal de RESUMO
      setDadosResumo({ ...resumo, jornadaId: idJornadaFinalizada });
      setModalAberto('resumo'); // Abre o modal de resumo

    } catch (error) {
      console.error("Erro ao finalizar dia:", error);
      alert("Não foi possível finalizar a jornada.");
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
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md flex justify-between items-center shadow">
            <div>
              <p><span className="font-bold">Atenção:</span> Um dia de entregas já está em andamento.</p>
              {jornadaAtiva.dataInicio && (
                <p className="text-sm">Iniciado em: {new Date(jornadaAtiva.dataInicio.toDate()).toLocaleString('pt-BR')}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/entregas/operacao" className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 flex items-center space-x-2">
                <FiEye /><span>Ver Operação</span>
              </Link>
              <button onClick={handleAbrirFinalizar} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 flex items-center space-x-2">
                <FiLogOut /><span>Finalizar Dia</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center mb-8">
            <button onClick={handleIniciarDia} className="bg-green-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 flex items-center justify-center space-x-3 mx-auto">
              <FiPlay size={24} /><span>INICIAR DIA DE ENTREGAS</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KpiCard title="Total de Entregadores" value={entregadores.length} icon={<FiUsers />} />
          <KpiCard title="Entregas Concluídas (Ontem)" value="N/A" icon={<FiCheckSquare />} />
          <KpiCard title="Entregadores em Rota" value={jornadaAtiva ? (jornadaAtiva.entregadoresIds?.length || 0) : 0} icon={<FiTruck />} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 flex justify-between items-center border-b">
            <h2 className="text-lg font-semibold">Sua Equipe</h2>
            <button onClick={handleAbrirAdicionar} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <FiPlusCircle /><span>Adicionar Entregador</span>
            </button>
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
      
      {modalAberto === 'perfil' && (
        <PerfilEntregadorModal 
          entregador={entregadorSelecionado}
          onClose={handleCloseModal}
          onEdit={handleAbrirEditar}
          onDelete={handleAbrirExcluir}
        />
      )}
      {modalAberto === 'adicionar' && (
        <AdicionarEntregadorModal 
          onClose={handleCloseModal}
          onSave={handleSaveEntregador}
          entregadorExistente={null}
        />
      )}
      {modalAberto === 'editar' && (
        <AdicionarEntregadorModal 
          onClose={handleCloseModal}
          onSave={handleSaveEntregador}
          entregadorExistente={entregadorSelecionado}
        />
      )}
      {modalAberto === 'excluir' && (
        <ConfirmacaoModal 
          titulo="Excluir Entregador"
          mensagem={`Tem certeza que deseja excluir ${entregadorSelecionado?.nome}?`}
          onConfirm={handleDeleteEntregador}
          onCancel={handleCloseModal}
          isDestructive={true}
          confirmText="Sim, Excluir"
        />
      )}
      {modalAberto === 'finalizar' && (
        <ConfirmacaoModal
          titulo="Finalizar Dia de Entregas"
          mensagem="Tem certeza que deseja finalizar a operação de hoje?"
          onConfirm={handleFinalizarDia}
          onCancel={handleCloseModal}
          confirmText="Sim, Finalizar"
          isDestructive={true}
        />
      )}
      {modalAberto === 'resumo' && (
        <ResumoJornadaModal 
          resumo={dadosResumo}
          jornadaId={dadosResumo?.jornadaId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default DashboardControleEntregas;