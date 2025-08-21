import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import AdicionarEntregaModal from '../components/AdicionarEntregaModal.jsx';
import ColunaEntregador from '../components/ColunaEntregador.jsx';
import { collection, query, where, onSnapshot, addDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';
import { FiArrowLeft } from 'react-icons/fi';

function DashboardOperacaoEntregas() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const [todosEntregadores, setTodosEntregadores] = useState([]);
  const [todasEntregas, setTodasEntregas] = useState([]);
  const [jornadaAtiva, setJornadaAtiva] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entregadorParaAdicionar, setEntregadorParaAdicionar] = useState(null);

  useEffect(() => {
    if (!user) return;

    // "Ouvinte" 1: Busca a jornada ativa
    const qJornadas = query(collection(db, 'jornadas'), where("userId", "==", user.uid), where("status", "==", "ativa"));
    const unsubJornadas = onSnapshot(qJornadas, (snapshotJornadas) => {
      if (snapshotJornadas.empty) {
        setIsLoading(false);
        navigate('/entregas/controle');
        return;
      }
      setJornadaAtiva(snapshotJornadas.docs[0].data());
    });

    // "Ouvinte" 2: Busca TODOS os entregadores do usuário
    const qEntregadores = query(collection(db, 'entregadores'), where("userId", "==", user.uid));
    const unsubEntregadores = onSnapshot(qEntregadores, (snapshot) => {
      setTodosEntregadores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    // "Ouvinte" 3: Busca TODAS as entregas do usuário
    const qEntregas = query(collection(db, 'entregas'), where("userId", "==", user.uid));
    const unsubEntregas = onSnapshot(qEntregas, (snapshot) => {
      setTodasEntregas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });

    return () => { // Limpeza de todos os ouvintes
      unsubJornadas();
      unsubEntregadores();
      unsubEntregas();
    };
  }, [user, navigate]);
  
  // --- LÓGICA DE FILTRAGEM NO CLIENTE ---
  // useMemo para calcular quais entregadores e entregas mostrar
  const { entregadoresAtivos, entregasAtivas } = useMemo(() => {
    if (!jornadaAtiva) {
      return { entregadoresAtivos: [], entregasAtivas: [] };
    }
    const idsAtivos = new Set(jornadaAtiva.entregadoresIds || []);
    const entregadoresFiltrados = todosEntregadores.filter(e => idsAtivos.has(e.id));
    const entregasFiltradas = todasEntregas.filter(entrega => idsAtivos.has(entrega.entregadorId));
    
    return { entregadoresAtivos: entregadoresFiltrados, entregasAtivas: entregasFiltradas };
  }, [jornadaAtiva, todosEntregadores, todasEntregas]);

  const entregasPorEntregador = useMemo(() => {
    const agrupado = {};
    entregadoresAtivos.forEach(entregador => {
      agrupado[entregador.id] = entregasAtivas.filter(e => e.entregadorId === entregador.id);
    });
    return agrupado;
  }, [entregasAtivas, entregadoresAtivos]);
  
  const handleLogout = () => { logout(); navigate('/login'); };
  const handleOpenAddModal = (entregadorId) => { setEntregadorParaAdicionar(entregadorId); setIsModalOpen(true); };
  const handleSaveNovaEntrega = async (dadosDaEntrega) => {
    if (!user || !entregadorParaAdicionar) return;
    await addDoc(collection(db, 'entregas'), {
      ...dadosDaEntrega,
      entregadorId: entregadorParaAdicionar,
      status: 'Em Trânsito',
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

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