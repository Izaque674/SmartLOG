// src/pages/AdicionarVeiculoPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext.jsx'; // Usando o novo hook

// --- Componente ItemManutencaoInput (sem alterações) ---
function ItemManutencaoInput({ onAddItem }) {
  const [nome, setNome] = useState('');
  const [intervalo, setIntervalo] = useState('');

  const handleAddItem = () => {
    if (!nome || !intervalo) {
      alert('Preencha o nome do serviço e o intervalo em KM.');
      return;
    }
    onAddItem({
      id: `item-${Date.now()}`,
      nome,
      intervalo_km: parseInt(intervalo, 10),
      km_ultima_revisao: 0
    });
    setNome('');
    setIntervalo('');
  };

  return (
    <div className="flex items-end space-x-2 p-4 bg-gray-50 rounded-lg border">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">Nome do Serviço</label>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Troca de Óleo" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">Intervalo (em KM)</label>
        <input type="number" value={intervalo} onChange={(e) => setIntervalo(e.target.value)} placeholder="Ex: 10000" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>
      <button type="button" onClick={handleAddItem} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
        <FiPlus /><span>Adicionar</span>
      </button>
    </div>
  );
}

// --- Componente Principal da Página de Adicionar ---
function AdicionarVeiculoPage() {
  const navigate = useNavigate();
  const { adicionarVeiculo } = useAppContext(); // Pega a função 'adicionarVeiculo' do contexto

  const [veiculo, setVeiculo] = useState({ placa: '', modelo: '', ano: '', km_atual: '' });
  const [itensManutencao, setItensManutencao] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVeiculo(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAddItem = (novoItem) => {
    const kmInicial = parseInt(veiculo.km_atual, 10) || 0;
    setItensManutencao(prevState => [...prevState, { ...novoItem, km_ultima_revisao: kmInicial }]);
  };

  const handleRemoveItem = (itemId) => {
    setItensManutencao(prevState => prevState.filter(item => item.id !== itemId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (itensManutencao.length === 0) {
      alert('Adicione pelo menos um item de manutenção ao plano.');
      return;
    }

    const novoVeiculo = {
      id: Date.now(),
      ...veiculo,
      ano: parseInt(veiculo.ano, 10),
      km_atual: parseInt(veiculo.km_atual, 10),
      itensDeManutencao: itensManutencao,
    };

    // Chama a função do contexto para atualizar o estado global
    adicionarVeiculo(novoVeiculo);
    // Navega de volta para o dashboard
    navigate('/manutencao/dashboard');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm p-4 flex items-center space-x-4">
        <Link to="/manutencao/dashboard" className="text-gray-500 hover:text-gray-800">
          <FiArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-800">Adicionar Novo Veículo</h1>
      </header>
      <main className="p-8">
        <form onSubmit={handleSubmit}>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-lg font-semibold mb-4">Informações do Veículo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="placa" value={veiculo.placa} onChange={handleInputChange} placeholder="Placa" required className="px-3 py-2 border rounded-md"/>
              <input name="modelo" value={veiculo.modelo} onChange={handleInputChange} placeholder="Modelo" required className="px-3 py-2 border rounded-md"/>
              <input name="ano" type="number" value={veiculo.ano} onChange={handleInputChange} placeholder="Ano" required className="px-3 py-2 border rounded-md"/>
              <input name="km_atual" type="number" value={veiculo.km_atual} onChange={handleInputChange} placeholder="KM Inicial" required className="px-3 py-2 border rounded-md"/>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-lg font-semibold mb-4">Plano de Manutenção Preventiva</h2>
            <div className="space-y-3 mb-4">
              {itensManutencao.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                  <p>{item.nome} - a cada {item.intervalo_km.toLocaleString('pt-BR')} km</p>
                  <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700"><FiTrash2 /></button>
                </div>
              ))}
              {itensManutencao.length === 0 && <p className="text-sm text-gray-500 text-center">Nenhum item adicionado ainda.</p>}
            </div>
            <ItemManutencaoInput onAddItem={handleAddItem} />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Salvar Veículo</button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AdicionarVeiculoPage;