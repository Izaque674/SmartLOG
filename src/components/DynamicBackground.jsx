import React from 'react';
import { useAppContext } from '../context/AppContext.jsx';

// #MUDANÇA 1: Componente Orb separado para um código mais limpo e melhor performance.
// A propriedade 'will-change-transform' é uma dica para o navegador otimizar a animação.
const Orb = ({ className }) => (
  <div
    className={`absolute rounded-full blur-3xl transition-colors duration-1000 ${className}`}
    style={{ willChange: 'transform' }} 
  />
);

export default function DynamicBackground() {
  const { theme } = useAppContext();

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-white dark:bg-slate-900">
      
      {/* #MUDANÇA 2: Gradiente de base agora usa transição de cor suave. */}
      {/* O gradiente foi simplificado para ser mais sutil. */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 opacity-100'
            : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50 opacity-100'
        }`}
      />

      {/* #MUDANÇA 3: Orbes com posições e tamanhos ajustados para melhor composição. */}
      {/* Usamos porcentagens e vw/vh para responsividade. As animações são mais lentas. */}
      <Orb
        className={`top-[10%] left-[5%] w-[30vw] h-[30vw] animate-float ${
          theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-300/30'
        }`}
      />
      <Orb
        className={`bottom-[5%] right-[10%] w-[40vw] h-[40vw] animate-float-reverse ${
          theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-300/20'
        }`}
      />
       <Orb
        className={`top-[5%] right-[25%] w-[20vw] h-[20vw] animate-pulse-slow ${
          theme === 'dark' ? 'bg-sky-500/8' : 'bg-sky-300/25'
        }`}
      />

      {/* #MUDANÇA 4: Padrão de grid sutil (em vez de pontos) */}
      {/* A animação 'grid-move' dá uma sensação de profundidade e movimento lento. */}
      <div
        className={`absolute inset-0 bg-[length:40px_40px] transition-opacity duration-1000 animate-grid-move ${
          theme === 'dark'
            ? 'bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] opacity-100'
            : 'bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] opacity-100'
        }`}
      />
    </div>
  );
}