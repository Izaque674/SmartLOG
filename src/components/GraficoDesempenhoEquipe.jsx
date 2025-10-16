// src/components/GraficoDesempenhoEquipe.jsx

import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { useAppContext } from '../context/AppContext';

function GraficoDesempenhoEquipe({ entregadores = [], entregas = [] }) {
  const { theme } = useAppContext();
  const textColor = theme === 'dark' ? '#94a3b8' : '#6b7280';

  const dadosGrafico = useMemo(() => {
    const data = entregadores.map(entregador => {
      const entregasDoEntregador = entregas.filter(e => e.entregadorId === entregador.id);
      const concluidas = entregasDoEntregador.filter(e => e.status === 'Concluída').length;
      const falhas = entregasDoEntregador.filter(e => e.status === 'Falhou').length;
      return {
        nome: entregador.nome,
        concluidas,
        falhas,
      };
    });
    // Ordena do que tem mais concluídas para o que tem menos
    return data.sort((a, b) => b.concluidas - a.concluidas);
  }, [entregadores, entregas]);

  const series = [
    { name: 'Concluídas', data: dadosGrafico.map(d => d.concluidas), color: '#10B981' },
    { name: 'Falhas', data: dadosGrafico.map(d => d.falhas), color: '#EF4444' },
  ];

  const options = {
    chart: { type: 'bar', height: 350, stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    stroke: { width: 1, colors: [theme === 'dark' ? '#1f2937' : '#fff'] },
    xaxis: {
      categories: dadosGrafico.map(d => d.nome),
      labels: { style: { colors: textColor } },
    },
    yaxis: { labels: { style: { colors: textColor } } },
    tooltip: { y: { formatter: (val) => val.toLocaleString() } },
    dataLabels: { enabled: true, formatter: (val) => val > 0 ? val : '' },
    legend: { position: 'top', horizontalAlign: 'center', labels: { colors: textColor } },
    grid: { borderColor: theme === 'dark' ? '#374151' : '#e5e7eb', xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    theme: { mode: theme },
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Desempenho da Equipe</h2>
      {dadosGrafico.length > 0 ? (
        <Chart options={options} series={series} type="bar" height={dadosGrafico.length * 50 + 50} /> // Altura dinâmica
      ) : (
        <div className="h-48 flex items-center justify-center text-gray-400 dark:text-slate-500">
          Aguardando dados de desempenho...
        </div>
      )}
    </div>
  );
}

export default GraficoDesempenhoEquipe;