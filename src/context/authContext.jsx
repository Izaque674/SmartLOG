// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

// 1. Criar o Contexto
const AuthContext = createContext(null);

// 2. Criar o Provedor do Contexto
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = deslogado, objeto = logado

  // Função para simular o login
  const login = (email, password) => {
    // !! AQUI IRÁ A LÓGICA REAL DE API NO FUTURO !!
    // Por enquanto, vamos aceitar qualquer login para testar o fluxo.
    console.log("Tentando logar com:", email);
    const userData = { email: email, name: "Gestor SmartLOG" };
    setUser(userData);
    return true; // Simula sucesso
  };

  // Função para deslogar
  const logout = () => {
    setUser(null);
  };

  // O valor que será compartilhado com toda a aplicação
  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Criar um hook customizado para facilitar o uso
export function useAuth() {
  return useContext(AuthContext);
}