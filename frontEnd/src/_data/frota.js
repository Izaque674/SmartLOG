export const frotaInicial = [
  {
    id: 1,
    placa: 'ABC-1234',
    modelo: 'Mercedes-Benz Actros',
    ano: 2021,
    km_atual: 87500,
    itensDeManutencao: [
      { id: 'oleo', nome: 'Troca de Óleo e Filtros', intervalo_km: 10000, km_ultima_revisao: 80000 },
      { id: 'freios', nome: 'Revisão do Sistema de Freios', intervalo_km: 40000, km_ultima_revisao: 60000 },
      { id: 'pneus', nome: 'Troca de Pneus', intervalo_km: 80000, km_ultima_revisao: 80000 },
    ]
  },
  {
    id: 2,
    placa: 'DEF-5678',
    modelo: 'Volvo FH 540',
    ano: 2022,
    km_atual: 62000,
    itensDeManutencao: [
      { id: 'oleo', nome: 'Troca de Óleo e Filtros', intervalo_km: 10000, km_ultima_revisao: 60000 },
      { id: 'freios', nome: 'Revisão do Sistema de Freios', intervalo_km: 40000, km_ultima_revisao: 40000 },
      { id: 'pneus', nome: 'Troca de Pneus', intervalo_km: 80000, km_ultima_revisao: 0 }, // Pneus originais
    ]
  },
  {
    id: 3,
    placa: 'GHI-9012',
    modelo: 'Scania R450',
    ano: 2020,
    km_atual: 101300,
    itensDeManutencao: [
      { id: 'oleo', nome: 'Troca de Óleo e Filtros', intervalo_km: 10000, km_ultima_revisao: 90000 },
      { id: 'freios', nome: 'Revisão do Sistema de Freios', intervalo_km: 40000, km_ultima_revisao: 80000 },
      { id: 'pneus', nome: 'Troca de Pneus', intervalo_km: 80000, km_ultima_revisao: 80000 },
    ]
  },
  {
    id: 4,
    placa: 'JKL-3456',
    modelo: 'DAF XF',
    ano: 2022,
    km_atual: 45000,
    itensDeManutencao: [
      { id: 'oleo', nome: 'Troca de Óleo e Filtros', intervalo_km: 15000, km_ultima_revisao: 38000 }, // Intervalo maior
      { id: 'freios', nome: 'Revisão do Sistema de Freios', intervalo_km: 50000, km_ultima_revisao: 0 },
      { id: 'pneus', nome: 'Troca de Pneus', intervalo_km: 90000, km_ultima_revisao: 0 },
    ]
  },
];