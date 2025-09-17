import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { processarVeiculo } from '../utils/manutencaoLogic.js';
import { FiCheckCircle, FiAlertTriangle, FiEdit, FiTrash2, FiTool, FiChevronDown, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

// Modais
import AtualizarKmModal from '../components/AtualizarKmModal.jsx';
import ConfirmacaoModal from '../components/ConfirmacaoModal.jsx';
import EditarVeiculoModal from '../components/EditarVeiculoModal.jsx';
import EditarItemModal from '../components/EditarItemModal.jsx';
import RegistrarServicoModal from '../components/RegistrarServicoModal.jsx';

// Funções do Firebase
import { doc, onSnapshot, updateDoc, deleteDoc, collection, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';

// Componente Card de Item de Manutenção
function ItemManutencaoCard({ item, onRegistrar, onEdit, onDelete }) {
  const statusStyles = {
    'Em dia': { bg: 'dark:bg-green-900/20 bg-green-50', border: 'border-green-500', icon: <FiCheckCircle className="text-green-500" /> },
    'Atenção': { bg: 'dark:bg-yellow-900/20 bg-yellow-50', border: 'border-yellow-500', icon: <FiAlertTriangle className="text-yellow-500" /> },
    'Atrasado': { bg: 'dark:bg-red-900/20 bg-red-50', border: 'border-red-500', icon: <FiAlertTriangle className="text-red-500" /> },
  };
  const styles = statusStyles[item.status] || { bg: 'bg-gray-50 dark:bg-slate-700', border: 'border-gray-400', icon: null };

  return (
    <div className={`p-4 rounded-lg border-l-4 ${styles.bg} ${styles.border} flex justify-between items-center`}>
      <div className="flex items-center space-x-3">
        <div className="text-xl">{styles.icon}</div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-slate-200">{item.nome}</p>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Próxima revisão em: <span className="font-bold">{item.kmProximaRevisao.toLocaleString('pt-BR')} km</span>
            {item.status === 'Atrasado'
              ? <span className="text-red-600 font-semibold ml-2">({Math.abs(item.kmRestantes).toLocaleString('pt-BR')} km atrasado)</span>
              : <span className="text-gray-500 ml-2">({item.kmRestantes.toLocaleString('pt-BR')} km restantes)</span>
            }
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <button onClick={() => onEdit(item)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full dark:hover:bg-slate-700"><FiEdit size={16} /></button>
        <button onClick={() => onDelete(item)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full dark:hover:bg-slate-700"><FiTrash2 size={16} /></button>
        <button onClick={() => onRegistrar(item)} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 active:scale-95">
          <span className="hidden sm:inline">Registrar</span>
          <FiTool className="sm:hidden" />
        </button>
      </div>
    </div>
  );
}

// Componente Linha da Tabela de Histórico
function HistoricoRow({ registro }) {
  const dataFormatada = new Date(registro.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  return (
    <tr className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-900">
      <td className="p-4">{dataFormatada}</td>
      <td className="p-4 font-semibold">{registro.nomeItem}</td>
      <td className="p-4">{registro.km_servico.toLocaleString('pt-BR')} km</td>
      <td className="p-4">R$ {registro.custo.toFixed(2).replace('.', ',')}</td>
      <td className="p-4 text-sm text-gray-600 dark:text-slate-400">{registro.observacoes || '-'}</td>
    </tr>
  );
}

// --- Componente Principal da Página ---
function PaginaInfoVeiculo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [veiculo, setVeiculo] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(true);
  const [modaisAbertos, setModaisAbertos] = useState({ km: false, editVeiculo: false, deleteVeiculo: false, editItem: false, deleteItem: false, registrarServico: false, });

  const toggleModal = (modal, item = null) => {
    setItemSelecionado(item);
    setModaisAbertos(prevState => ({ ...prevState, [modal]: !prevState[modal] }));
  };

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    const veiculoDocRef = doc(db, 'veiculos', id);
    const unsubVeiculo = onSnapshot(veiculoDocRef, (doc) => {
      if (doc.exists()) {
        setVeiculo({ id: doc.id, ...doc.data() });
      } else {
        setVeiculo(null);
        navigate('/manutencao/dashboard'); // Volta se o veículo for deletado
      }
    });

    const historicoCollRef = collection(db, 'veiculos', id, 'historico');
    const q = query(historicoCollRef, orderBy('data', 'desc'));
    const unsubHistorico = onSnapshot(q, (snapshot) => {
      setHistorico(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });

    return () => {
      unsubVeiculo();
      unsubHistorico();
    };
  }, [id, navigate]);

  const veiculoProcessado = useMemo(() => {
    if (veiculo) return processarVeiculo(veiculo);
    return null;
  }, [veiculo]);

  const handleUpdateVeiculo = async (dadosAtualizados) => {
    const veiculoDocRef = doc(db, 'veiculos', id);
    await updateDoc(veiculoDocRef, dadosAtualizados);
    toggleModal('editVeiculo');
  };

  const atualizarVeiculoKm = async (novaKm) => {
    const kmNumerico = parseInt(novaKm, 10);
    if (isNaN(kmNumerico)) return alert("Valor de KM inválido.");
    await updateDoc(doc(db, 'veiculos', id), { km_atual: kmNumerico });
    toggleModal('km');
  };

  const handleDeleteVeiculo = async () => {
    await deleteDoc(doc(db, 'veiculos', id));
  };

  const handleRegistrarServico = async (dadosDoModal) => {
    const novoRegistro = { ...dadosDoModal, nomeItem: itemSelecionado.nome, itemId: itemSelecionado.id, timestamp: serverTimestamp() };
    const novosItens = veiculo.itensDeManutencao.map(item => item.id === itemSelecionado.id ? { ...item, km_ultima_revisao: dadosDoModal.km_servico } : item);
    await addDoc(collection(db, 'veiculos', id, 'historico'), novoRegistro);
    await updateDoc(doc(db, 'veiculos', id), { itensDeManutencao: novosItens });
    toggleModal('registrarServico');
  };

  const handleUpdateItem = async (dadosItemAtualizado) => {
    const novosItens = veiculo.itensDeManutencao.map(item => item.id === itemSelecionado.id ? { ...item, ...dadosItemAtualizado } : item);
    await updateDoc(doc(db, 'veiculos', id), { itensDeManutencao: novosItens });
    toggleModal('editItem');
  };

  const handleDeleteItem = async () => {
    const novosItens = veiculo.itensDeManutencao.filter(item => item.id !== itemSelecionado.id);
    await updateDoc(doc(db, 'veiculos', id), { itensDeManutencao: novosItens });
    toggleModal('deleteItem');
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  if (!veiculoProcessado) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Veículo não encontrado</h1>
        <Link to="/manutencao/dashboard" className="mt-4 text-blue-600 hover:underline">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link to="/manutencao/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200">
            <FiArrowLeft /> Voltar para o Dashboard
          </Link>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{veiculoProcessado.modelo}</h2>
              <p className="text-gray-500 dark:text-slate-400">Placa: {veiculoProcessado.placa} | Ano: {veiculoProcessado.ano}</p>
            </div>


<div className="flex items-center space-x-3">
  <button
    onClick={() => toggleModal('editVeiculo')}
    className="flex items-center justify-center px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
    aria-label="Editar veículo"
  >
    <FiEdit className="mr-2" />
    <span>Editar</span>
  </button>

  <button
    onClick={() => toggleModal('km')}
    className="flex items-center justify-center px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
    aria-label="Atualizar quilometragem"
  >
    <FiRefreshCw className="mr-2" />
    <span>Atualizar KM</span>
  </button>

  <button
    onClick={() => toggleModal('deleteVeiculo')}
    className="flex items-center justify-center px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
    aria-label="Excluir veículo"
  >
    <FiTrash2 className="mr-2" />
    <span>Excluir</span>
  </button>
</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-gray-500 dark:text-slate-400">Quilometragem Atual</p>
            <p className="font-bold text-3xl text-blue-600">{veiculoProcessado.km_atual.toLocaleString('pt-BR')} km</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plano de Manutenção Preventiva</h3>
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

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
          <div onClick={() => setIsHistoricoOpen(!isHistoricoOpen)} className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico de Serviços</h3>
            <FiChevronDown className={`transition-transform duration-300 ${isHistoricoOpen ? 'rotate-180' : ''}`} size={20} />
          </div>
          {isHistoricoOpen && (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 uppercase">
                <tr>
                  <th className="p-4">Data</th>
                  <th className="p-4">Serviço</th>
                  <th className="p-4">KM do Serviço</th>
                  <th className="p-4">Custo</th>
                  <th className="p-4">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {historico.length > 0 ? (
                  historico.map(reg => <HistoricoRow key={reg.id} registro={reg} />)
                ) : (
                  <tr><td colSpan="5" className="text-center p-8 text-gray-500 dark:text-slate-400">Nenhum serviço registrado.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modaisAbertos.km && <AtualizarKmModal veiculo={veiculoProcessado} onClose={() => toggleModal('km')} onSave={atualizarVeiculoKm} />}
      {modaisAbertos.editVeiculo && <EditarVeiculoModal veiculo={veiculoProcessado} onClose={() => toggleModal('editVeiculo')} onSave={handleUpdateVeiculo} />}
      {modaisAbertos.deleteVeiculo && <ConfirmacaoModal titulo="Excluir Veículo" onConfirm={handleDeleteVeiculo} onCancel={() => toggleModal('deleteVeiculo')} />}
      {modaisAbertos.registrarServico && <RegistrarServicoModal item={itemSelecionado} veiculoKm={veiculo.km_atual} onClose={() => toggleModal('registrarServico')} onSave={handleRegistrarServico} />}
      {modaisAbertos.editItem && <EditarItemModal item={itemSelecionado} onClose={() => toggleModal('editItem')} onSave={handleUpdateItem} />}
      {modaisAbertos.deleteItem && <ConfirmacaoModal titulo="Excluir Item" onConfirm={handleDeleteItem} onCancel={() => toggleModal('deleteItem')} />}
    </div>
  );
}

export default PaginaInfoVeiculo;