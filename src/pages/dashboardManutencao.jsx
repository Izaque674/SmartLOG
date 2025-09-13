import React, { useEffect, useMemo, useState, useCallback, useTransition } from 'react';
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
// A importação do Header foi REMOVIDA daqui.

/**
 * Componente de esqueleto usado durante o carregamento de dados.
 */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
      <div className="mb-4 h-6 w-1/3 rounded bg-gray-200 dark:bg-slate-700" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded bg-gray-100 dark:bg-slate-700/60" />
        <div className="h-20 rounded bg-gray-100 dark:bg-slate-700/60" />
      </div>
    </div>
  );
}

/**
 * Componente de cartão KPI para exibir métricas importantes.
 */
function KpiCard({ title, value, icon, color = 'bg-gradient-to-br from-indigo-500 to-pink-500' }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/60">
      <div className={`rounded-xl p-3 text-white shadow-md ${color}`}>{icon}</div>
      <div>
        <div className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</div>
        <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}

/**
 * Componente para exibir uma linha de veículo na tabela.
 */
function VeiculoRow({ veiculo }) {
  const statusStyles = {
    'Em dia': 'bg-green-100 text-green-800 ring-green-600/20',
    'Atenção': 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
    'Atrasado': 'bg-red-100 text-red-800 ring-red-600/20',
    'Erro': 'bg-gray-100 text-gray-700 ring-gray-500/10'
  };
  const kmAtual = Number(veiculo?.km_atual || 0);
  const statusClass = statusStyles[veiculo?.statusGeral] || 'bg-gray-100 text-gray-700 ring-gray-500/10';

  return (
    <tr className="border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-900">
      <td className="whitespace-nowrap p-4 align-middle">
        <div className="font-semibold text-gray-900 dark:text-white">{veiculo?.placa ?? '—'}</div>
        <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">{veiculo?.modelo ?? ''}</div>
      </td>
      <td className="whitespace-nowrap p-4 align-middle">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${statusClass}`}>
          {veiculo?.statusGeral ?? 'N/A'}
        </span>
      </td>
      <td className="whitespace-nowrap p-4 align-middle text-gray-700 dark:text-slate-300">{kmAtual.toLocaleString('pt-BR')} km</td>
      <td className="whitespace-nowrap p-4 align-middle">
        <div className="font-medium text-gray-800 dark:text-slate-200">{veiculo?.itemMaisUrgente?.nome || 'N/A'}</div>
        {veiculo?.itemMaisUrgente && (
          <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">em {Number(veiculo.itemMaisUrgente.kmRestantes || 0).toLocaleString('pt-BR')} km</div>
        )}
      </td>
      <td className="whitespace-nowrap p-4 text-right align-middle">
        <Link to={`/manutencao/veiculo/${veiculo?.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors duration-200 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900">
          <FiPlus className="h-4 w-4" /> Ver Detalhes
        </Link>
      </td>
    </tr>
  );
}

/**
 * Componente principal do Dashboard de Manutenção.
 */
export default function DashboardManutencao() {
  const { user } = useAppContext();
  const [frota, setFrota] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [queryText, setQueryText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      setFrota([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const ref = collection(db, 'veiculos');
    const q = query(ref, where('userId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setFrota(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setIsLoading(false);
      },
      (err) => {
        console.error('Erro listener frota:', err);
        setFrota([]);
        setIsLoading(false);
      }
    );
    return () => { try { unsub(); } catch (e) {} };
  }, [user]);

  const frotaProcessada = useMemo(() => {
    try {
      return frota.map(v => {
        try {
          return processarVeiculo(v);
        } catch (err) {
          return { id: v.id, placa: v.placa || '—', modelo: v.modelo || '', km_atual: v.km_atual || 0, statusGeral: 'Erro', itemMaisUrgente: null, };
        }
      });
    } catch (err) {
      return [];
    }
  }, [frota]);

  const handleSearch = useCallback((val) => startTransition(() => setQueryText(val)), [startTransition]);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return frotaProcessada.filter(v => {
      if (filterStatus !== 'all') {
        if (filterStatus === 'emdia' && v.statusGeral !== 'Em dia') return false;
        if (filterStatus === 'atencao' && v.statusGeral !== 'Atenção') return false;
        if (filterStatus === 'atrasado' && v.statusGeral !== 'Atrasado') return false;
        if (filterStatus === 'erro' && v.statusGeral !== 'Erro') return false;
      }
      if (!q) return true;
      return `${v.placa} ${v.modelo} ${v.itemMaisUrgente?.nome || ''}`.toLowerCase().includes(q);
    });
  }, [frotaProcessada, queryText, filterStatus]);

  const totalVeiculos = frotaProcessada.length;
  const emDia = frotaProcessada.filter(v => v.statusGeral === 'Em dia').length;
  const emAtencao = frotaProcessada.filter(v => v.statusGeral === 'Atenção').length;
  const atrasados = frotaProcessada.filter(v => v.statusGeral === 'Atrasado').length;

  return (
    // A div de fundo e o Header foram REMOVIDOS.
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Frota de Veículos</h1>
            <p className="mt-1 text-base text-gray-500 dark:text-slate-400">Monitoramento em tempo real da sua frota.</p>
          </div>

          <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                aria-label="Pesquisar"
                value={queryText}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-800 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-600 dark:focus:ring-indigo-700/50 sm:w-64"
                placeholder="Pesquisar placa, modelo..."
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white p-1 shadow-sm dark:border-slate-600 dark:bg-slate-800">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-transparent py-1 pl-3 pr-2 text-sm text-gray-800 outline-none dark:text-white"
                aria-label="Filtrar status"
              >
                <option value="all">Todos os Status</option>
                <option value="emdia">Em dia</option>
                <option value="atencao">Requer Atenção</option>
                <option value="atrasado">Atrasado</option>
                <option value="erro">Com Erro</option>
              </select>
              <FiChevronDown className="pointer-events-none -ml-2 mr-2 text-gray-500 dark:text-slate-400" />
              <button
                onClick={() => { setQueryText(''); setFilterStatus('all'); }}
                title="Limpar filtros"
                className="rounded-full px-3 py-1 text-sm text-gray-600 transition-colors duration-200 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                Limpar
              </button>
            </div>
            <Link
              to="/manutencao/veiculos/novo"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            >
              <FiPlusCircle className="h-5 w-5" />
              <span className="font-medium">Novo veículo</span>
            </Link>
          </div>
        </div>
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </>
          ) : (
            <>
              <KpiCard title="Total de Veículos" value={totalVeiculos} icon={<FiTool className="h-6 w-6" />} color="bg-gradient-to-br from-indigo-500 to-indigo-700" />
              <KpiCard title="Manutenção em Dia" value={emDia} icon={<FiCheckCircle className="h-6 w-6" />} color="bg-gradient-to-br from-emerald-500 to-green-600" />
              <KpiCard title="Requer Atenção" value={emAtencao} icon={<FiAlertTriangle className="h-6 w-6" />} color="bg-gradient-to-br from-amber-500 to-yellow-600" />
              <KpiCard title="Manutenção Atrasada" value={atrasados} icon={<FiAlertTriangle className="h-6 w-6" />} color="bg-gradient-to-br from-rose-600 to-red-700" />
            </>
          )}
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Frota Detalhada</h2>
              <div className="mt-1 text-sm text-gray-500 dark:text-slate-400">Atualizado em tempo real.</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                title="Atualizar dados"
                className="group rounded-full p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <FiRefreshCw className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />
              </button>
              <div className="hidden text-sm text-gray-600 dark:text-slate-400 sm:block">
                {isPending ? 'Filtrando...' : `Exibindo ${filtered.length} de ${totalVeiculos} veículos`}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th scope="col" className="w-1/4 px-4 py-3 font-medium text-gray-600 dark:text-slate-300">Veículo <FiChevronDown className="ml-1 inline-block text-xs" /></th>
                  <th scope="col" className="w-1/6 px-4 py-3 font-medium text-gray-600 dark:text-slate-300">Status</th>
                  <th scope="col" className="w-1/6 px-4 py-3 font-medium text-gray-600 dark:text-slate-300">KM Atual</th>
                  <th scope="col" className="w-1/4 px-4 py-3 font-medium text-gray-600 dark:text-slate-300">Manutenção Mais Urgente</th>
                  <th scope="col" className="w-1/6 px-4 py-3 text-right font-medium text-gray-600 dark:text-slate-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4"><div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-700"></div><div className="mt-1 h-3 w-1/2 rounded bg-gray-100 dark:bg-slate-700/60"></div></td>
                      <td className="p-4"><div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-slate-700"></div></td>
                      <td className="p-4"><div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-slate-700"></div></td>
                      <td className="p-4"><div className="h-4 w-3/5 rounded bg-gray-200 dark:bg-slate-700"></div><div className="mt-1 h-3 w-1/3 rounded bg-gray-100 dark:bg-slate-700/60"></div></td>
                      <td className="p-4"><div className="float-right h-8 w-24 rounded-full bg-gray-200 dark:bg-slate-700"></div></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="mb-4 text-lg font-medium text-gray-600 dark:text-slate-400">Nenhum veículo encontrado com os critérios atuais.</div>
                      <Link
                        to="/manutencao/veiculos/novo"
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-white shadow-md transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                      >
                        <FiPlus className="h-5 w-5" />
                        <span className="font-medium">Adicionar novo veículo</span>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filtered.map(v => <VeiculoRow key={v.id} veiculo={v} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}