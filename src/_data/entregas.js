export const entregadoresIniciais = [
  { id: 1, nome: 'João Silva', whatsapp: '+5511999991111' },
  { id: 2, nome: 'Maria Oliveira', whatsapp: '+5521999992222' },
  { id: 3, nome: 'Carlos Pereira', whatsapp: '+5531999993333' },
];

export const entregasIniciais = [
  { 
    id: 101, 
    cliente: 'Padaria Pão Quente', 
    endereco: 'Rua das Flores, 123', 
    pedido: 'Nº 5589',
    status: 'Pendente',
    entregadorId: null, // Ainda não atribuído
  },
  { 
    id: 102, 
    cliente: 'Mercado Preço Bom', 
    endereco: 'Avenida Principal, 789', 
    pedido: 'Nº 5590',
    status: 'Pendente',
    entregadorId: null,
  },
  { 
    id: 103, 
    cliente: 'Farmácia Saúde Já', 
    endereco: 'Praça da Matriz, 45', 
    pedido: 'Nº 5591',
    status: 'Em Trânsito',
    entregadorId: 1, // Já atribuído ao João
  },
  { 
    id: 104, 
    cliente: 'Loja de Roupas Estilo', 
    endereco: 'Rua do Comércio, 500', 
    pedido: 'Nº 5592',
    status: 'Concluída',
    entregadorId: 2, // Já foi entregue pela Maria
  },
];