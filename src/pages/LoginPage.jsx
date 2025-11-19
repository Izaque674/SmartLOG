import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase-config.js';
import loginBg from '../assets/login-bg.jpg';
import { FiEye, FiEyeOff } from 'react-icons/fi';

import logoImage from '../assets/LOGO1.png';  

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');

    } catch (err) {
      console.error("Erro de autenticação:", err.code);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha inválidos.');
      } else {
        setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <form 
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-lg space-y-5 text-brand-text"
        >
          {/* --- A CORREÇÃO ESTÁ AQUI --- */}
          {/* O logo foi movido para DENTRO do formulário, no topo */}
          <div className="flex justify-center mb-6">
            <img src={logoImage} alt="Logo SmartLog" className="h-16 w-auto" /> 
            {/* Aumentei um pouco a altura para h-16, ajuste se necessário */}
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-brand-text">Bem-vindo de volta</h1>
            <p className="mt-1 text-brand-subtext">Faça login para continuar</p>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-subtext mb-1">E-mail</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-peach" placeholder="seu.email@empresa.com" required disabled={isLoading} />
          </div>
          
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-brand-subtext mb-1">Senha</label>
            <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-peach" placeholder="Digite sua senha" required disabled={isLoading} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-7 flex items-center pr-4 text-gray-400 hover:text-brand-peach" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <div className="text-right -mt-2">
            <a href="#" className="text-sm text-brand-subtext hover:text-brand-peach hover:underline">Esqueceu sua senha?</a>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          
          <button 
            type="submit" 
            className="w-full py-3 font-bold text-white bg-brand-peach rounded-lg hover:bg-brand-peach-dark active:scale-95 transition-all disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Acessando...' : 'Acessar'}
          </button>
          
          <p className="text-center text-sm text-brand-subtext pt-4">
            Não tem uma conta?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">Crie uma agora</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;