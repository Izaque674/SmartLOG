import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext(null);
export const API_URL = 'http://localhost:3001/api'; // Exportando a URL para ser usada em outros lugares

export function AppProvider({ children }) {
  // === ESTADOS GLOBAIS ===
  const [user, setUser] = useState(null);
  const [frota, setFrota] = useState([]); // Começa vazio
  const [entregadores, setEntregadores] = useState([]); // Começa vazio
  const [entregas, setEntregas] = useState([]); // Começa vazio

  // === FUNÇÕES DE AUTENTICAÇÃO ===
  const login = (email, password) => {
    // Lógica de login simples. Em um app real, isso faria uma chamada de API.
    const userData = { email: email, name: "Gestor SmartLOG" };
    setUser(userData);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  // === FUNÇÕES DE DADOS ===

  // Esta função será chamada pelos dashboards para popular o estado inicial.
  const loadInitialData = async () => {
    try {
      const response = await fetch(`${API_URL}/dados`);
      if (!response.ok) throw new Error('Falha ao buscar dados do backend');
      const data = await response.json();
      
      setEntregas(data.entregas || []);
      setEntregadores(data.entregadores || []);
      // Futuramente: setFrota(data.frota || []);
      
      return true; // Indica sucesso
    } catch (error) {
      console.error("Erro em loadInitialData:", error);
      return false; // Indica falha
    }
  };

  const adicionarNovaEntrega = async (novaEntrega) => {
    try {
      const response = await fetch(`${API_URL}/entregas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaEntrega),
      });
      if (!response.ok) throw new Error('Falha na resposta da API ao adicionar entrega');
      
      const entregaSalva = await response.json();
      // Adiciona a nova entrega ao estado local para atualização da UI
      setEntregas(entregasAtuais => [...entregasAtuais, entregaSalva]);
      return true;
    } catch (error) {
      console.error("Erro em adicionarNovaEntrega:", error);
      return false;
    }
  };

  // Adicionando as funções de manutenção de frota de volta
  const adicionarVeiculo = (novoVeiculo) => {
    setFrota(frotaAtual => [...frotaAtual, novoVeiculo]);
  };

  const atualizarVeiculoKm = (veiculoId, novaKm) => {
    setFrota(frotaAtual => 
      frotaAtual.map(v => v.id === veiculoId ? { ...v, km_atual: novaKm } : v)
    );
  };

  const registrarManutencaoRealizada = (veiculoId, itemId) => {
    setFrota(frotaAtual => 
      frotaAtual.map(v => {
        if (v.id === veiculoId) {
          const novosItens = v.itensDeManutencao.map(item => 
            item.id === itemId ? { ...item, km_ultima_revisao: v.km_atual } : item
          );
          return { ...v, itensDeManutencao: novosItens };
        }
        return v;
      })
    );
  };

  // === VALOR COMPARTILHADO ===
  const value = {
    user,
    login,
    logout,
    frota,
    entregadores,
    entregas,
    loadInitialData,
    adicionarNovaEntrega,
    adicionarVeiculo,
    atualizarVeiculoKm,
    registrarManutencaoRealizada,
    // Adicione outras funções aqui conforme necessário
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}