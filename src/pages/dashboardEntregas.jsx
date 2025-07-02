// src/pages/DashboardEntregas.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function DashboardEntregas() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <div className="p-10 bg-white rounded-lg shadow-xl text-center">
        <h1 className="text-4xl font-bold text-green-800">
          Dashboard de Entregas
        </h1>
        <p className="mt-2 text-gray-600">
          Área de rastreamento e otimização de rotas.
        </p>
        <div className="mt-8 p-4 border-l-4 border-green-500 bg-green-100 text-green-900">
          Conteúdo do dashboard de entregas virá aqui.
        </div>
        <Link 
          to="/" 
          className="mt-8 inline-block px-6 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700"
        >
          ← Voltar para a Seleção
        </Link>
      </div>
    </div>
  );
}

export default DashboardEntregas;