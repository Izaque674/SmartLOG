// src/pages/DetalhesVeiculoPage.jsx

import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';// Usando o novo hook
import { processarVeiculo } from '../utils/manutencaoLogic.js';
import { FiArrowLeft, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

// --- Componente ItemManutencaoCard (sem alterações) ---
function ItemManutencaoCard({ item }) {
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
      <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">Registrar Manutenção</button>
    </div>
  );
}

// --- Componente Principal da Página de Detalhes ---
function PaginaInfoVeiculo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout, frota } = useAppContext(); // Pega a 'frota' do contexto

  const veiculoProcessado = useMemo(() => {
    // Busca na frota global, que está sempre atualizada
    const veiculo = frota.find(v => v.id === parseInt(id));
    if (veiculo) {
      return processarVeiculo(veiculo);
    }
    return null;
  }, [id, frota]); // Depende do ID da URL e da frota do contexto

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

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
          <h2 className="text-2xl font-bold text-gray-900">{veiculoProcessado.modelo}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div><p className="text-gray-500">Placa</p><p className="font-semibold text-lg">{veiculoProcessado.placa}</p></div>
            <div><p className="text-gray-500">Ano</p><p className="font-semibold text-lg">{veiculoProcessado.ano}</p></div>
            <div><p className="text-gray-500">KM Atual</p><p className="font-semibold text-lg">{veiculoProcessado.km_atual.toLocaleString('pt-BR')} km</p></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Itens de Manutenção Preventiva</h3>
          <div className="space-y-4">
            {veiculoProcessado.itensDeManutencao.map(item => (
              <ItemManutencaoCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PaginaInfoVeiculo; // <-- CORRIGIDO