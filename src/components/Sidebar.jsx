import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  FiGrid, 
  FiTool, 
  FiTruck, 
  FiLogOut, 
  FiX, 
  FiChevronDown, 
  FiChevronUp,
  FiUsers,
  FiPackage,
  FiList,
  FiClock,
  FiPlusCircle
} from 'react-icons/fi';

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAppContext();
  const location = useLocation();
  
  // Estado para controlar quais menus estão abertos
  const [openMenus, setOpenMenus] = useState({});

  // Função para alternar submenu
  const toggleSubMenu = (menuKey) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // Configuração dos módulos e seus submenus
  const menuConfig = [
    {
      key: "home",
      icon: <FiGrid />,
      label: "Seleção de Módulos",
      to: "/",
      sub: null // Sem submenu
    },
    {
      key: "manutencao",
      icon: <FiTool />,
      label: "Manutenção",
      base: "/manutencao",
      sub: [
        { 
          to: "/manutencao/dashboard", 
          label: "Dashboard da Frota",
          icon: <FiGrid />
        },

        { 
          to: "/manutencao/veiculos/novo", 
          label: "Novo Veículo",
          icon: <FiPlusCircle />
        }
      ]
    },
    {
      key: "entregas",
      icon: <FiTruck />,
      label: "Entregas",
      base: "/entregas",
      sub: [
        { 
          to: "/entregas/controle", 
          label: "Painel de Controle",
          icon: <FiGrid />
        },
        { 
          to: "/entregas/operacao", 
          label: "Operação de Entregas",
          icon: <FiTruck />
        },
        { 
          to: "/entregas/historico", 
          label: "Histórico",
          icon: <FiClock />
        }
      ]
    },

  ];

  const linkBaseStyle = "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer";
  const linkActiveStyle = "bg-blue-600 text-white font-semibold";
  const subLinkStyle = "flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 text-sm hover:bg-gray-700 hover:text-white transition-colors";

  return (
    <>
      {/* Overlay escuro (agora ativo em todas as telas quando o menu está aberto) */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-60 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      
      {/* Conteúdo do Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">SmartLog</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        {/* Navegação principal */}
        <nav className="flex flex-col space-y-2 mb-20">
          {menuConfig.map(menu => (
            <div key={menu.key}>
              {/* Menu sem submenu (link direto) */}
              {!menu.sub ? (
                <Link
                  to={menu.to}
                  onClick={onClose}
                  className={`${linkBaseStyle} ${location.pathname === menu.to ? linkActiveStyle : ''}`}
                >
                  {menu.icon}
                  <span>{menu.label}</span>
                </Link>
              ) : (
                /* Menu com submenu (expansível) */
                <>
                  <button
                    className={`${linkBaseStyle} w-full justify-between ${location.pathname.startsWith(menu.base) ? linkActiveStyle : ''}`}
                    onClick={() => toggleSubMenu(menu.key)}
                  >
                    <span className="flex items-center space-x-3">
                      {menu.icon}
                      <span>{menu.label}</span>
                    </span>
                    {openMenus[menu.key] ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  
                  {/* Submenu items */}
                  {openMenus[menu.key] && (
                    <div className="ml-6 mt-1 flex flex-col space-y-1 border-l-2 border-gray-700 pl-2">
                      {menu.sub.map(subitem => (
                        <Link
                          key={subitem.to}
                          to={subitem.to}
                          className={`${subLinkStyle} ${location.pathname === subitem.to ? linkActiveStyle : ''}`}
                          onClick={onClose}
                        >
                          {subitem.icon}
                          <span>{subitem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Rodapé com informações do usuário e logout */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-700 bg-gray-800">
          <div className="text-sm mb-3">
            <p className="text-gray-400">Logado como:</p>
            <p className="font-semibold truncate">izaque</p>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center space-x-2 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
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