import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { useAppContext } from '../context/AppContext';
import { FiClock, FiDollarSign, FiArrowDownCircle, FiArrowUpCircle } from 'react-icons/fi';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { motion } from 'framer-motion';

// Função auxiliar para converter datas com segurança
function safeToDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

// Componente auxiliar para os novos KPIs, para manter o código limpo e organizado
function KpiItem({ label, value, icon, tooltip }) {
    return (
        <Tippy content={tooltip} placement="top" animation="shift-away">
            <motion.div 
                className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl flex items-center gap-4 transition-transform hover:scale-105 cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="p-3 bg-gray-200 dark:bg-slate-600 rounded-lg">
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
            </motion.div>
        </Tippy>
    );
}

// --- COMPONENTE PRINCIPAL ---
export default function PainelDeAnalise({ entregas = [] }) {
  const { theme } = useAppContext();
  const textColor = theme === 'dark' ? '#94a3b8' : '#6b7280';

  // --- LÓGICA DE PROCESSAMENTO DE DADOS ---

  // 1. Lógica para o Heatmap de Volume por Hora
  const heatmapSeries = useMemo(() => {
    const counts = {};
    entregas.forEach(e => {
      const d = safeToDate(e.createdAt);
      if (!d) return;
      const h = String(d.getHours()).padStart(2, '0');
      counts[h] = (counts[h] || 0) + 1;
    });
    const data = Object.entries(counts)
      .map(([h, c]) => ({ x: `${h}:00`, y: c }))
      .sort((a, b) => a.x.localeCompare(b.x));
    return [{ name: 'Tarefas', data }];
  }, [entregas]);

  // 2. Lógica para os KPIs Financeiros e Operacionais
  const kpis = useMemo(() => {
    const concluidas = entregas.filter(e => e.status === 'Concluída');
    
    const totalReceber = concluidas.reduce((sum, e) => sum + (e.valorCobrar || 0), 0);
    const totalEntregas = concluidas.filter(e => e.tipo === 'Entrega').length;
    const totalColetas = concluidas.filter(e => e.tipo === 'Coleta').length;
    
    const times = concluidas
      .map(e => {
        const i = safeToDate(e.createdAt);
        const f = safeToDate(e.updatedAt);
        return i && f ? (f.getTime() - i.getTime()) / 60000 : null;
      })
      .filter(v => v != null);
    
    const mediaTempo = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    
    return {
      totalReceber: `R$ ${totalReceber.toFixed(2).replace('.', ',')}`,
      totalEntregas,
      totalColetas,
      mediaTempo: `${mediaTempo} min`
    };
  }, [entregas]);

  // 3. Configurações para o Gráfico de Rosca (Donut Chart) de Entregas vs. Coletas
  const donutSeries = [kpis.totalEntregas, kpis.totalColetas];
  const donutOptions = {
    chart: { type: 'donut', background: 'transparent' },
    labels: ['Entregas', 'Coletas'],
    colors: ['#3B82F6', '#10B981'],
    dataLabels: { enabled: false },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      labels: { colors: textColor },
      markers: { width: 12, height: 12 },
    },
    plotOptions: { pie: { donut: { size: '70%' } } },
    tooltip: { y: { formatter: (val) => `${val} tarefas` } },
    stroke: { width: 4, colors: [theme === 'dark' ? '#1f2937' : '#ffffff'] },
  };

  // 4. Configurações para o Gráfico de Heatmap
  const heatmapOpts = {
    chart: { type: 'heatmap', toolbar: { show: false } },
    plotOptions: { heatmap: { radius: 6, enableShades: false, colorScale: {
      ranges: [
        { from: 0, to: 2, name: 'Baixo', color: '#6ee7b7' },
        { from: 3, to: 5, name: 'Médio', color: '#3b82f6' },
        { from: 6, to: 10, name: 'Alto', color: '#f59e0b' },
        { from: 11, to: 100, name: 'Crítico', color: '#ef4444' }
      ]
    }}},
    dataLabels: { enabled: true, style: { colors: ['#fff'] } },
    stroke: { width: 4, colors: [theme === 'dark' ? '#374151' : '#f9fafb'] },
    theme: { mode: theme },
    xaxis: { labels: { style: { colors: textColor } } },
    yaxis: { show: false },
    tooltip: { y: { formatter: val => `${val} tarefas` } },
    grid: { show: false }
  };

  // --- RENDERIZAÇÃO DO COMPONENTE ---
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Análise da Jornada
      </h3>

      {/* Seção Superior: Heatmap e Gráfico de Rosca */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-700 dark:text-slate-300 mb-2">Volume por Hora</h4>
          {heatmapSeries[0].data.length > 0 ? (
            <Chart options={heatmapOpts} series={heatmapSeries} type="heatmap" height={150} />
          ) : ( 
            <div className="h-[150px] flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
              Sem dados de volume para exibir.
            </div> 
          )}
        </div>

        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-700 dark:text-slate-300 mb-2">Fluxo de Tarefas</h4>
          {kpis.totalEntregas > 0 || kpis.totalColetas > 0 ? (
            <Chart options={donutOptions} series={donutSeries} type="donut" height={150} />
          ) : ( 
            <div className="h-[150px] flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
              Nenhuma tarefa concluída ainda.
            </div> 
          )}
        </div>
      </div>

      {/* Seção Inferior: KPIs Financeiros e de Eficiência */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiItem 
          label="A Receber (Concluído)" 
          value={kpis.totalReceber} 
          icon={<FiDollarSign className="h-6 w-6 text-emerald-500" />} 
          tooltip="Soma dos valores a cobrar de tarefas concluídas"
        />
        <KpiItem 
          label="Entregas Concluídas" 
          value={kpis.totalEntregas} 
          icon={<FiArrowUpCircle className="h-6 w-6 text-blue-500" />}
          tooltip="Total de tarefas do tipo 'Entrega' concluídas com sucesso"
        />
        <KpiItem 
          label="Coletas Concluídas" 
          value={kpis.totalColetas} 
          icon={<FiArrowDownCircle className="h-6 w-6 text-green-500" />}
          tooltip="Total de tarefas do tipo 'Coleta' concluídas com sucesso"
        />
        <KpiItem 
          label="Tempo Médio" 
          value={kpis.mediaTempo} 
          icon={<FiClock className="h-6 w-6 text-amber-500" />}
          tooltip="Tempo médio para concluir uma tarefa (entrega ou coleta)"
        />
      </div>
    </div>
  );
}