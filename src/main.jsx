import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';

import './index.css';
import { AppProvider, useAppContext } from './context/AppContext.jsx';

// Layout
import MainLayout from './layouts/MainLayout.jsx'; // 1. IMPORTAR O NOVO LAYOUT

// Páginas
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx'; // Corrigido para PascalCase
import RegisterPage from './pages/RegisterPage.jsx';
import SelectionPage from './pages/selectionPage.jsx';

// Páginas de Manutenção
import DashboardManutencao from './pages/dashboardManutencao.jsx'; // Corrigido para PascalCase
import AdicionarVeiculoPage from './pages/AdicionarVeiculoPage.jsx';
import PaginaInfoVeiculo from './pages/PaginaInfoVeiculo.jsx';

// Páginas de Entregas
import DashboardControleEntregas from './pages/DashboardEntregadores.jsx';
import DashboardOperacaoEntregas from './pages/DashboardEntregas.jsx';
import PaginaDetalhesJornada from './pages/PaginaDetalhesJornada.jsx';
import PaginaHistoricoJornadas from './pages/PaginaHistoricoJornadas.jsx';


function ProtectedRoute() {
  const { user, isLoading } = useAppContext();
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { user, isLoading } = useAppContext();
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }
  return !user ? <Outlet /> : <Navigate to="/" replace />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          // A Rota de Seleção fica fora do MainLayout
          { index: true, element: <SelectionPage /> },

          // 2. NOVO GRUPO DE ROTAS QUE USARÃO O LAYOUT COM SIDEBAR
          {
            element: <MainLayout />, // O MainLayout atua como "molde"
            children: [
              // Todas as rotas aqui dentro serão renderizadas dentro do MainLayout
              { path: 'manutencao/dashboard', element: <DashboardManutencao /> },
              { path: 'manutencao/veiculo/:id', element: <PaginaInfoVeiculo /> },
              { path: 'manutencao/veiculos/novo', element: <AdicionarVeiculoPage /> },
              
              { path: 'entregas/controle', element: <DashboardControleEntregas /> },
              { path: 'entregas/operacao', element: <DashboardOperacaoEntregas /> },
              { path: 'entregas/jornada/:jornadaId', element: <PaginaDetalhesJornada /> },
              { path: 'entregas/historico', element: <PaginaHistoricoJornadas /> },
            ]
          }
        ],
      },
      {
        element: <PublicRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </React.StrictMode>
);