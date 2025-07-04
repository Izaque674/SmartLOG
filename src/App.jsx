// src/App.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';

function App() {
  // O App.jsx atua como um container para todas as nossas páginas.
  // O <Outlet /> é o lugar onde o React Router vai renderizar a página ativa (login, dashboard, etc.).
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default App;