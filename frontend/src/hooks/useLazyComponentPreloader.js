import { useCallback } from 'react';

const useLazyComponentPreloader = () => {
  const preloadComponent = useCallback((importFunc) => {
    importFunc().catch(() => {
      // Ignora falhas de preload
    });
  }, []);

  const preloadCriticalComponents = useCallback(() => {
    setTimeout(() => {
      preloadComponent(() => import('../components/dashboard/EnhancedDashboard'));
      preloadComponent(() => import('../components/transactions/ImprovedTransactionList'));
    }, 2000);

    setTimeout(() => {
      preloadComponent(() => import('../components/settings/EnhancedSettings'));
      preloadComponent(() => import('../components/groups/Groups'));
    }, 5000);
  }, [preloadComponent]);

  return { preloadComponent, preloadCriticalComponents };
};

export default useLazyComponentPreloader;

