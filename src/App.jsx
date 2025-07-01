// src/App.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

function App() {
  // O App agora é só o container do roteador.
  // O <Outlet> renderizará a página correta: ou a de Seleção, ou a de Login.
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default App;