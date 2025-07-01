// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';

// Importe o CSS, o Provedor de Autenticação e as Páginas
import './index.css';
import { AuthProvider, useAuth } from './context/authContext';
import LoginPage from './pages/loginPage';
import SelectionPage from './pages/selectionPage';

// Componente "porteiro" para rotas protegidas
function ProtectedRoute() {
  const { user } = useAuth();

  // Se não há usuário, redireciona para a página de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se há usuário, permite o acesso à página solicitada (via Outlet)
  return <Outlet />;
}

// Configuração final das rotas
const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />, // "Porteiro" na rota principal
    children: [
      {
        index: true, // Rota padrão para '/', que agora é a página de seleção
        element: <SelectionPage />,
      },
      // Futuras rotas protegidas (ex: dashboards) iriam aqui
      // { path: 'manutencao/dashboard', element: <DashboardManutencao /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />, // Rota pública de login
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos tudo com o AuthProvider */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);