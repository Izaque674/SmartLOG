import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { FiMenu, FiSun, FiMoon } from 'react-icons/fi';

// Importar os logos para claro e escuro
import logoLight from '../assets/LOGO1.png';
import logoDark from '../assets/LOGO2.png';

// Componente interno para o botão de tema
function ThemeToggle() {
  const { theme, toggleTheme } = useAppContext();
  return (
    <button
      onClick={toggleTheme}
      className="rounded-full bg-gray-200 p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
      aria-label={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      {theme === 'light' ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5" />}
    </button>
  );
}

function Header({ title, onMenuClick }) {
  const { user, logout, theme } = useAppContext(); // pegar o theme do contexto

  return (
    <header className="sticky top-0 z-10 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:bg-slate-900/80 dark:border-b dark:border-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        {/* --- Bloco da Esquerda --- */}
        <div className="flex flex-1 items-center space-x-4">
          <button 
            onClick={onMenuClick} 
            className="text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white"
            aria-label="Abrir menu"
          >
            <FiMenu size={24} />
          </button>
          <h1 className="hidden sm:block text-xl font-semibold text-gray-800 dark:text-white">{title}</h1>
        </div>

        {/* --- Logo --- */}
        <div className="flex-shrink-0">
          <Link to="/">
            <img
              src={theme === 'light' ? logoLight : logoDark}
              alt="Logo SmartLog"
              className="h-14 w-auto"
            />
          </Link>
        </div>
        
        {/* --- Bloco da Direita --- */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          <div className="text-sm text-right">
            <p className="text-gray-600 dark:text-slate-400">{user?.displayName || "Nome não disponível"}</p>
            <button onClick={logout} className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400">
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
