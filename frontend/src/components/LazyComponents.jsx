import Spinner from './ui/Spinner';
import withLazyLoading from '../utils/withLazyLoading';

// Componentes lazy carregados com otimizações
export const LazyEnhancedDashboard = withLazyLoading(
  () => import('./dashboard/EnhancedDashboard'),
  <div className="flex items-center justify-center h-64">
    <Spinner />
    <span className="ml-3 text-gray-400">Carregando dashboard...</span>
  </div>
);

export const LazyImprovedTransactionList = withLazyLoading(
  () => import('./transactions/ImprovedTransactionList'),
  <div className="flex items-center justify-center h-64">
    <Spinner />
    <span className="ml-3 text-gray-400">Carregando transações...</span>
  </div>
);

export const LazyEnhancedSettings = withLazyLoading(
  () => import('./settings/EnhancedSettings'),
  <div className="flex items-center justify-center h-64">
    <Spinner />
    <span className="ml-3 text-gray-400">Carregando configurações...</span>
  </div>
);

export const LazyEnhancedBudgets = withLazyLoading(
  () => import('./settings/EnhancedBudgets'),
  <div className="flex items-center justify-center h-64">
    <Spinner />
    <span className="ml-3 text-gray-400">Carregando orçamentos...</span>
  </div>
);

export const LazyGroups = withLazyLoading(
  () => import('./groups/Groups'),
  <div className="flex items-center justify-center h-64">
    <Spinner />
    <span className="ml-3 text-gray-400">Carregando grupos...</span>
  </div>
);

export const LazyAdminDashboard = withLazyLoading(
  () => import('./dashboard/AdminDashboard'),
  <div className="flex items-center justify-center h-64">
    <Spinner />
    <span className="ml-3 text-gray-400">Carregando painel admin...</span>
  </div>
);

export const LazyFinancialHealth = withLazyLoading(
  () => import('./dashboard/FinancialHealth'),
  <div className="flex items-center justify-center h-64">
    <Spinner />
    <span className="ml-3 text-gray-400">Carregando saúde financeira...</span>
  </div>
);

export const LazyPerformanceDashboard = withLazyLoading(
  () => import('./dashboard/PerformanceDashboard'),
  <div className="flex items-center justify-center h-64">
    <Spinner />
    <span className="ml-3 text-gray-400">Carregando métricas de performance...</span>
  </div>
);

// Componentes de gráficos (mais pesados)
export const LazyExpenseChart = withLazyLoading(
  () => import('./charts/ExpenseChart'),
  <div className="flex items-center justify-center h-48">
    <Spinner />
    <span className="ml-3 text-gray-400">Carregando gráfico...</span>
  </div>
);

export const LazyBalanceChart = withLazyLoading(
  () => import('./charts/BalanceChart'),
  <div className="flex items-center justify-center h-48">
    <Spinner />
    <span className="ml-3 text-gray-400">Carregando gráfico...</span>
  </div>
);

// Componentes de formulários complexos
export const LazyCreateGroup = withLazyLoading(
  () => import('./groups/CreateGroup'),
  <div className="flex items-center justify-center h-64">
    <Spinner />
    <span className="ml-3 text-gray-400">Carregando formulário...</span>
  </div>
);

export const LazyGroupPage = withLazyLoading(
  () => import('./groups/GroupPage'),
  <div className="flex items-center justify-center h-64">
    <Spinner />
    <span className="ml-3 text-gray-400">Carregando página do grupo...</span>
  </div>
);