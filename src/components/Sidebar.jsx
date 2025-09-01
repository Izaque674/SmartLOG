import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { FiGrid, FiTool, FiTruck, FiLogOut, FiX } from 'react-icons/fi';

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAppContext();
  const location = useLocation(); // Hook para saber a página atual

  // Estilo base para os links
  const linkStyle = "flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-200 hover:bg-gray-700";
  // Estilo para o link da página ativa
  const activeLinkStyle = "bg-blue-600 text-white";

  return (
    <>
      {/* Overlay escuro que aparece atrás do menu */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      
      {/* Conteúdo do Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Cabeçalho do Sidebar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">SmartLog</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="flex flex-col space-y-2">
          <Link to="/" className={`${linkStyle} ${location.pathname === '/' ? activeLinkStyle : ''}`}>
            <FiGrid />
            <span>Seleção de Módulos</span>
          </Link>
          <Link to="/manutencao/dashboard" className={`${linkStyle} ${location.pathname.startsWith('/manutencao') ? activeLinkStyle : ''}`}>
            <FiTool />
            <span>Manutenção</span>
          </Link>
          <Link to="/entregas/controle" className={`${linkStyle} ${location.pathname.startsWith('/entregas') ? activeLinkStyle : ''}`}>
            <FiTruck />
            <span>Entregas</span>
          </Link>
        </nav>

        {/* Rodapé com Informações do Usuário e Logout */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-700">
          <div className="text-sm mb-3">
            <p className="text-gray-400">Logado como:</p>
            <p className="font-semibold truncate">{user?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-red-600 rounded-lg hover:bg-red-700"
          >
            <FiLogOut />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;