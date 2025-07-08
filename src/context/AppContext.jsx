import React, { createContext, useState, useContext } from 'react';
import { frotaInicial } from '../_data/frota';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
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
    setFrota(frotaAtual => [...frotaAtual, novoVeiculo]);
  };

  // FUNÇÃO PARA ATUALIZAR APENAS A QUILOMETRAGEM
  const atualizarVeiculoKm = (veiculoId, novaKm) => {
    setFrota(frotaAtual => 
      frotaAtual.map(veiculo => {
        if (veiculo.id === veiculoId) {
          return { ...veiculo, km_atual: novaKm };
        }
        return veiculo;
      })
    );
  };

  // FUNÇÃO PARA REGISTRAR UM SERVIÇO (RESETAR O CONTADOR)
  const registrarManutencaoRealizada = (veiculoId, itemId) => {
    setFrota(frotaAtual => 
      frotaAtual.map(veiculo => {
        if (veiculo.id === veiculoId) {
          const novosItens = veiculo.itensDeManutencao.map(item => {
            if (item.id === itemId) {
              return { ...item, km_ultima_revisao: veiculo.km_atual };
            }
            return item;
          });
          return { ...veiculo, itensDeManutencao: novosItens };
        }
        return veiculo;
      })
    );
  };

  // O valor que será compartilhado com toda a aplicação
  const value = {
    user,
    login,
    logout,
    frota,
    adicionarVeiculo,
    atualizarVeiculoKm, // <-- ADICIONADA
    registrarManutencaoRealizada, // <-- ADICIONADA
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}