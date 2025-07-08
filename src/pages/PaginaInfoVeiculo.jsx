import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { processarVeiculo } from '../utils/manutencaoLogic.js';
import { FiArrowLeft, FiCheckCircle, FiAlertTriangle, FiEdit } from 'react-icons/fi';
import AtualizarKmModal from '../components/AtualizarKmModal.jsx';
import ConfirmacaoModal from '../components/ConfirmacaoModal.jsx';

function ItemManutencaoCard({ item, onRegistrar }) {
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
      <button 
        onClick={() => onRegistrar(item)}
        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 active:scale-95 transition-transform"
      >
        Registrar Serviço
      </button>
    </div>
  );
}

function PaginaInfoVeiculo() {
  const { id } = useParams();
  const navigate = useNavigate();
  // CORREÇÃO AQUI: Garante que o nome da função está correto
  const { user, logout, frota, atualizarVeiculoKm, registrarManutencaoRealizada } = useAppContext();

  const [isKmModalOpen, setIsKmModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const veiculoProcessado = useMemo(() => {
    const veiculo = frota.find(v => v.id === parseInt(id));
    if (veiculo) return processarVeiculo(veiculo);
    return null;
  }, [id, frota]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenConfirmModal = (item) => {
    setItemSelecionado(item);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setItemSelecionado(null);
  };
  
  const handleConfirmarManutencao = () => {
    if (veiculoProcessado && itemSelecionado) {
      // Usa a função com o nome correto
      registrarManutencaoRealizada(veiculoProcessado.id, itemSelecionado.id);
    }
    handleCloseConfirmModal();
  };

  if (!veiculoProcessado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Veículo não encontrado</h1>
        <Link to="/manutencao/dashboard" className="mt-4 text-blue-600 hover:underline">
          Voltar para o Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-gray-100 min-h-screen">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/manutencao/dashboard" className="text-gray-500 hover:text-gray-800">
              <FiArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Detalhes do Veículo</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Olá, {user?.name || 'Gestor'}</span>
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
              <button
                onClick={() => setIsKmModalOpen(true)}
                className="flex items-center space-x-2 text-sm text-white bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-800 active:scale-95 transition-transform"
              >
                <FiEdit />
                <span>Atualizar KM</span>
              </button>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-500">Quilometragem Atual</p>
              <p className="font-bold text-3xl text-blue-600">{veiculoProcessado.km_atual.toLocaleString('pt-BR')} km</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Itens de Manutenção Preventiva</h3>
            <div className="space-y-4">
              {veiculoProcessado.itensDeManutencao.map(item => (
                <ItemManutencaoCard 
                  key={item.id} 
                  item={item} 
                  onRegistrar={handleOpenConfirmModal}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {isKmModalOpen && (
        <AtualizarKmModal
          veiculo={veiculoProcessado}
          onClose={() => setIsKmModalOpen(false)}
          onSave={atualizarVeiculoKm}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmacaoModal
          titulo="Confirmar Serviço Realizado"
          mensagem={`Você confirma que o serviço "${itemSelecionado?.nome}" foi realizado? A quilometragem da última revisão para este item será atualizada para ${veiculoProcessado.km_atual.toLocaleString('pt-BR')} km.`}
          onConfirm={handleConfirmarManutencao}
          onCancel={handleCloseConfirmModal}
        />
      )}
    </div>
  );
}

export default PaginaInfoVeiculo;