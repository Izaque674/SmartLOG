import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { AppProvider, useAppContext } from './context/AppContext.jsx';
import { Toaster } from 'react-hot-toast';

// Layout
import MainLayout from './layouts/MainLayout.jsx';

// Páginas
import App from './App.jsx';
import LoginPage from './pages/loginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SelectionPage from './pages/selectionPage.jsx';

// Páginas de Manutenção
import DashboardManutencao from './pages/dashboardManutencao.jsx';
import AdicionarVeiculoPage from './pages/AdicionarVeiculoPage.jsx';
import PaginaInfoVeiculo from './pages/PaginaInfoVeiculo.jsx';

// Páginas de Entregas
import DashboardControleEntregas from './pages/DashboardEntregadores.jsx';
import DashboardOperacaoEntregas from './pages/DashboardEntregas.jsx';
import PaginaDetalhesJornada from './pages/PaginaDetalhesJornada.jsx';
import PaginaHistoricoJornadas from './pages/PaginaHistoricoJornadas.jsx';

function ProtectedRoute() {
  const { user, isLoading } = useAppContext();
  if (isLoading) return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { user, isLoading } = useAppContext();
  if (isLoading) return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  return !user ? <Outlet /> : <Navigate to="/" replace />;
}

function ThemeWrapper({ children }) {
  const { theme } = useAppContext();
  return <div className={theme === 'dark' ? 'dark' : ''}>{children}</div>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <SelectionPage /> },
          {
            element: <MainLayout />,
            children: [
              { path: 'manutencao/dashboard', element: <DashboardManutencao /> },
              { path: 'manutencao/veiculo/:id', element: <PaginaInfoVeiculo /> },
              { path: 'manutencao/veiculos/novo', element: <AdicionarVeiculoPage /> },
              { path: 'entregas/controle', element: <DashboardControleEntregas /> },
              { path: 'entregas/operacao', element: <DashboardOperacaoEntregas /> },
              { path: 'entregas/jornada/:jornadaId', element: <PaginaDetalhesJornada /> },
              { path: 'entregas/historico', element: <PaginaHistoricoJornadas /> },
            ]
          }
        ]
      },
      {
        element: <PublicRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      {/* Toaster global para feedback de CRUD */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <ThemeWrapper>
        <RouterProvider router={router} />
      </ThemeWrapper>
    </AppProvider>
  </React.StrictMode>
);
