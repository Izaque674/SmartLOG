import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // useNavigate e useOutletContext foram removidos
import { useAppContext } from '../context/AppContext.jsx';
import { processarVeiculo } from '../utils/manutencaoLogic.js';
import { FiPlusCircle, FiTool, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
// A importação do Header foi removida, pois ele agora está no MainLayout

// --- Componente KpiCard (sem alterações) ---
function KpiCard({ title, value, icon, className }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 ${className || ''}`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

// --- Componente VeiculoRow (sem alterações) ---
function VeiculoRow({ veiculo }) {
  const statusStyles = {
    'Em dia': 'bg-green-100 text-green-800',
    'Atenção': 'bg-yellow-100 text-yellow-800',
    'Atrasado': 'bg-red-100 text-red-800',
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-4 font-medium">{veiculo.placa} <span className="block text-sm text-gray-500 font-normal">{veiculo.modelo}</span></td>
      <td className="p-4">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[veiculo.statusGeral]}`}>
          {veiculo.statusGeral}
        </span>
      </td>
      <td className="p-4">{veiculo.km_atual.toLocaleString('pt-BR')} km</td>
      <td className="p-4">
        <span className="font-semibold">{veiculo.itemMaisUrgente?.nome || 'N/A'}</span>
        {veiculo.itemMaisUrgente && (
          <span className="block text-sm text-gray-500">
            em {veiculo.itemMaisUrgente.kmRestantes.toLocaleString('pt-BR')} km
          </span>
        )}
      </td>
      <td className="p-4">
        <Link to={`/manutencao/veiculo/${veiculo.id}`} className="text-blue-600 hover:underline font-semibold">
          Ver Detalhes
        </Link>
      </td>
    </tr>
  );
}

// --- Componente Principal do Dashboard ---
function DashboardManutencao() {
  const { user } = useAppContext();
  const [frota, setFrota] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false); // Adicionado para parar o loading se não houver usuário
      return;
    }
    const veiculosCollectionRef = collection(db, 'veiculos');
    const q = query(veiculosCollectionRef, where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const veiculosData = [];
      querySnapshot.forEach((doc) => {
        veiculosData.push({ id: doc.id, ...doc.data() });
      });
      setFrota(veiculosData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const frotaProcessada = useMemo(() => {
    return frota.map(veiculo => processarVeiculo(veiculo));
  }, [frota]);

  const totalVeiculos = frotaProcessada.length;
  const emDia = frotaProcessada.filter(v => v.statusGeral === 'Em dia').length;
  const emAtencao = frotaProcessada.filter(v => v.statusGeral === 'Atenção').length;
  const atrasados = frotaProcessada.filter(v => v.statusGeral === 'Atrasado').length;
  
  if (isLoading) {
    return (
        <div className="flex justify-center items-center p-8">
            <p>Carregando frota...</p>
        </div>
    );
  }

  return (
    // O componente agora retorna apenas o conteúdo da página, sem a div externa e o header
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Total de Veículos" value={totalVeiculos} icon={<FiTool />} />
        <KpiCard title="Manutenção em Dia" value={emDia} icon={<FiCheckCircle className="text-green-500"/>} />
        <KpiCard title="Requer Atenção" value={emAtencao} icon={<FiAlertTriangle className="text-yellow-500"/>} />
        <KpiCard title="Manutenção Atrasada" value={atrasados} icon={<FiAlertTriangle className="text-red-500"/>} />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-semibold">Frota Completa</h2>
          <Link 
            to="/manutencao/veiculos/novo"
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FiPlusCircle />
            <span>Adicionar Veículo</span>
          </Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase">
            <tr>
              <th className="p-4">Veículo</th>
              <th className="p-4">Status Geral</th>
              <th className="p-4">KM Atual</th>
              <th className="p-4">Manutenção Mais Urgente</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {frotaProcessada.length > 0 ? (
              frotaProcessada.map(veiculo => (
                <VeiculoRow key={veiculo.id} veiculo={veiculo} />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-8 text-gray-500">
                  Nenhum veículo cadastrado ainda. Comece adicionando um!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardManutencao;