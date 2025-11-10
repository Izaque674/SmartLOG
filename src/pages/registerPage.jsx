import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from '../firebase-config.js'; // Firestore importado aqui!
import loginBg from '../assets/login-bg.jpg';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nome || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: nome,
      });

      // Adição no Firestore
      await db.collection("usuarios")
        .doc(userCredential.user.uid)
        .set({
          nome,
          email,
          createdAt: new Date()
        });
      
      navigate('/');

    } catch (err) {
      console.error("Erro de registro:", err.code);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/invalid-email') {
        setError('O formato do e-mail é inválido.');
      } else {
        setError('Ocorreu um erro ao tentar criar a conta. Tente novamente.');
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
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-brand-text">Crie sua Conta</h1>
            <p className="mt-1 text-brand-subtext">Vamos começar</p>
          </div>
          
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-brand-subtext mb-1">Nome</label>
            <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-peach" placeholder="Seu nome completo" required disabled={isLoading} />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-subtext mb-1">E-mail</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-peach" placeholder="seu.email@empresa.com" required disabled={isLoading} />
          </div>
          
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-brand-subtext mb-1">Senha</label>
            <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-peach" placeholder="Mínimo 6 caracteres" required disabled={isLoading} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-7 flex items-center pr-4 text-gray-400 hover:text-brand-peach" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-subtext mb-1">Confirme sua Senha</label>
            <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-peach" placeholder="Digite a senha novamente" required disabled={isLoading} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 top-7 flex items-center pr-4 text-gray-400 hover:text-brand-peach" aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}>
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          
          <button 
            type="submit" 
            className="w-full py-3 font-bold text-white bg-brand-peach rounded-lg hover:bg-brand-peach-dark active:scale-95 transition-all disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Cadastrar'}
          </button>
          
          <p className="text-center text-sm text-brand-subtext pt-4">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">Faça login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
