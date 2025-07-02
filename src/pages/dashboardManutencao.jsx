// src/pages/DashboardManutencao.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function DashboardManutencao() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="p-10 bg-white rounded-lg shadow-xl text-center">
        <h1 className="text-4xl font-bold text-blue-800">
          Dashboard de Manutenção
        </h1>
        <p className="mt-2 text-gray-600">
          Área de gestão de frotas, peças e serviços.
        </p>
        <div className="mt-8 p-4 border-l-4 border-blue-500 bg-blue-100 text-blue-900">
          Conteúdo do dashboard de manutenção virá aqui.
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

export default DashboardManutencao;