// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import loginBg from '../assets/login-bg.jpg'; 
import { FiEye, FiEyeOff } from 'react-icons/fi';

function LoginPage() {
  // ... (toda a sua lógica de state e handleSubmit permanece a mesma) ...
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (login(email, password)) {
      navigate('/');
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      {/* Fundo Imersivo */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Adicionei 'text-brand-text' aqui para definir a cor padrão do texto dentro do formulário */}
        <form 
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-lg space-y-5 text-brand-text" 
        >
          {/* Cabeçalho */}
          <div className="text-center mb-6">
            {/* Adicionei 'text-brand-text' explicitamente */}
            <h1 className="text-3xl font-bold text-brand-text">Bem-vindo de volta</h1>
            <p className="mt-1 text-brand-subtext">Faça login para continuar</p>
          </div>
          
          {/* Input de E-mail */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-subtext mb-1">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // Adicionei text-brand-text para garantir a cor do texto digitado
              className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-peach"
              placeholder="seu.email@empresa.com"
              required
            />
          </div>
          
          {/* Input de Senha */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-brand-subtext mb-1">Senha</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // Adicionei text-brand-text aqui também
              className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-peach"
              placeholder="Digite sua senha"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-7 flex items-center pr-4 text-gray-400 hover:text-brand-peach"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <div className="text-right -mt-2">
              <a href="#" className="text-sm text-brand-subtext hover:text-brand-peach hover:underline">
                Esqueceu sua senha?
              </a>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          
          {/* Botão de Acessar */}
          <button
            type="submit"
            // Garanti text-white aqui para ser explícito
            className="w-full py-3 font-bold text-white bg-brand-peach rounded-lg hover:bg-brand-peach-dark active:scale-95 transition-all"
          >
            Acessar
          </button>

          {/* Link de Cadastro */}
          <p className="text-center text-sm text-brand-subtext pt-4">
            Não tem uma conta?{' '}
            <a href="#" className="font-semibold text-blue-600 hover:underline">
              Crie uma agora
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;