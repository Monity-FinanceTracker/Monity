import React, { Suspense, lazy } from 'react';
import Spinner from './ui/Spinner';

// Componente de erro para lazy loading
const LazyErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (error) => {
      console.error('Lazy loading error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return fallback || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400">
          <div className="text-lg font-semibold mb-2">Erro ao carregar componente</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#01C38D] text-white rounded-lg hover:bg-[#01C38D]/80 transition-colors"
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// HOC para lazy loading com retry automático
const withLazyLoading = (importFunc, fallback = null) => {
  const LazyComponent = lazy(() => 
    importFunc().catch((error) => {
      console.warn('Lazy loading failed, retrying...', error);
      // Retry uma vez após 1 segundo
      return new Promise((resolve) => {
        setTimeout(() => {
          importFunc().then(resolve).catch((retryError) => {
            console.error('Lazy loading retry failed:', retryError);
            // Fallback para componente de erro
            resolve({
              default: () => (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-400">
                    <div className="text-lg font-semibold mb-2">Erro ao carregar componente</div>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-[#01C38D] text-white rounded-lg hover:bg-[#01C38D]/80 transition-colors"
                    >
                      Recarregar página
                    </button>
                  </div>
                </div>
              )
            });
          });
        }, 1000);
      });
    })
  );

  return React.memo((props) => (
    <LazyErrorBoundary>
      <Suspense fallback={fallback || <Spinner />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  ));
};

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

// Hook para preload de componentes
export const useComponentPreloader = () => {
  const preloadComponent = React.useCallback((importFunc) => {
    // Preload em background
    importFunc().catch(() => {
      // Ignora erros de preload
    });
  }, []);

  const preloadCriticalComponents = React.useCallback(() => {
    // Preload componentes críticos após carregamento inicial
    setTimeout(() => {
      preloadComponent(() => import('./dashboard/EnhancedDashboard'));
      preloadComponent(() => import('./transactions/ImprovedTransactionList'));
    }, 2000);

    // Preload componentes secundários
    setTimeout(() => {
      preloadComponent(() => import('./settings/EnhancedSettings'));
      preloadComponent(() => import('./groups/Groups'));
    }, 5000);
  }, [preloadComponent]);

  return { preloadComponent, preloadCriticalComponents };
};

export default {
  LazyEnhancedDashboard,
  LazyImprovedTransactionList,
  LazyEnhancedSettings,
  LazyEnhancedBudgets,
  LazyGroups,
  LazyAdminDashboard,
  LazyFinancialHealth,
  LazyPerformanceDashboard,
  LazyExpenseChart,
  LazyBalanceChart,
  LazyCreateGroup,
  LazyGroupPage,
  useComponentPreloader
};