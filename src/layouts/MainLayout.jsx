import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx'; // Importa o Header
import Sidebar from '../components/Sidebar.jsx';

// Função para obter o título da página com base na URL
const getPageTitle = (pathname) => {
  if (pathname.startsWith('/manutencao')) {
    return 'Dashboard de Manutenção';
  }
  if (pathname.startsWith('/entregas/controle')) {
    return 'Painel de Controle de Entregas';
  }
  if (pathname.startsWith('/entregas/operacao')) {
    return 'Operação de Entregas (Ao Vivo)';
  }
  if (pathname.startsWith('/entregas/historico')) {
    return 'Histórico de Jornadas';
  }
  if (pathname.startsWith('/entregas/jornada')) {
    return 'Análise da Jornada';
  }
  // Adicione outros títulos aqui conforme necessário
  return 'SmartLog'; // Título padrão
};

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation(); // Hook para obter a localização atual

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1">
        {/* O Header agora vive aqui, no layout principal */}
        <Header title={pageTitle} onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1">
          {/* O Outlet agora não precisa mais passar o context, 
              pois o Header já está aqui e controla o Sidebar. */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;