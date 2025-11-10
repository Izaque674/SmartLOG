import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

import manutencaoImg from '../assets/manutencao.png';
import entregasImg from '../assets/entregas.png';


function SelectionPage() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative">

      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-transparent text-white">
        <div>
          Bem-vindo, <span className="font-bold">{user?.displayName || "Nome não disponível"}</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-semibold bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          Sair
        </button>
      </header>

      <div className="flex h-screen bg-gray-900">
        
        {/* Lado Manutenção (Link inalterado) */}
        <Link to="/manutencao/dashboard" className="w-1/2 relative group overflow-hidden">
          <img
            src={manutencaoImg}
            alt="Mecânico consertando um carro"
            className="absolute inset-0 w-full h-full object-cover filter brightness-75 group-hover:brightness-100 transition-all duration-300"
          />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="w-3/4 p-8 rounded-xl text-center bg-white/15 backdrop-blur-md border border-white/20 group-hover:bg-white/25 group-hover:scale-105 transition-all duration-300">
              <h2 className="text-white text-4xl lg:text-5xl font-bold drop-shadow-lg">
                Manutenção
              </h2>
              <p className="text-gray-200 text-lg mt-2 font-light drop-shadow-md">
                Gestão completa de frotas, peças e serviços mecânicos.
              </p>
            </div>
          </div>
        </Link>

        {/* --- LADO ENTREGAS CORRIGIDO --- */}
        {/* O 'to' agora aponta para a nova rota principal de entregas */}
        <Link to="/entregas/controle" className="w-1/2 relative group overflow-hidden">
          <img
            src={entregasImg}
            alt="Pessoa entregando caixas"
            className="absolute inset-0 w-full h-full object-cover filter brightness-75 group-hover:brightness-100 transition-all duration-300"
          />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="w-3/4 p-8 rounded-xl text-center bg-white/15 backdrop-blur-md border border-white/20 group-hover:bg-white/50 group-hover:scale-105 transition-all duration-300">
              <h2 className="text-white text-4xl lg:text-5xl font-bold drop-shadow-lg">
                Entregas
              </h2>
              <p className="text-gray-200 text-lg mt-2 font-light drop-shadow-md">
                Painel de controle, gestão de equipe e operações ao vivo.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default SelectionPage;