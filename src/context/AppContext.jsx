import React, { createContext, useState, useContext } from 'react';
import { frotaInicial } from '../_data/frota'; // Importamos os dados iniciais aqui

// 1. Criar o Contexto
const AppContext = createContext(null);

// 2. Criar o Provedor do Contexto
export function AppProvider({ children }) {
  // Estado para autenticação
  const [user, setUser] = useState(null);
  
  // Estado para os dados da frota - A FONTE DA VERDADE!
  const [frota, setFrota] = useState(frotaInicial);

  // --- Funções de Autenticação ---
  const login = (email, password) => {
    const userData = { email: email, name: "Gestor SmartLOG" };
    setUser(userData);
    return true;
  };
  const logout = () => {
    setUser(null);
  };

  // --- Funções de Gerenciamento da Frota ---
  const adicionarVeiculo = (novoVeiculo) => {
    // Adiciona o novo veículo ao estado global
    setFrota(frotaAtual => [...frotaAtual, novoVeiculo]);
  };

  // Futuramente, podemos adicionar:
  // const atualizarVeiculoKm = (veiculoId, novaKm) => { ... }
  // const registrarManutencaoItem = (veiculoId, itemId) => { ... }

  // O valor que será compartilhado com toda a aplicação
  const value = {
    user,
    login,
    logout,
    frota, // Compartilha a lista de frota
    adicionarVeiculo, // Compartilha a função para adicionar
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// 3. Criar um hook customizado para facilitar o uso
export function useAppContext() {
  return useContext(AppContext);
}