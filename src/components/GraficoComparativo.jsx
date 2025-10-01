import React, { useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { useAppContext } from '../context/AppContext';
import { ClockIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

// Safe date
function safeToDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export default function PainelProdutividade({ entregas = [], jornada = {} }) {
  const { theme } = useAppContext();
  const textColor = theme === 'dark' ? '#94a3b8' : '#6b7280';

  // Heatmap data
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
    return [{ name: 'Entregas', data }];
  }, [entregas]);

  // Time KPIs
  const kpis = useMemo(() => {
    const times = entregas
      .filter(e => e.status === 'Concluída')
      .map(e => {
        const i = safeToDate(e.createdAt);
        const f = safeToDate(e.updatedAt);
        return i && f ? (f - i) / 60000 : null;
      })
      .filter(v => v != null);
    if (!times.length) return { media: '—', melhor: '—', pior: '—' };
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const min = Math.round(Math.min(...times));
    const max = Math.round(Math.max(...times));
    return { media: `${avg} min`, melhor: `${min} min`, pior: `${max} min` };
  }, [entregas]);

  // Heatmap options with hover highlight
  const heatmapOpts = {
    chart: { type: 'heatmap', toolbar: { show: false }, animations: { enabled: true, speed: 500 } },
    plotOptions: {
      heatmap: {
        radius: 6,
        enableShades: true,
        shadeIntensity: 0.4,
        colorScale: {
          ranges: [
            { from: 0, to: 1, color: '#d1fae5' },
            { from: 2, to: 3, color: '#a7f3d0' },
            { from: 4, to: 6, color: '#6ee7b7' },
            { from: 7, to: 10, color: '#10b981' }
          ]
        }
      }
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.3
        }
      }
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    theme: { mode: theme },
    xaxis: {
      labels: { style: { colors: textColor, fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { show: false },
    tooltip: { y: { formatter: val => `${val} entregas` } },
    grid: { padding: { top: 0, right: 0, bottom: 0, left: 0 } }
  };

  // KPI cards data
  const cards = [
    {
      label: 'Tempo Médio',
      value: kpis.media,
      icon: <ClockIcon className="h-6 w-6 text-blue-500" />,
      tooltip: 'Média do tempo de entrega em minutos',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Melhor Tempo',
      value: kpis.melhor,
      icon: <ArrowUpIcon className="h-6 w-6 text-green-500" />,
      tooltip: 'Melhor tempo registrado',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: 'Pior Tempo',
      value: kpis.pior,
      icon: <ArrowDownIcon className="h-6 w-6 text-red-500" />,
      tooltip: 'Maior tempo registrado',
      bg: 'bg-red-50 dark:bg-red-900/20'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Análise de Produtividade
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Heatmap */}
        <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl">
          <h4 className="text-gray-700 dark:text-slate-300 mb-2">Volume por Hora</h4>
          {heatmapSeries[0].data.length > 0 ? (
            <Chart options={heatmapOpts} series={heatmapSeries} type="heatmap" height={200} />
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 dark:text-slate-500">
              Sem dados de volume
            </div>
          )}
        </div>
        {/* KPI Cards Interativos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((c, idx) => (
            <Tippy key={idx} content={c.tooltip} placement="top">
              <div className={`${c.bg} p-4 rounded-xl flex flex-col items-center justify-center hover:scale-105 transition-transform`}>
                {c.icon}
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">{c.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{c.value}</p>
              </div>
            </Tippy>
          ))}
        </div>
      </div>
    </div>
  );
}
