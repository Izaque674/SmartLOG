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
  FiPlus
} from 'react-icons/fi';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';

// Swiper imports corretos p/ v9+
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Dynamic background component
function DynamicBackground() {
  const { theme } = useAppContext();
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className={`absolute inset-0 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900'
            : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'
        }`}
      />
      <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse-slow opacity-70" />
      <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-cyan-600/8 rounded-full blur-3xl animate-float opacity-60" />
      <div className="absolute top-1/2 left-3/4 w-48 h-48 bg-gradient-to-br from-purple-500/12 to-pink-600/12 rounded-full blur-3xl animate-float-reverse opacity-50" />
      <div
        className={`absolute inset-0 opacity-20 animate-grid-move ${
          theme === 'dark'
            ? 'bg-[radial-gradient(circle_at_1px_1px,_rgba(71,85,105,0.15)_1px,_transparent_0)]'
            : 'bg-[radial-gradient(circle_at_1px_1px,_rgba(156,163,175,0.2)_1px,_transparent_0)]'
        } bg-[length:32px_32px]`}
      />
    </div>
  );
}

function SkeletonCard() {
  return (
    <tr className="animate-pulse">
      <td className="p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      </td>
    </tr>
  );
}

function KpiCard({ title, value, icon, color }) {
  return (
    <div
      className={`${color} p-5 rounded-2xl shadow-lg flex items-center gap-4 transform transition-transform hover:scale-105`}
    >
      <div className="text-white text-2xl">{icon}</div>
      <div>
        <div className="text-white text-sm opacity-80">{title}</div>
        <div className="text-white text-3xl font-bold">{value}</div>
      </div>
    </div>
  );
}

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

function CarrosselVeiculos({ frota }) {
  if (!frota || frota.length === 0) {
    return null;
  }
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Garagem Virtual</h2>
      <Swiper
        effect={'coverflow'}
        grabCursor
        centeredSlides
        loop={frota.length > 2}
        slidesPerView={'auto'}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true
        }}
        pagination={{ clickable: true }}
        navigation
        modules={[EffectCoverflow, Pagination, Navigation]}
        className="mySwiper"
        style={{ paddingBottom: 32 }}
      >
        {frota.map((veiculo) => (
          <SwiperSlide key={veiculo.id} style={{ width: '320px', height: '220px' }}>
            <Link to={`/manutencao/veiculo/${veiculo.id}`} className="block h-full w-full">
              <div className="relative h-full w-full rounded-lg overflow-hidden group ring-2 ring-indigo-200 dark:ring-indigo-900">
                <img
                  src={veiculo.fotoUrl || 'https://via.placeholder.com/320x220?text=Sem+Foto'}
                  alt={`${veiculo.modelo} - ${veiculo.placa}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="font-bold text-lg text-shadow">{veiculo.modelo}</h3>
                  <p className="text-sm opacity-90 font-mono">{veiculo.placa}</p>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
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
    () =>
      frota.map((v) => {
        try {
          return processarVeiculo(v);
        } catch {
          return { ...v, statusGeral: 'Erro', itemMaisUrgente: null };
        }
      }),
    [frota]
  );

  const handleSearch = useCallback((val) => startTransition(() => setQueryText(val)), []);

  const filtered = useMemo(() => {
    const q = queryText.toLowerCase();
    return frotaProcessada.filter((v) => {
      if (filterStatus !== 'all' && v.statusGeral.toLowerCase() !== filterStatus) return false;
      if (!q) return true;
      return `${v.placa} ${v.modelo}`.toLowerCase().includes(q);
    });
  }, [frotaProcessada, queryText, filterStatus]);

  const stats = useMemo(() => {
    const total = frotaProcessada.length;
    const emDia = frotaProcessada.filter((v) => v.statusGeral === 'Em dia').length;
    const atento = frotaProcessada.filter((v) => v.statusGeral === 'Atenção').length;
    const atrasado = frotaProcessada.filter((v) => v.statusGeral === 'Atrasado').length;
    return { total, emDia, atento, atrasado };
  }, [frotaProcessada]);

  return (
    <div className="relative min-h-screen">
      <DynamicBackground />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* HEADER */}
          <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-extrabold">Gestão de Manutenção</h1>
              <p className="text-gray-600 dark:text-slate-400">Visão completa da sua frota</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <input
                  value={queryText}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Pesquisar..."
                  className="pl-10 pr-4 py-2 rounded-full border"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
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

          {/* KPIS */}
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

          {/* TABELA */}
          <div className="rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Frota Detalhada</h2>
              <button
                onClick={() => window.location.reload()}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <FiRefreshCw className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 dark:bg-slate-700">
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
                    ? filtered.map((v) => <VeiculoRow key={v.id} veiculo={v} />)
                    : (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-gray-500 dark:text-slate-400">
                          Nenhum veículo encontrado.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CARROSSEL */}
          <CarrosselVeiculos frota={frota} />
        </div>
      </div>
    </div>
  );
}
