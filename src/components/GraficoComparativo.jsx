import React from 'react';
import { useMemo, useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { useAppContext } from '../context/AppContext';
import { ClockIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'; // Exemplo de ícones

// Função auxiliar (sem alterações)
function safeToDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

// Novo componente
export default function PainelProdutividade({ entregas = [], jornada = {} }) {
  const { theme } = useAppContext();
  const textColor = theme === 'dark' ? '#94a3b8' : '#6b7280';

  // --- LÓGICA PARA O HEATMAP (Lado Esquerdo) ---
  const heatmapSeries = useMemo(() => {
    // ... (a mesma lógica de `hourlyCounts` que já tínhamos) ...
    const hourlyCounts = {};
    entregas.forEach(entrega => {
      const date = safeToDate(entrega.createdAt);
      if (!date) return;
      const hour = String(date.getHours()).padStart(2, '0');
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });

    // A MUDANÇA ESTÁ AQUI: formatamos para um heatmap de uma única linha
    const seriesData = Object.entries(hourlyCounts).map(([hour, count]) => ({
      x: `${hour}:00`, // Hora no eixo X
      y: count        // Valor que define a cor
    }));

    // Ordena os dados para o eixo X ficar correto
    seriesData.sort((a, b) => a.x.localeCompare(b.x));

    return [{
      name: 'Entregas',
      data: seriesData
    }];

  }, [entregas]);

  // --- LÓGICA PARA OS KPIs DE TEMPO (Lado Direito) ---
  const kpisTempo = useMemo(() => {
    const tempos = [];
    entregas.forEach(entrega => {
      if (entrega.status === 'Concluída') {
        const inicio = safeToDate(entrega.createdAt);
        const fim = safeToDate(entrega.updatedAt);
        if (inicio && fim) {
          const diffMs = fim.getTime() - inicio.getTime();
          tempos.push(diffMs / (1000 * 60)); // Converte para minutos
        }
      }
    });

    if (tempos.length === 0) {
      return { media: 'N/A', melhor: 'N/A', pior: 'N/A' };
    }

    const media = Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length);
    const melhor = Math.round(Math.min(...tempos));
    const pior = Math.round(Math.max(...tempos));

    return { media: `${media} min`, melhor: `${melhor} min`, pior: `${pior} min` };
  }, [entregas]);


  const heatmapOptions = {
    // ... (opções do ApexCharts, mas ajustadas para o novo formato) ...
    chart: { type: 'heatmap', toolbar: { show: false } },
    plotOptions: { heatmap: { radius: 4, colorScale: {
      ranges: [
        { from: 0, to: 2, name: 'Baixo', color: '#00A100' },
        { from: 3, to: 5, name: 'Médio', color: '#128FD9' },
        { from: 6, to: 10, name: 'Alto', color: '#FFB200' },
        { from: 11, to: 100, name: 'Crítico', color: '#FF0000' }
      ]
    }}},
    dataLabels: { enabled: true },
    stroke: { width: 1 },
    theme: { mode: theme },
    xaxis: { labels: { style: { colors: textColor } }, type: 'category' },
    yaxis: { show: false }, // Esconde o eixo Y pois só temos uma linha
    tooltip: { y: { formatter: (val) => `${val} entregas` }}
  };


  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-md">
       <h3 className="font-semibold text-gray-800 dark:text-slate-200 mb-4 px-2">
          Análise de Produtividade da Jornada
        </h3>
      
      {/* Container GRID para dividir em 2 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* --- COLUNA ESQUERDA: HEATMAP --- */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-slate-300 mb-2">Volume por Hora</h4>
          {heatmapSeries[0].data.length > 0 ? (
            <Chart options={heatmapOptions} series={heatmapSeries} type="heatmap" height={150} />
          ) : (
            <div className="flex items-center justify-center h-[150px] text-gray-500 dark:text-slate-400">
              Sem dados de volume.
            </div>
          )}
        </div>

        {/* --- COLUNA DIREITA: KPIs DE TEMPO --- */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-slate-300 mb-2">Eficiência de Entrega</h4>
          <div className="space-y-3">
            {/* Card de Tempo Médio */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Tempo Médio</p>
                <p className="font-bold text-lg text-gray-800 dark:text-slate-200">{kpisTempo.media}</p>
              </div>
            </div>
             {/* Card de Melhor Tempo */}
             <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <ArrowUpIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Melhor Tempo</p>
                <p className="font-bold text-lg text-gray-800 dark:text-slate-200">{kpisTempo.melhor}</p>
              </div>
            </div>
             {/* Card de Pior Tempo */}
             <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <ArrowDownIcon className="h-6 w-6 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Pior Tempo</p>
                <p className="font-bold text-lg text-gray-800 dark:text-slate-200">{kpisTempo.pior}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}