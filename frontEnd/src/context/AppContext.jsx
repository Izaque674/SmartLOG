import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AppContext = createContext(null);
export const API_URL = 'http://localhost:3001/api';

export function AppProvider({ children }) {
  // === ESTADOS GLOBAIS ===
  const [user, setUser] = useState(null);
  const [frota, setFrota] = useState([]);
  const [entregadores, setEntregadores] = useState([]);
  const [entregas, setEntregas] = useState([]);

  // === SINCRONIZAÇÃO COM FIREBASE AUTH ===
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // === FUNÇÕES ===
  const logout = useCallback(() => {
    signOut(auth);
    setUser(null);
  }, []);

  const adicionarNovaEntrega = useCallback(async (novaEntrega) => {
    try {
      const response = await fetch(`${API_URL}/entregas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaEntrega),
      });
      if (!response.ok) throw new Error('API Error');
      const entregaSalva = await response.json();
      setEntregas(entregasAtuais => [...entregasAtuais, entregaSalva]);
      return true;
    } catch (error) {
      console.error("Erro em adicionarNovaEntrega:", error);
      return false;
    }
  }, []);

  // === VALOR DO CONTEXTO MEMORIZADO ===
  const value = useMemo(() => ({
    user,
    logout,
    frota,
    setFrota,
    entregadores,
    setEntregadores,
    entregas,
    setEntregas,
    adicionarNovaEntrega,
  }), [user, frota, entregadores, entregas]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}