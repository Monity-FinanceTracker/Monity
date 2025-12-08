/**
 * Demo Data Generator for Monity
 * Provides realistic financial data for unauthenticated users in view-only mode
 */

// Helper to get date X days ago
const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Generate demo user profile
export const generateDemoProfile = () => ({
  id: 'demo-user-id',
  name: 'Maria Silva',
  email: 'demo@monity.com',
  avatar: null,
  balance: 3250.00,
  monthlyIncome: 8500.00,
  monthlyExpenses: 5250.00,
  savingsRate: 38.24,
  subscriptionTier: 'free',
  createdAt: getDaysAgo(90), // 3 months ago
  isDemoMode: true
});

// Generate realistic transactions (last 30 days)
export const generateDemoTransactions = () => [
  // Recent expenses (last 7 days)
  {
    id: 'demo-tx-1',
    description: 'Supermercado Extra',
    category: 'Alimentação',
    amount: 287.50,
    date: getDaysAgo(1),
    typeId: 1, // Expense
    paymentMethod: 'Cartão de Crédito',
    notes: 'Compras do mês'
  },
  {
    id: 'demo-tx-2',
    description: 'Uber - Corrida Centro',
    category: 'Transporte',
    amount: 23.40,
    date: getDaysAgo(1),
    typeId: 1,
    paymentMethod: 'Débito',
    notes: null
  },
  {
    id: 'demo-tx-3',
    description: 'Salário - Empresa XYZ',
    category: 'Salário',
    amount: 8500.00,
    date: getDaysAgo(2),
    typeId: 2, // Income
    paymentMethod: 'Transferência',
    notes: 'Pagamento mensal'
  },
  {
    id: 'demo-tx-4',
    description: 'Netflix Assinatura',
    category: 'Entretenimento',
    amount: 55.90,
    date: getDaysAgo(3),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: 'Plano Premium'
  },
  {
    id: 'demo-tx-5',
    description: 'Restaurante - Jantar',
    category: 'Alimentação',
    amount: 145.00,
    date: getDaysAgo(3),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: 'Jantar com amigos'
  },
  {
    id: 'demo-tx-6',
    description: 'Farmácia São Paulo',
    category: 'Saúde',
    amount: 87.30,
    date: getDaysAgo(4),
    typeId: 1,
    paymentMethod: 'Débito',
    notes: 'Medicamentos'
  },
  {
    id: 'demo-tx-7',
    description: 'Conta de Luz - CEMIG',
    category: 'Moradia',
    amount: 189.45,
    date: getDaysAgo(5),
    typeId: 1,
    paymentMethod: 'Débito Automático',
    notes: null
  },
  {
    id: 'demo-tx-8',
    description: 'Gasolina - Posto Ipiranga',
    category: 'Transporte',
    amount: 250.00,
    date: getDaysAgo(6),
    typeId: 1,
    paymentMethod: 'Débito',
    notes: 'Tanque cheio'
  },

  // Week 2 transactions
  {
    id: 'demo-tx-9',
    description: 'Freelance - Projeto Design',
    category: 'Renda Extra',
    amount: 1200.00,
    date: getDaysAgo(9),
    typeId: 2,
    paymentMethod: 'PIX',
    notes: 'Cliente ABC'
  },
  {
    id: 'demo-tx-10',
    description: 'Padaria - Café da Manhã',
    category: 'Alimentação',
    amount: 18.50,
    date: getDaysAgo(10),
    typeId: 1,
    paymentMethod: 'Dinheiro',
    notes: null
  },
  {
    id: 'demo-tx-11',
    description: 'Academia - Mensalidade',
    category: 'Saúde',
    amount: 129.90,
    date: getDaysAgo(11),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: 'Plano mensal'
  },
  {
    id: 'demo-tx-12',
    description: 'Spotify Premium',
    category: 'Entretenimento',
    amount: 34.90,
    date: getDaysAgo(12),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: null
  },
  {
    id: 'demo-tx-13',
    description: 'Mercado - Frutas e Verduras',
    category: 'Alimentação',
    amount: 67.80,
    date: getDaysAgo(13),
    typeId: 1,
    paymentMethod: 'Débito',
    notes: null
  },
  {
    id: 'demo-tx-14',
    description: 'iFood - Almoço',
    category: 'Alimentação',
    amount: 42.00,
    date: getDaysAgo(14),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: null
  },

  // Week 3 transactions
  {
    id: 'demo-tx-15',
    description: 'Aluguel - Apartamento',
    category: 'Moradia',
    amount: 2100.00,
    date: getDaysAgo(15),
    typeId: 1,
    paymentMethod: 'Transferência',
    notes: 'Pagamento mensal'
  },
  {
    id: 'demo-tx-16',
    description: 'Livraria - Livros',
    category: 'Educação',
    amount: 89.90,
    date: getDaysAgo(16),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: '2 livros'
  },
  {
    id: 'demo-tx-17',
    description: 'Uber Eats - Jantar',
    category: 'Alimentação',
    amount: 58.00,
    date: getDaysAgo(17),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: null
  },
  {
    id: 'demo-tx-18',
    description: 'Internet - NET',
    category: 'Moradia',
    amount: 119.90,
    date: getDaysAgo(18),
    typeId: 1,
    paymentMethod: 'Débito Automático',
    notes: '200MB'
  },
  {
    id: 'demo-tx-19',
    description: 'Cinema - Ingressos',
    category: 'Entretenimento',
    amount: 76.00,
    date: getDaysAgo(19),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: '2 ingressos + pipoca'
  },
  {
    id: 'demo-tx-20',
    description: 'Supermercado - Compras',
    category: 'Alimentação',
    amount: 345.60,
    date: getDaysAgo(20),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: null
  },

  // Week 4 transactions
  {
    id: 'demo-tx-21',
    description: 'Celular - Vivo',
    category: 'Telecomunicações',
    amount: 89.90,
    date: getDaysAgo(21),
    typeId: 1,
    paymentMethod: 'Débito Automático',
    notes: 'Plano controle'
  },
  {
    id: 'demo-tx-22',
    description: 'Posto de Gasolina',
    category: 'Transporte',
    amount: 180.00,
    date: getDaysAgo(22),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: null
  },
  {
    id: 'demo-tx-23',
    description: 'Loja de Roupas',
    category: 'Vestuário',
    amount: 299.90,
    date: getDaysAgo(23),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: 'Camisa + calça'
  },
  {
    id: 'demo-tx-24',
    description: 'Conta de Água - SABESP',
    category: 'Moradia',
    amount: 78.50,
    date: getDaysAgo(24),
    typeId: 1,
    paymentMethod: 'Débito Automático',
    notes: null
  },
  {
    id: 'demo-tx-25',
    description: 'Restaurante - Almoço',
    category: 'Alimentação',
    amount: 65.00,
    date: getDaysAgo(25),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: 'Almoço executivo'
  },
  {
    id: 'demo-tx-26',
    description: 'Vendas Online - Mercado Livre',
    category: 'Renda Extra',
    amount: 450.00,
    date: getDaysAgo(26),
    typeId: 2,
    paymentMethod: 'PIX',
    notes: 'Venda de eletrônicos'
  },
  {
    id: 'demo-tx-27',
    description: 'Uber - Várias corridas',
    category: 'Transporte',
    amount: 67.80,
    date: getDaysAgo(27),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: null
  },
  {
    id: 'demo-tx-28',
    description: 'Padaria - Pães e Doces',
    category: 'Alimentação',
    amount: 32.50,
    date: getDaysAgo(28),
    typeId: 1,
    paymentMethod: 'Dinheiro',
    notes: null
  },
  {
    id: 'demo-tx-29',
    description: 'Dentista - Consulta',
    category: 'Saúde',
    amount: 250.00,
    date: getDaysAgo(29),
    typeId: 1,
    paymentMethod: 'Débito',
    notes: 'Limpeza + avaliação'
  },
  {
    id: 'demo-tx-30',
    description: 'App Store - Compra de apps',
    category: 'Tecnologia',
    amount: 49.90,
    date: getDaysAgo(30),
    typeId: 1,
    paymentMethod: 'Cartão de Crédito',
    notes: 'Assinatura anual'
  }
];

// Generate demo budgets
export const generateDemoBudgets = () => [
  {
    id: 'demo-budget-1',
    categoryId: 'cat-alimentacao',
    category: 'Alimentação',
    limit: 1500.00,
    spent: 1197.90, // 79.86%
    percentage: 79.86,
    remaining: 302.10,
    period: 'monthly',
    status: 'warning', // over 70%
    icon: '🍽️',
    color: '#F59E0B'
  },
  {
    id: 'demo-budget-2',
    categoryId: 'cat-transporte',
    category: 'Transporte',
    limit: 500.00,
    spent: 521.20, // 104.24%
    percentage: 104.24,
    remaining: -21.20,
    period: 'monthly',
    status: 'exceeded',
    icon: '🚗',
    color: '#EF4444'
  }
];

// Generate demo savings goals
export const generateDemoSavingsGoals = () => [
  {
    id: 'demo-goal-1',
    name: 'Viagem de Férias',
    targetAmount: 5000.00,
    currentAmount: 2800.00,
    percentage: 56.00,
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(), // 4 months from now
    category: 'Viagem',
    icon: '✈️',
    color: '#3B82F6',
    monthlyContribution: 550.00,
    onTrack: true
  }
];

// Generate demo group
export const generateDemoGroup = () => ({
  id: 'demo-group-1',
  name: 'Apartamento Compartilhado',
  description: 'Despesas compartilhadas do AP',
  members: [
    {
      id: 'demo-member-1',
      name: 'Maria Silva',
      email: 'maria@example.com',
      avatar: null,
      isOwner: true
    },
    {
      id: 'demo-member-2',
      name: 'João Santos',
      email: 'joao@example.com',
      avatar: null,
      isOwner: false
    },
    {
      id: 'demo-member-3',
      name: 'Ana Costa',
      email: 'ana@example.com',
      avatar: null,
      isOwner: false
    }
  ],
  totalExpenses: 850.00,
  yourShare: 283.33,
  expensesThisMonth: [
    {
      id: 'demo-group-exp-1',
      description: 'Aluguel',
      amount: 600.00,
      paidBy: 'demo-member-1',
      splitBetween: ['demo-member-1', 'demo-member-2', 'demo-member-3'],
      date: getDaysAgo(5)
    },
    {
      id: 'demo-group-exp-2',
      description: 'Conta de Luz',
      amount: 150.00,
      paidBy: 'demo-member-2',
      splitBetween: ['demo-member-1', 'demo-member-2', 'demo-member-3'],
      date: getDaysAgo(10)
    },
    {
      id: 'demo-group-exp-3',
      description: 'Internet',
      amount: 100.00,
      paidBy: 'demo-member-3',
      splitBetween: ['demo-member-1', 'demo-member-2', 'demo-member-3'],
      date: getDaysAgo(15)
    }
  ]
});

// Generate demo categories
export const generateDemoCategories = () => [
  { id: 'cat-alimentacao', name: 'Alimentação', icon: '🍽️', color: '#F59E0B', type: 1 },
  { id: 'cat-transporte', name: 'Transporte', icon: '🚗', color: '#3B82F6', type: 1 },
  { id: 'cat-moradia', name: 'Moradia', icon: '🏠', color: '#8B5CF6', type: 1 },
  { id: 'cat-saude', name: 'Saúde', icon: '🏥', color: '#10B981', type: 1 },
  { id: 'cat-entretenimento', name: 'Entretenimento', icon: '🎬', color: '#EC4899', type: 1 },
  { id: 'cat-educacao', name: 'Educação', icon: '📚', color: '#6366F1', type: 1 },
  { id: 'cat-vestuario', name: 'Vestuário', icon: '👔', color: '#14B8A6', type: 1 },
  { id: 'cat-tecnologia', name: 'Tecnologia', icon: '💻', color: '#06B6D4', type: 1 },
  { id: 'cat-salario', name: 'Salário', icon: '💰', color: '#22C55E', type: 2 },
  { id: 'cat-renda-extra', name: 'Renda Extra', icon: '💵', color: '#84CC16', type: 2 }
];

// Get expense chart data (last 6 months)
export const generateDemoExpenseChartData = () => {
  const months = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months.map((month) => ({
    month,
    expenses: 4500 + Math.random() * 1500, // R$ 4500-6000
    income: 8500 + Math.random() * 1000, // R$ 8500-9500
  }));
};

// Get balance chart data (last 12 months)
export const generateDemoBalanceChartData = () => {
  let balance = 1500;
  const data = [];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  months.forEach(month => {
    balance += (Math.random() * 600) - 200; // Random growth/decline
    data.push({
      month,
      balance: Math.max(balance, 0)
    });
  });

  return data;
};

// Generate complete demo data package
export const generateCompleteDemoData = () => ({
  profile: generateDemoProfile(),
  transactions: generateDemoTransactions(),
  budgets: generateDemoBudgets(),
  savingsGoals: generateDemoSavingsGoals(),
  group: generateDemoGroup(),
  categories: generateDemoCategories(),
  expenseChartData: generateDemoExpenseChartData(),
  balanceChartData: generateDemoBalanceChartData(),
  isDemoMode: true
});

// Check if user is in demo mode (based on localStorage or context)
export const isDemoMode = () => {
  return !localStorage.getItem('auth_token') && localStorage.getItem('demo_mode_active') === 'true';
};

// Activate demo mode
export const activateDemoMode = () => {
  localStorage.setItem('demo_mode_active', 'true');
};

// Deactivate demo mode (when user signs up/logs in)
export const deactivateDemoMode = () => {
  localStorage.removeItem('demo_mode_active');
};
