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
    <div className="relative min-h-screen bg-gray-900">

      {/* # MUDANÇA 1: Header com melhor posicionamento e estilo */}
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 sm:p-6 text-white">
        <div className="text-sm sm:text-base">
          Bem-vindo, <span className="font-bold">{user?.displayName || "Usuário"}</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-xs sm:text-sm font-semibold bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-lg"
        >
          Sair
        </button>
      </header>

      {/* 
        # MUDANÇA 2: A MÁGICA DA RESPONSIVIDADE
        - flex-col: Em telas pequenas (mobile), os itens são empilhados verticalmente (comportamento padrão).
        - md:flex-row: Em telas de tamanho 'medium' (768px) ou maiores, o layout muda para colunas lado a lado.
      */}
      <div className="flex flex-col md:flex-row h-screen">
        
        {/* 
          # MUDANÇA 3: Ajuste de altura e largura para o layout responsivo
          - h-1/2: Em mobile, cada link ocupa metade da altura da tela.
          - md:h-full: Em desktop, volta a ocupar a altura total.
          - md:w-1/2: Em desktop, ocupa metade da largura.
        */}
        <Link to="/manutencao/dashboard" className="w-full h-1/2 md:w-1/2 md:h-full relative group overflow-hidden">
          <img
            src={manutencaoImg}
            alt="Mecânico consertando um carro"
            className="absolute inset-0 w-full h-full object-cover filter brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-all duration-300"
          />
          <div className="relative z-10 flex items-center justify-center h-full bg-black/20 group-hover:bg-black/10 transition-colors duration-300">
            {/* # MUDANÇA 4: Conteúdo com melhor espaçamento e tamanho de texto responsivo */}
            <div className="w-11/12 sm:w-3/4 p-6 sm:p-8 rounded-xl text-center bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
              <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold drop-shadow-lg">
                Manutenção
              </h2>
              <p className="text-gray-200 text-base sm:text-lg mt-2 font-light drop-shadow-md">
                Gestão completa de frotas e serviços.
              </p>
            </div>
          </div>
        </Link>

        {/* --- LADO ENTREGAS --- (aplicamos as mesmas mudanças) */}
        <Link to="/entregas/controle" className="w-full h-1/2 md:w-1/2 md:h-full relative group overflow-hidden">
          <img
            src={entregasImg}
            alt="Pessoa entregando caixas"
            className="absolute inset-0 w-full h-full object-cover filter brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-all duration-300"
          />
          <div className="relative z-10 flex items-center justify-center h-full bg-black/20 group-hover:bg-black/10 transition-colors duration-300">
            <div className="w-11/12 sm:w-3/4 p-6 sm:p-8 rounded-xl text-center bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
              <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold drop-shadow-lg">
                Entregas
              </h2>
              <p className="text-gray-200 text-base sm:text-lg mt-2 font-light drop-shadow-md">
                Painel de controle e operações ao vivo.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default SelectionPage;