import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Define as cores que usaremos para cada status
const COLORS = {
  Concluída: '#10B981', // Verde
  Falhou: '#EF4444',     // Vermelho
  'Em Trânsito': '#3B82F6' // Azul
};

function GraficoResumoPizza({ entregas }) {
  // Prepara os dados para o gráfico
  const data = React.useMemo(() => {
    if (!entregas || entregas.length === 0) return [];

    const statusCounts = {
      Concluída: 0,
      Falhou: 0,
      'Em Trânsito': 0
    };

    entregas.forEach(entrega => {
      if (statusCounts.hasOwnProperty(entrega.status)) {
        statusCounts[entrega.status]++;
      }
    });

    return Object.keys(statusCounts)
      .map(name => ({ name, value: statusCounts[name] }))
      .filter(entry => entry.value > 0); // Mostra apenas categorias com valor > 0

  }, [entregas]);
  
  if (data.length === 0) {
    return <div className="text-center text-gray-500">Sem dados para exibir o gráfico.</div>;
  }

  return (
    // ResponsiveContainer faz o gráfico se adaptar ao tamanho do contêiner pai
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          // Formata a legenda que aparece dentro da fatia
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip /> 
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default GraficoResumoPizza;


