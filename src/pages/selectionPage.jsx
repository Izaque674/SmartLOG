// src/pages/SelectionPage.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

// ATENÇÃO: Verifique se o nome e a extensão dos seus arquivos estão corretos.
// No seu exemplo, você usou .png.
import manutencaoImg from '../assets/manutencao.png';
import entregasImg from '../assets/entregas.png';

function SelectionPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative"> {/* Container relativo para o header */}

      {/* Header com informações do usuário e botão de sair */}
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-transparent text-white">
        <div>
          Bem-vindo, <span className="font-bold">{user?.email || 'Gestor'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-semibold bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          Sair
        </button>
      </header>

      {/* ======================================================= */}
      {/*         AQUI ENTRA O SEU CÓDIGO VISUAL EXATO          */}
      {/* ======================================================= */}
      <div className="flex h-screen bg-gray-900">
        
        {/* Lado Manutenção (Envolvido pelo Link) */}
        <Link to="/manutencao/dashboard" className="w-1/2 relative group overflow-hidden">
          {/* Camada da Imagem de Fundo */}
          <img
            src={manutencaoImg}
            alt="Mecânico consertando um carro"
            className="
              absolute inset-0 w-full h-full object-cover
              filter brightness-75 group-hover:brightness-100
              transition-all duration-300
            "
          />
          {/* O CARD */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div
              className="
                w-3/4 p-8 rounded-xl text-center
                bg-white/15 backdrop-blur-md
                border border-white/20
                group-hover:bg-white/25
                group-hover:scale-105
                transition-all duration-300
              "
            >
              <h2 className="text-white text-4xl lg:text-5xl font-bold drop-shadow-lg">
                Manutenção
              </h2>
              <p className="text-gray-200 text-lg mt-2 font-light drop-shadow-md">
                Gestão completa de frotas, peças e serviços mecânicos.
              </p>
            </div>
          </div>
        </Link>

        {/* Lado Entregas (Envolvido pelo Link) */}
        <Link to="/entregas/dashboard" className="w-1/2 relative group overflow-hidden">
          {/* Imagem de Fundo */}
          <img
            src={entregasImg}
            alt="Pessoa entregando caixas"
            className="
              absolute inset-0 w-full h-full object-cover
              filter brightness-30 group-hover:brightness-70
              transition-all duration-300
            "
          />
          {/* O CARD */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div
              className="
                w-3/4 p-8 rounded-xl text-center
                bg-white/15 backdrop-blur-md
                border border-white/20
                group-hover:bg-white/50
                group-hover:scale-105
                transition-all duration-300
              "
            >
              <h2 className="text-white text-4xl lg:text-5xl font-bold drop-shadow-lg">
                Entregas
              </h2>
              <p className="text-gray-200 text-lg mt-2 font-light drop-shadow-md">
                Rastreamento em tempo real, otimização de rotas e logística.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default SelectionPage;