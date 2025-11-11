import { memo, lazy, Suspense, useCallback, useEffect, useState } from 'react';
import Spinner from './ui/Spinner';

export const LazyErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Lazy loading error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      fallback || (
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
    );
  }

  return children;
};

export const withLazyLoading = (importFunc, fallback = null) => {
  const LazyComponent = lazy(() =>
    importFunc().catch((error) => {
      console.warn('Lazy loading failed, retrying...', error);
      return new Promise((resolve) => {
        setTimeout(() => {
          importFunc()
            .then(resolve)
            .catch((retryError) => {
              console.error('Lazy loading retry failed:', retryError);
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
                ),
              });
            });
        }, 1000);
      });
    })
  );

  const WrappedComponent = memo((props) => (
    <LazyErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback || <Spinner />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  ));

  WrappedComponent.displayName = 'WithLazyLoadingComponent';

  return WrappedComponent;
};

export const useLazyComponentPreloader = () => {
  const preloadComponent = useCallback((importFunc) => {
    importFunc().catch(() => {
      // ignore preload errors
    });
  }, []);

  const preloadCriticalComponents = useCallback(() => {
    setTimeout(() => {
      preloadComponent(() => import('./dashboard/EnhancedDashboard'));
      preloadComponent(() => import('./transactions/ImprovedTransactionList'));
    }, 2000);

    setTimeout(() => {
      preloadComponent(() => import('./settings/EnhancedSettings'));
      preloadComponent(() => import('./groups/Groups'));
    }, 5000);
  }, [preloadComponent]);

  return { preloadComponent, preloadCriticalComponents };
};

