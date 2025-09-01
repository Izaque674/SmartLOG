import React from 'react';
import { FiMenu } from 'react-icons/fi';

function Header({ title, onMenuClick }) {
  return (
    <header className="bg-white shadow-sm p-4 flex items-center space-x-4">
      <button onClick={onMenuClick} className="text-gray-500 hover:text-gray-800">
        <FiMenu size={24} />
      </button>
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
    </header>
  );
}

export default Header;