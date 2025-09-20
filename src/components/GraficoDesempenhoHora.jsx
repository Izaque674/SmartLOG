import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAppContext } from '../context/AppContext';

function GraficoDesempenhoHora({ entregas, jornada }) {
  const { theme } = useAppContext();
  const textColor = theme === 'dark' ? '#94a3b8' : '#666';

  const data = React.useMemo(() => {
    if (!entregas || !jornada.dataInicio) return [];
    
    const startDate = new Date(jornada.dataInicio);
    const endDate = jornada.dataFim ? new Date(jornada.dataFim) : new Date();
    const startHour = startDate.getHours();
    let endHour = endDate.getHours();
    
    if (startHour >= endHour) {
      if(new Date().getDate() !== startDate.getDate()) endHour = 23;
      else endHour = startHour + 1;
    }

    const hourlyData = {};
    for (let i = startHour; i <= endHour; i++) {
      const key = `${String(i).padStart(2, '0')}:00`;
      hourlyData[key] = { name: key, criadas: 0, concluidas: 0, horarioConclusao: null };
    }
    
    let criadasAcumulado = 0;
    let concluidasAcumulado = 0;

    entregas.forEach(entrega => {
      if (entrega.createdAt) {
        const createDate = new Date(entrega.createdAt);
        const hour = createDate.getHours();
        const key = `${String(hour).padStart(2, '0')}:00`;
        if (hourlyData[key]) hourlyData[key].criadas++;
      }
      if (entrega.status === 'Concluída' && entrega.updatedAt) {
        const updateDate = new Date(entrega.updatedAt);
        const hour = updateDate.getHours();
        const key = `${String(hour).padStart(2, '0')}:00`;
        if (hourlyData[key]) {
          hourlyData[key].concluidas++;
          hourlyData[key].horarioConclusao = updateDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }
      }
    });

    const result = [];
    for (const key in hourlyData) {
      criadasAcumulado += hourlyData[key].criadas;
      concluidasAcumulado += hourlyData[key].concluidas;
      result.push({
        name: key,
        criadas: criadasAcumulado,
        concluidas: concluidasAcumulado,
        horarioConclusao: hourlyData[key].horarioConclusao
      });
    }
    return result;

  }, [entregas, jornada]);

  // --- FUNÇÃO CUSTOMIZADA PARA RENDERIZAR O RÓTULO (COM VERIFICAÇÃO EXTRA) ---
  const renderCustomizedLabel = (props) => {
    const { x, y, payload } = props;
    
    // --- CORREÇÃO AQUI: Garante que 'payload' e 'horarioConclusao' existam ---
    if (payload && payload.horarioConclusao) {
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={-12} textAnchor="middle" fill={textColor} fontSize={12} fontWeight="bold">
            {payload.horarioConclusao}
          </text>
        </g>
      );
    }
    
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
        <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
        <YAxis tick={{ fill: textColor, fontSize: 12 }} allowDecimals={false} domain={[0, 'dataMax + 1']} />
        <Tooltip
          contentStyle={{
            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: theme === 'dark' ? '#334155' : '#ccc',
            borderRadius: '0.5rem'
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }}/>
        
        <Line 
          type="monotone" 
          dataKey="concluidas" 
          name="Entregas Concluídas" 
          stroke="#10B981"
          strokeWidth={3}
          dot={{ strokeWidth: 2, r: 5, fill: '#10B981' }}
          activeDot={{ r: 8, stroke: theme === 'dark' ? '#000' : '#fff' }}
          label={renderCustomizedLabel}
        />

      </LineChart>
    </ResponsiveContainer>
  );
}

export default GraficoDesempenhoHora;