// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';

import './index.css';
import { AppProvider, useAppContext } from './context/AppContext.jsx';

import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SelectionPage from './pages/SelectionPage.jsx';
import DashboardEntregas from './pages/DashboardEntregas.jsx';
import DashboardManutencao from './pages/DashboardManutencao.jsx';
import AdicionarVeiculoPage from './pages/AdicionarVeiculoPage.jsx';
import PaginaInfoVeiculo from './pages/PaginaInfoVeiculo.jsx';

function ProtectedRoute() {
  const { user } = useAppContext();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { user } = useAppContext();
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
          { path: 'manutencao/dashboard', element: <DashboardManutencao /> },
          { path: 'manutencao/veiculo/:id', element: <PaginaInfoVeiculo /> },
          { path: 'manutencao/veiculos/novo', element: <AdicionarVeiculoPage /> },
          { path: 'entregas/dashboard', element: <DashboardEntregas /> },
        ],
      },
      {
        element: <PublicRoute />,
        children: [{ path: 'login', element: <LoginPage /> }],
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