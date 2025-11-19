/* eslint-disable react-refresh/only-export-components */
import { memo, lazy, Suspense, useEffect, useState } from 'react';
import Spinner from '../components/ui/Spinner';

const LazyErrorBoundary = ({ children, fallback }) => {
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
          <div className="text-center text-[#C2C0B6]">
            <div className="text-lg font-semibold mb-2">Erro ao carregar componente</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#56a69f] text-white rounded-lg hover:bg-[#4A8F88] transition-colors"
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

const withLazyLoading = (importFunc, fallback = null) => {
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
                    <div className="text-center text-[#C2C0B6]">
                      <div className="text-lg font-semibold mb-2">Erro ao carregar componente</div>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-[#56a69f] text-white rounded-lg hover:bg-[#4A8F88] transition-colors"
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

export default withLazyLoading;

