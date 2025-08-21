import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { processarVeiculo } from '../utils/manutencaoLogic.js';
import { FiArrowLeft, FiCheckCircle, FiAlertTriangle, FiEdit, FiTrash2, FiTool, FiChevronDown } from 'react-icons/fi';

// Modais
import AtualizarKmModal from '../components/AtualizarKmModal.jsx';
import ConfirmacaoModal from '../components/ConfirmacaoModal.jsx';
import EditarVeiculoModal from '../components/EditarVeiculoModal.jsx';
import EditarItemModal from '../components/EditarItemModal.jsx';
import RegistrarServicoModal from '../components/RegistrarServicoModal.jsx';

// Funções do Firebase
import { doc, onSnapshot, updateDoc, deleteDoc, collection, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';


// --- Componente: Card de Item de Manutenção ---
function ItemManutencaoCard({ item, onRegistrar, onEdit, onDelete }) {
  const statusStyles = {
    'Em dia': { bg: 'bg-green-50', border: 'border-green-500', icon: <FiCheckCircle className="text-green-500" /> },
    'Atenção': { bg: 'bg-yellow-50', border: 'border-yellow-500', icon: <FiAlertTriangle className="text-yellow-500" /> },
    'Atrasado': { bg: 'bg-red-50', border: 'border-red-500', icon: <FiAlertTriangle className="text-red-500" /> },
  };
  const styles = statusStyles[item.status];
  return (
    <div className={`p-4 rounded-lg border-l-4 ${styles.bg} ${styles.border} flex justify-between items-center`}>
      <div className="flex items-center space-x-3">
        <div className="text-xl">{styles.icon}</div>
        <div>
          <p className="font-semibold text-gray-800">{item.nome}</p>
          <p className="text-sm text-gray-600">
            Próxima revisão em: <span className="font-bold">{item.kmProximaRevisao.toLocaleString('pt-BR')} km</span>
            {item.status === 'Atrasado'
              ? <span className="text-red-600 font-semibold ml-2">({Math.abs(item.kmRestantes).toLocaleString('pt-BR')} km atrasado)</span>
              : <span className="text-gray-500 ml-2">({item.kmRestantes.toLocaleString('pt-BR')} km restantes)</span>
            }
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={() => onEdit(item)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full"><FiEdit /></button>
        <button onClick={() => onDelete(item)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full"><FiTrash2 /></button>
        <button onClick={() => onRegistrar(item)} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 active:scale-95">
          <span className="hidden sm:inline">Registrar Serviço</span>
          <FiTool className="sm:hidden" />
        </button>
      </div>
    </div>
  );
}

// --- Componente: Linha da Tabela de Histórico ---
function HistoricoRow({ registro }) {
  const dataFormatada = new Date(registro.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-4">{dataFormatada}</td>
      <td className="p-4 font-semibold">{registro.nomeItem}</td>
      <td className="p-4">{registro.km_servico.toLocaleString('pt-BR')} km</td>
      <td className="p-4">R$ {registro.custo.toFixed(2).replace('.', ',')}</td>
      <td className="p-4 text-sm text-gray-600">{registro.observacoes || '-'}</td>
    </tr>
  );
}


// --- Componente Principal da Página ---
function PaginaInfoVeiculo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAppContext();

  // Estados
  const [veiculo, setVeiculo] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(true); // Estado para o acordeão

  // Estados centralizados para controlar os modais
  const [modaisAbertos, setModaisAbertos] = useState({
    km: false,
    editVeiculo: false,
    deleteVeiculo: false,
    editItem: false,
    deleteItem: false,
    registrarServico: false,
  });

  // Função única para abrir e fechar modais
  const toggleModal = (modal, item = null) => {
    setItemSelecionado(item);
    setModaisAbertos(prevState => ({
      ...prevState,
      [modal]: !prevState[modal]
    }));
  };

  // Efeito para buscar dados do veículo e do histórico
  useEffect(() => {
    setIsLoading(true);
    const veiculoDocRef = doc(db, 'veiculos', id);
    const unsubVeiculo = onSnapshot(veiculoDocRef, (doc) => {
      if (doc.exists()) {
        setVeiculo({ id: doc.id, ...doc.data() });
      } else {
        setVeiculo(null);
      }
      setIsLoading(false);
    });

    const historicoCollRef = collection(db, 'veiculos', id, 'historico');
    const q = query(historicoCollRef, orderBy('data', 'desc'));
    const unsubHistorico = onSnapshot(q, (snapshot) => {
      setHistorico(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubVeiculo();
      unsubHistorico();
    };
  }, [id]);

  const veiculoProcessado = useMemo(() => {
    if (veiculo) return processarVeiculo(veiculo);
    return null;
  }, [veiculo]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- Funções CRUD para o Veículo ---
  const handleUpdateVeiculo = async (dadosAtualizados) => {
    const veiculoDocRef = doc(db, 'veiculos', id);
    await updateDoc(veiculoDocRef, dadosAtualizados);
  };

  const atualizarVeiculoKm = async (novaKm) => {
    const kmNumerico = parseInt(novaKm, 10);
    if (isNaN(kmNumerico)) return alert("Valor de KM inválido.");
    await handleUpdateVeiculo({ km_atual: kmNumerico });
  };

  const handleDeleteVeiculo = async () => {
    const veiculoDocRef = doc(db, 'veiculos', id);
    await deleteDoc(veiculoDocRef);
    navigate('/manutencao/dashboard');
  };

  // --- Funções CRUD para os Itens de Manutenção e Histórico ---
  const handleRegistrarServico = async (dadosDoModal) => {
    const veiculoDocRef = doc(db, 'veiculos', id);
    const historicoCollRef = collection(db, 'veiculos', id, 'historico');

    const novoRegistro = {
      ...dadosDoModal,
      nomeItem: itemSelecionado.nome,
      itemId: itemSelecionado.id,
      timestamp: serverTimestamp(),
    };

    const novosItens = veiculo.itensDeManutencao.map(item =>
      item.id === itemSelecionado.id ? { ...item, km_ultima_revisao: dadosDoModal.km_servico } : item
    );

    await addDoc(historicoCollRef, novoRegistro);
    await updateDoc(veiculoDocRef, { itensDeManutencao: novosItens });
  };

  const handleUpdateItem = async (dadosItemAtualizado) => {
    const novosItens = veiculo.itensDeManutencao.map(item =>
      item.id === itemSelecionado.id ? { ...item, ...dadosItemAtualizado } : item
    );
    await handleUpdateVeiculo({ itensDeManutencao: novosItens });
  };

  const handleDeleteItem = async () => {
    const novosItens = veiculo.itensDeManutencao.filter(item => item.id !== itemSelecionado.id);
    await handleUpdateVeiculo({ itensDeManutencao: novosItens });
    toggleModal('deleteItem'); // Fecha o modal de confirmação
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Carregando...</p></div>;
  }

  if (!veiculoProcessado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Veículo não encontrado</h1>
        <Link to="/manutencao/dashboard" className="mt-4 text-blue-600 hover:underline">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-gray-100 min-h-screen">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <Link to="/manutencao/dashboard" className="text-gray-500 hover:text-gray-800"><FiArrowLeft size={24} /></Link>
                <h1 className="text-xl font-semibold text-gray-800">Detalhes do Veículo</h1>
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-sm">Olá, {user?.email}</span>
                <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-600">Sair</button>
            </div>
        </header>

        <main className="p-8">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{veiculoProcessado.modelo}</h2>
                        <p className="text-gray-500">Placa: {veiculoProcessado.placa} | Ano: {veiculoProcessado.ano}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => toggleModal('editVeiculo')} className="flex items-center space-x-2 text-sm text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"><FiEdit /><span>Editar</span></button>
                        <button onClick={() => toggleModal('km')} className="flex items-center space-x-2 text-sm text-white bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-800"><FiEdit /><span>Atualizar KM</span></button>
                        <button onClick={() => toggleModal('deleteVeiculo')} className="flex items-center space-x-2 text-sm text-white bg-red-600 px-4 py-2 rounded-md hover:bg-red-700"><FiTrash2 /><span>Excluir</span></button>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                    <p className="text-gray-500">Quilometragem Atual</p>
                    <p className="font-bold text-3xl text-blue-600">{veiculoProcessado.km_atual.toLocaleString('pt-BR')} km</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-lg font-semibold mb-4">Plano de Manutenção Preventiva</h3>
                <div className="space-y-4">
                    {veiculoProcessado.itensDeManutencao.map(item => (
                        <ItemManutencaoCard key={item.id} item={item}
                            onRegistrar={() => toggleModal('registrarServico', item)}
                            onEdit={() => toggleModal('editItem', item)}
                            onDelete={() => toggleModal('deleteItem', item)}
                        />
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div
                  className="p-4 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setIsHistoricoOpen(!isHistoricoOpen)}
                >
                    <h3 className="text-lg font-semibold">Histórico de Serviços</h3>
                    <FiChevronDown
                      className={`transition-transform duration-300 ${isHistoricoOpen ? 'rotate-180' : ''}`}
                      size={20}
                    />
                </div>
                {isHistoricoOpen && (
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600 uppercase">
                          <tr>
                              <th className="p-4">Data</th>
                              <th className="p-4">Serviço</th>
                              <th className="p-4">KM do Serviço</th>
                              <th className="p-4">Custo</th>
                              <th className="p-4">Observações</th>
                          </tr>
                      </thead>
                      <tbody>
                          {historico.length > 0 ? (
                              historico.map(reg => <HistoricoRow key={reg.id} registro={reg} />)
                          ) : (
                              <tr><td colSpan="5" className="text-center p-8 text-gray-500">Nenhum serviço registrado.</td></tr>
                          )}
                      </tbody>
                  </table>
                )}
            </div>
        </main>
      </div>

      {/* Renderização Condicional dos Modais */}
      {modaisAbertos.km && <AtualizarKmModal veiculo={veiculoProcessado} onClose={() => toggleModal('km')} onSave={atualizarVeiculoKm} />}
      {modaisAbertos.editVeiculo && <EditarVeiculoModal veiculo={veiculoProcessado} onClose={() => toggleModal('editVeiculo')} onSave={handleUpdateVeiculo} />}
      {modaisAbertos.deleteVeiculo && <ConfirmacaoModal titulo="Confirmar Exclusão" mensagem={`Excluir o veículo de placa ${veiculoProcessado.placa}?`} onConfirm={handleDeleteVeiculo} onCancel={() => toggleModal('deleteVeiculo')} />}

      {modaisAbertos.registrarServico && <RegistrarServicoModal item={itemSelecionado} veiculoKm={veiculo.km_atual} onClose={() => toggleModal('registrarServico')} onSave={handleRegistrarServico} />}
      {modaisAbertos.editItem && <EditarItemModal item={itemSelecionado} onClose={() => toggleModal('editItem')} onSave={handleUpdateItem} />}
      {modaisAbertos.deleteItem && <ConfirmacaoModal titulo="Excluir Item" mensagem={`Excluir o item "${itemSelecionado?.nome}" do plano?`} onConfirm={handleDeleteItem} onCancel={() => toggleModal('deleteItem')} />}
    </div>
  );
}

export default PaginaInfoVeiculo;