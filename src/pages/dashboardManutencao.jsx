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
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors dark:text-white">
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
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Garagem Virtual</h2>
      
      {/* 
        # MUDANÇA 1: Adicionar uma div container com a classe 'relative'
        Isso é crucial para que possamos posicionar as flechas de navegação corretamente.
      */}
      <div className="relative">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          loop={frota.length > 3} // Loop funciona melhor com um número maior de slides
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{
            clickable: true,
            // # MUDANÇA 2: Classe para estilizar a paginação (as bolinhas)
            el: '.swiper-pagination-custom', 
          }}
          navigation={{
            // # MUDANÇA 3: Classes para estilizar as flechas
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          modules={[EffectCoverflow, Pagination, Navigation]}
          className="mySwiper" // Classe para o container principal da Swiper
        >
          {frota.map((veiculo) => (
            <SwiperSlide key={veiculo.id} style={{ width: '300px', height: '200px' }}>
              <Link to={`/manutencao/veiculo/${veiculo.id}`} className="block h-full w-full">
                <div className="relative h-full w-full rounded-lg overflow-hidden group shadow-lg">
                  <img
                    src={veiculo.fotoUrl || 'https://via.placeholder.com/300x200?text=Sem+Foto'}
                    alt={`${veiculo.modelo} - ${veiculo.placa}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="font-bold text-lg drop-shadow-md">{veiculo.modelo}</h3>
                    <p className="text-sm opacity-90 font-mono drop-shadow-md">{veiculo.placa}</p>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 
          # MUDANÇA 4: Os elementos customizados para a navegação e paginação
          A Swiper vai automaticamente usar estes divs para renderizar seus controles.
        */}
        <div className="swiper-pagination-custom text-center mt-4"></div>
        
        <div className="swiper-button-prev-custom absolute top-1/2 left-2 -translate-y-1/2 z-10 p-2 bg-white/50 dark:bg-black/50 rounded-full cursor-pointer hover:bg-white dark:hover:bg-black transition-colors">
          {/* Ícone de seta para a esquerda (exemplo) */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </div>
        <div className="swiper-button-next-custom absolute top-1/2 right-2 -translate-y-1/2 z-10 p-2 bg-white/50 dark:bg-black/50 rounded-full cursor-pointer hover:bg-white dark:hover:bg-black transition-colors">
          {/* Ícone de seta para a direita (exemplo) */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>
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

const removeDiacritics = str =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Helper: remove acentos e todos os espaços, deixa tudo minúsculo
const normalize = (str) =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // remove acentos
    .replace(/\s/g, "");               // remove TODOS espaços

const filtered = useMemo(() => {
  const q = normalize(queryText);       // busca sem acento/espaço/minúscula
  const filter = normalize(filterStatus);  // status selecionado pelo usuário

  return frotaProcessada.filter((v) => {
    const status = normalize(v.statusGeral);     // status real do veículo
    const placaModelo = normalize(`${v.placa} ${v.modelo}`); // busca por placa/modelo

    // Filtra por status (ignora caixa, acento, espaço)
    if (filter !== "all" && status !== filter) return false;

    // Filtra busca texto
    if (q && !placaModelo.includes(q)) return false;

    return true;
  });
}, [frotaProcessada, queryText, filterStatus]);

const stats = useMemo(() => {
  let total = frotaProcessada.length;
  let emDia = 0, atento = 0, atrasado = 0;

  frotaProcessada.forEach((v) => {
    const status = normalize(v.statusGeral);

    if (status === "emdia") emDia += 1;
    else if (status === "atencao") atento += 1;   // "atenção" sem cedilha
    else if (status === "atrasado") atrasado += 1;
  });

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
              <h1 className="text-4xl font-extrabold dark:text-white">Gestão de Manutenção</h1>
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
                className="rounded-full border px-4 py-2 "
              >
                <option value="all">Todos</option>
                <option value="em dia">Em dia</option>
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
              <h2 className="text-xl font-semibold dark:text-white">Frota Detalhada</h2>
              <button
                onClick={() => window.location.reload()}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <FiRefreshCw className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 dark:bg-slate-700 dark:text-white">
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
                        <td colSpan="5" className="p-6 text-center text-gray-500 dark:text-slate-400 dark:text-white">
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
