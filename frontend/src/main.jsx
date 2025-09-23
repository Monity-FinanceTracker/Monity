import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { queryClient } from './lib/queryClient'
import { reportWebVitals } from './utils/performance'
import './utils/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18n';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { initWebVitalsMonitoring } from './utils/performanceMonitor';
import { preloadCriticalChunks } from './utils/bundleOptimization';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>  
      <Analytics />
      <SpeedInsights />
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

// Initialize performance monitoring
initWebVitalsMonitoring();

// Performance monitoring
reportWebVitals(console.log);

// Preload critical chunks after initial render
setTimeout(() => {
    preloadCriticalChunks();
}, 1000);
