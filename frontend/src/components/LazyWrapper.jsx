import React, { Suspense, lazy } from 'react';
import Spinner from './ui/Spinner';

/**
 * Lazy loading wrapper with optimized loading states
 */
const LazyWrapper = ({ 
    importFunc, 
    fallback = <Spinner />, 
    errorBoundary = true,
    preload = false 
}) => {
    const LazyComponent = lazy(importFunc);

    // Preload component if requested
    if (preload && typeof importFunc === 'function') {
        importFunc();
    }

    const WrappedComponent = (props) => (
        <Suspense fallback={fallback}>
            <LazyComponent {...props} />
        </Suspense>
    );

    return errorBoundary ? (
        <ErrorBoundary>
            <WrappedComponent />
        </ErrorBoundary>
    ) : (
        <WrappedComponent />
    );
};

/**
 * Simple error boundary for lazy loaded components
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Lazy component error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="text-red-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Component failed to load
                    </h3>
                    <p className="text-gray-400 mb-4">
                        There was an error loading this component.
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Optimized lazy loading for heavy dashboard components
 */
export const LazyDashboard = lazy(() => 
    import('./dashboard/Dashboard').then(module => ({
        default: module.default
    }))
);

export const LazyEnhancedDashboard = lazy(() => 
    import('./dashboard/EnhancedDashboard').then(module => ({
        default: module.default
    }))
);

export const LazyPerformanceDashboard = lazy(() => 
    import('./dashboard/PerformanceDashboard').then(module => ({
        default: module.default
    }))
);

export const LazyAdminDashboard = lazy(() => 
    import('./dashboard/AdminDashboard').then(module => ({
        default: module.default
    }))
);

export const LazyFinancialHealth = lazy(() => 
    import('./dashboard/FinancialHealth').then(module => ({
        default: module.default
    }))
);

export const LazyTransactions = lazy(() => 
    import('./transactions/Transactions').then(module => ({
        default: module.default
    }))
);

export const LazyVirtualizedTransactionList = lazy(() => 
    import('./transactions/VirtualizedTransactionList').then(module => ({
        default: module.default
    }))
);

export const LazyGroups = lazy(() => 
    import('./groups/Groups').then(module => ({
        default: module.default
    }))
);

export const LazySettings = lazy(() => 
    import('./settings/Settings').then(module => ({
        default: module.default
    }))
);

/**
 * Preload components for better UX
 */
export const preloadComponents = () => {
    // Preload commonly used components
    import('./dashboard/Dashboard');
    import('./transactions/Transactions');
    import('./settings/Settings');
};

/**
 * Component preloader hook
 */
export const useComponentPreloader = (componentImports = []) => {
    React.useEffect(() => {
        // Preload components after a short delay to not block initial render
        const timeoutId = setTimeout(() => {
            componentImports.forEach(importFunc => {
                if (typeof importFunc === 'function') {
                    importFunc().catch(() => {
                        // Silently handle preload errors
                    });
                }
            });
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [componentImports]);
};

export default LazyWrapper;
