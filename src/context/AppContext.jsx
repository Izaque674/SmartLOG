import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase-config'; // Verifique se o caminho está correto
export const API_URL = 'http://localhost:3001/api';

// 1. Cria o Contexto
const AppContext = createContext();

// 2. Cria o Provedor


export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Controla o carregamento da autenticação

  // Efeito para monitorar o estado de autenticação do Firebase
  useEffect(() => {
    // onAuthStateChanged é o "ouvinte" que avisa se o usuário logou ou deslogou
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false); // Marca que a verificação inicial terminou
    });

    // Função de limpeza que é executada quando o componente é desmontado
    return () => unsubscribe();
  }, []); // O array vazio [] garante que este efeito rode apenas uma vez

  // Função de logout que usa o Firebase
  const logout = async () => {
    try {
      await signOut(auth);
      // O onAuthStateChanged irá detectar a mudança e atualizar o 'user' para null
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // O valor que será compartilhado com toda a aplicação
  const value = {
    user,
    logout,
    isLoading, // Compartilha o estado de loading para as rotas
  };

  // Não renderiza nada até que a verificação de autenticação esteja completa
  // Isso evita que as rotas tentem redirecionar antes da hora
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-600">Carregando SmartLog...</p>
      </div>
    );
  }
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// 3. Hook customizado para facilitar o uso do contexto
export function useAppContext() {
  return useContext(AppContext);
}