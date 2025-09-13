import React from 'react';
import { useAppContext } from '../context/AppContext';
import { FiMenu, FiSun, FiMoon } from 'react-icons/fi';

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

// O Header agora recebe 'onMenuClick' para abrir o Sidebar
function Header({ title, onMenuClick }) {
  const { user, logout } = useAppContext();

  return (
    <header className="sticky top-0 z-10 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:bg-slate-900/80 dark:border-b dark:border-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center space-x-4">
          
          {/* --- CORREÇÃO AQUI --- */}
          {/* A classe 'lg:hidden' foi REMOVIDA para que o botão apareça sempre */}
          <button 
            onClick={onMenuClick} 
            className="text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white"
            aria-label="Abrir menu"
          >
            <FiMenu size={24} />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="text-sm text-right">
            <p className="text-gray-600 dark:text-slate-400">Olá, {user?.email.split('@')[0]}</p>
            <button onClick={logout} className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400">Sair</button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;