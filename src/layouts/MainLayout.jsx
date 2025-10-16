import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { useAppContext } from '../context/AppContext.jsx';
import DynamicBackground from '../components/DynamicBackground.jsx'; // importa o background

const getPageTitle = (pathname) => {
  if (pathname.startsWith('/manutencao')) return 'Dashboard de Manutenção';
  if (pathname.startsWith('/entregas/controle')) return 'Painel de Controle de Entregas';
  if (pathname.startsWith('/entregas/operacao')) return 'Operação de Entregas (Ao Vivo)';
  if (pathname.startsWith('/entregas/historico')) return 'Histórico de Jornadas';
  if (pathname.startsWith('/entregas/jornada/')) return 'Análise da Jornada';
  if (pathname.startsWith('/manutencao/veiculo/')) return 'Detalhes do Veículo';
  return 'SmartLog';
};

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const { theme } = useAppContext();

  return (
    <div className="relative min-h-screen">
      <DynamicBackground />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 relative z-10">
        <Header title={pageTitle} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
