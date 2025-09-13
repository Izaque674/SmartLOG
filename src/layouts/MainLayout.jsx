import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';

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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* O container principal não precisa mais do padding condicional */}
      <div className="flex-1">
        <Header title={pageTitle} onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export default MainLayout;