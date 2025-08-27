import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

function PaginaDetalhesJornada() {
  const { jornadaId } = useParams(); // Pega o ID da jornada da URL

  // Por enquanto, esta página é apenas um placeholder.
  // No futuro, faremos uma chamada à API aqui para buscar os dados.
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm p-4 flex items-center space-x-4">
        <Link to="/entregas/controle" className="text-gray-500 hover:text-gray-800">
          <FiArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-800">Análise da Jornada</h1>
      </header>
      <main className="p-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Detalhes da Jornada</h2>
          <p>Analisando dados para a Jornada com ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{jornadaId}</span></p>
          <p className="mt-4 text-gray-600">(Em breve: Gráficos e tabelas com o desempenho de cada entregador...)</p>
        </div>
      </main>
    </div>
  );
}

export default PaginaDetalhesJornada;