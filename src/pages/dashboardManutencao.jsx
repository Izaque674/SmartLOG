import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useTransition
} from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { processarVeiculo } from '../utils/manutencaoLogic.js';
import {
  FiPlusCircle,
  FiTool,
  FiAlertTriangle,
  FiCheckCircle,
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiChevronDown
} from 'react-icons/fi';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';

// Skeleton Loader
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-gradient-to-br from-gray-100 to-white p-6 grid gap-4 dark:from-slate-700 dark:to-slate-800">
      <div className="h-6 w-1/2 bg-gray-300 rounded" />
      <div className="h-40 bg-gray-300 rounded" />
    </div>
  );
}

// KPI Card
function KpiCard({ title, value, icon, color }) {
  return (
    <div className={`${color} p-5 rounded-2xl shadow-lg flex items-center gap-4 transform transition-transform hover:scale-105`}>
      <div className="text-white text-2xl">{icon}</div>
      <div>
        <div className="text-white text-sm opacity-80">{title}</div>
        <div className="text-white text-3xl font-bold">{value}</div>
      </div>
    </div>
  );
}

// Vehicle Row
function VeiculoRow({ veiculo }) {
  const statusStyles = {
    'Em dia': 'bg-green-100 text-green-800',
    Atenção: 'bg-yellow-100 text-yellow-800',
    Atrasado: 'bg-red-100 text-red-800',
    Erro: 'bg-gray-100 text-gray-700'
  };
  const statusClass = statusStyles[veiculo.statusGeral] || statusStyles.Erro;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
      <td className="p-4">
        <div className="font-semibold">{veiculo.placa}</div>
        <div className="text-sm text-gray-500">{veiculo.modelo}</div>
      </td>
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs ${statusClass}`}>
          {veiculo.statusGeral}
        </span>
      </td>
      <td className="p-4">{veiculo.km_atual.toLocaleString()} km</td>
      <td className="p-4">
        <div className="font-medium">{veiculo.itemMaisUrgente?.nome || 'N/A'}</div>
        {veiculo.itemMaisUrgente && (
          <div className="text-sm text-gray-500">
            em {veiculo.itemMaisUrgente.kmRestantes.toLocaleString()} km
          </div>
        )}
      </td>
      <td className="p-4 text-right">
        <Link
          to={`/manutencao/veiculo/${veiculo.id}`}
          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
        >
          <FiPlus /> Detalhes
        </Link>
      </td>
    </tr>
  );
}

export default function DashboardManutencao() {
  const { user } = useAppContext();
  const [frota, setFrota] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [queryText, setQueryText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) return setIsLoading(false);
    setIsLoading(true);
    const q = query(
      collection(db, 'veiculos'),
      where('userId', '==', user.uid)
    );
    const unsub = onSnapshot(q, snap => {
      setFrota(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    });
    return unsub;
  }, [user]);

  const frotaProcessada = useMemo(
    () => frota.map(v => {
      try { return processarVeiculo(v); }
      catch { return { ...v, statusGeral: 'Erro', itemMaisUrgente: null }; }
    }),
    [frota]
  );

  const handleSearch = useCallback(
    val => startTransition(() => setQueryText(val)),
    []
  );

  const filtered = useMemo(() => {
    const q = queryText.toLowerCase();
    return frotaProcessada.filter(v => {
      if (filterStatus !== 'all' && v.statusGeral.toLowerCase() !== filterStatus) return false;
      if (!q) return true;
      return `${v.placa} ${v.modelo}`.toLowerCase().includes(q);
    });
  }, [frotaProcessada, queryText, filterStatus]);

  const stats = useMemo(() => {
    const total = frotaProcessada.length;
    const emDia = frotaProcessada.filter(v => v.statusGeral === 'Em dia').length;
    const atento = frotaProcessada.filter(v => v.statusGeral === 'Atenção').length;
    const atrasado = frotaProcessada.filter(v => v.statusGeral === 'Atrasado').length;
    return { total, emDia, atento, atrasado };
  }, [frotaProcessada]);

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Gestão de Manutenção</h1>
            <p className="text-gray-600">Visão completa da sua frota</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <input
                value={queryText}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Pesquisar..."
                className="pl-10 pr-4 py-2 rounded-full border"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="rounded-full border px-4 py-2"
            >
              <option value="all">Todos</option>
              <option value="emdia">Em dia</option>
              <option value="atenção">Atenção</option>
              <option value="atrasado">Atrasado</option>
            </select>
            <Link
              to="/manutencao/veiculos/novo"
              className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow hover:bg-indigo-700"
            >
              <FiPlusCircle className="inline-block mr-2" /> Novo Veículo
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total"
            value={stats.total}
            icon={<FiTool />}
            color="bg-gradient-to-br from-indigo-500 to-purple-600"
          />
          <KpiCard
            title="Em Dia"
            value={stats.emDia}
            icon={<FiCheckCircle />}
            color="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <KpiCard
            title="Atenção"
            value={stats.atento}
            icon={<FiAlertTriangle />}
            color="bg-gradient-to-br from-yellow-400 to-amber-500"
          />
          <KpiCard
            title="Atrasado"
            value={stats.atrasado}
            icon={<FiAlertTriangle />}
            color="bg-gradient-to-br from-red-500 to-rose-600"
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Frota Detalhada</h2>
            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiRefreshCw className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Veículo</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">KM</th>
                  <th className="p-3">Urgente</th>
                  <th className="p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                  : filtered.length > 0
                  ? filtered.map(v => <VeiculoRow key={v.id} veiculo={v} />)
                  : (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-500">
                        Nenhum veículo encontrado.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
