import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { queryClient } from './lib/queryClient'
import './utils/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18n';

// Lazy load analytics to improve initial bundle size
const Analytics = lazy(() => import("@vercel/analytics/react").then(module => ({ default: module.Analytics })));
const SpeedInsights = lazy(() => import("@vercel/speed-insights/react").then(module => ({ default: module.SpeedInsights })));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>  
      <Suspense fallback={null}>
        <Analytics />
        <SpeedInsights />
      </Suspense>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </I18nextProvider>
    </QueryClientProvider>
  </StrictMode>,
)

// Simplified initialization to avoid React 19 scheduler conflicts
const deferInit = () => {
    // Only initialize analytics after app is stable
    console.log('App initialized successfully');
};

// Use requestIdleCallback if available, otherwise setTimeout
if ('requestIdleCallback' in window) {
    requestIdleCallback(deferInit);
} else {
    setTimeout(deferInit, 100);
}
