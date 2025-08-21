import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { FiUsers, FiPlusCircle, FiTruck, FiCheckSquare, FiPlay, FiEye, FiLogOut } from 'react-icons/fi';

// Modais
import AdicionarEntregadorModal from '../components/AdicionarEntregadorModal.jsx';
import PerfilEntregadorModal from '../components/PerfilEntregadorModal.jsx';
import ConfirmacaoModal from '../components/ConfirmacaoModal.jsx';

// Funções do Firebase (sem o Storage)
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config.js';

// Componente para os cartões de indicadores (KPIs)
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

// Componente para o cartão de cada entregador no grid, com foto placeholder
function EntregadorCard({ entregador, onClick }) {
  return (
    <div onClick={onClick} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center transition-transform transform hover:scale-105 cursor-pointer border hover:border-blue-500 hover:shadow-xl">
      <img src={`https://i.pravatar.cc/80?u=${entregador.id}`} alt={entregador.nome} className="w-20 h-20 rounded-full mb-3 border-2 border-gray-200 object-cover" />
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

  // Estados para controlar os modais
  const [modalAberto, setModalAberto] = useState(null); // 'adicionar', 'editar', 'perfil', 'excluir', 'finalizar'
  const [entregadorSelecionado, setEntregadorSelecionado] = useState(null);

  // Efeito para buscar dados do Firestore
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

  const handleOpenModal = (tipo, entregador = null) => {
    // Se um entregador for passado, ele é sempre definido
    if (entregador) {
      setEntregadorSelecionado(entregador);
    }
    // Define qual modal deve ser aberto
    setModalAberto(tipo);
  };

  const handleCloseModal = () => {
    setEntregadorSelecionado(null);
    setModalAberto(null);
  };

  // --- FUNÇÕES CRUD (SEM UPLOAD DE FOTO) ---
  const handleSaveEntregador = async (formData) => {
    const dadosParaSalvar = { ...formData, userId: user.uid };

    try {
      if (modalAberto === 'editar' && entregadorSelecionado) { // Modo Edição
        const entregadorDocRef = doc(db, 'entregadores', entregadorSelecionado.id);
        await updateDoc(entregadorDocRef, dadosParaSalvar);
      } else { // Modo Adicionar
        await addDoc(collection(db, 'entregadores'), dadosParaSalvar);
      }
    } catch (error) {
      console.error("Erro ao salvar entregador:", error);
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteEntregador = async () => {
    if (!entregadorSelecionado) return;
    const entregadorDocRef = doc(db, 'entregadores', entregadorSelecionado.id);
    await deleteDoc(entregadorDocRef);
    handleCloseModal();
  };

  const handleIniciarDia = async () => {
    if (entregadores.length === 0) {
      alert("Adicione pelo menos um entregador à sua equipe antes de iniciar o dia.");
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
    if (!jornadaAtiva) return;
    const jornadaDocRef = doc(db, 'jornadas', jornadaAtiva.id);
    await updateDoc(jornadaDocRef, { status: "finalizada", dataFim: serverTimestamp() });
    handleCloseModal();
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
              <button onClick={() => handleOpenModal('finalizar')} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 flex items-center space-x-2">
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
            <button onClick={() => handleOpenModal('adicionar')} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <FiPlusCircle /><span>Adicionar Entregador</span>
            </button>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {entregadores.length > 0 ? (
              entregadores.map(entregador => 
                <EntregadorCard 
                  key={entregador.id} 
                  entregador={entregador} 
                  onClick={() => handleOpenModal('perfil', entregador)}
                />
              )
            ) : (
              <p className="col-span-full text-center text-gray-500 py-8">Nenhum entregador cadastrado.</p>
            )}
          </div>
        </div>
      </main>
      
      {/* Gerenciamento Centralizado de Modais */}
      {modalAberto === 'perfil' && (
        <PerfilEntregadorModal 
          entregador={entregadorSelecionado}
          onClose={handleCloseModal}
          onEdit={() => handleOpenModal('editar', entregadorSelecionado)}
          onDelete={() => handleOpenModal('excluir', entregadorSelecionado)}
        />
      )}
      {(modalAberto === 'adicionar' || modalAberto === 'editar') && (
        <AdicionarEntregadorModal 
          onClose={handleCloseModal}
          onSave={handleSaveEntregador}
          entregadorExistente={modalAberto === 'editar' ? entregadorSelecionado : null}
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
    </div>
  );
}

export default DashboardControleEntregas;