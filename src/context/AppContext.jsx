import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

const AppContext = createContext(null);
export const API_URL = 'http://localhost:3001/api';

export function AppProvider({ children }) {
  // === ESTADOS GLOBAIS ===
  const [user, setUser] = useState(null);
  const [frota, setFrota] = useState([]);
  const [entregadores, setEntregadores] = useState([]);
  const [entregas, setEntregas] = useState([]);

  // === FUNÇÕES ===
  // (Note que as funções que modificam o estado permanecem aqui)
  
  const login = useCallback((email, password) => {
    const userData = { email, name: "Gestor SmartLOG" };
    setUser(userData);
    return true;
  }, []);

  const logout = useCallback(() => {
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
      // Atualiza o estado localmente após o sucesso
      setEntregas(entregasAtuais => [...entregasAtuais, entregaSalva]);
      return true;
    } catch (error) {
      console.error("Erro em adicionarNovaEntrega:", error);
      return false;
    }
  }, []);

  // === VALOR DO CONTEXTO MEMORIZADO ===
  // Exportamos os estados e as funções que os modificam, incluindo os setters.
  const value = useMemo(() => ({
    user,
    login,
    logout,
    frota,
    setFrota, // Exportando setters se outras partes precisarem
    entregadores,
    setEntregadores, // Exportando setter
    entregas,
    setEntregas, // Exportando setter
    adicionarNovaEntrega,
  }), [user, frota, entregadores, entregas]); // Dependências são apenas os estados

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}