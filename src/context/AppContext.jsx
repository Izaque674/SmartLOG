import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase-config';


export const API_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api' 
  : 'https://smartlogbackend.onrender.com/api';
const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- LÓGICA DO TEMA ---
  const [theme, setTheme] = useState(() => {
    // 1. Tenta ler do localStorage
    if (typeof window !== 'undefined' && localStorage.theme) {
      return localStorage.theme;
    }
    // 2. Se não, verifica a preferência do sistema operacional
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    // 3. O padrão é 'light'
    return 'light';
  });

  // Efeito que aplica a classe 'dark' ao <html> e salva a preferência
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove a classe antiga e adiciona a nova
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);

    // Salva a preferência no localStorage
    localStorage.setItem('theme', theme);
  }, [theme]); // Roda sempre que o estado 'theme' mudar

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const value = {
    user,
    logout,
    isLoading,
    theme,
    toggleTheme,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-slate-900">
        <p className="font-semibold text-gray-600 dark:text-slate-400">Carregando...</p>
      </div>
    );
  }
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}