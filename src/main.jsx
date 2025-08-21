import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';

import './index.css';
import { AppProvider, useAppContext } from './context/AppContext.jsx';

// Páginas
import App from './App.jsx';
import LoginPage from './pages/loginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SelectionPage from './pages/SelectionPage.jsx';

// Páginas de Manutenção
import DashboardManutencao from './pages/DashboardManutencao.jsx';
import AdicionarVeiculoPage from './pages/AdicionarVeiculoPage.jsx';
import PaginaInfoVeiculo from './pages/PaginaInfoVeiculo.jsx';

// Páginas de Entregas (com os novos nomes para clareza)
import DashboardControleEntregas from './pages/DashboardEntregadores.jsx'; // A página de controle/gestão
import DashboardOperacaoEntregas from './pages/DashboardEntregas.jsx';    // A página do Kanban (operação)


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
          { index: true, element: <SelectionPage /> },
          // Rotas de Manutenção
          { path: 'manutencao/dashboard', element: <DashboardManutencao /> },
          { path: 'manutencao/veiculo/:id', element: <PaginaInfoVeiculo /> },
          { path: 'manutencao/veiculos/novo', element: <AdicionarVeiculoPage /> },
          
          // --- ROTAS DE ENTREGAS ATUALIZADAS ---
          // A rota principal agora é o painel de controle
          { path: 'entregas/controle', element: <DashboardControleEntregas /> },
          // A rota para a operação ao vivo (Kanban)
          { path: 'entregas/operacao', element: <DashboardOperacaoEntregas /> },
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