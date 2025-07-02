// src/App.jsx

import React from 'react';

// Vamos ignorar o Outlet e o roteador por um momento para este teste.
function App() {
  return (
    // Se o Tailwind estiver funcionando, este texto
    // deverá aparecer enorme, vermelho e centralizado na tela.
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <h1 className="text-6xl font-bold text-red-500">
        TAILWIND TESTE
      </h1>
    </div>
  );
}

export default App;