import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { AnalyticsProvider } from './context/AnalyticsContext'
import { queryClient } from './lib/queryClient'
import './utils/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18n';

// Simple initialization without lazy loading analytics to avoid initialization issues
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>  
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <AuthProvider>
            <AnalyticsProvider>
              <App />
            </AnalyticsProvider>
          </AuthProvider>
        </BrowserRouter>
      </I18nextProvider>
    </QueryClientProvider>
  </StrictMode>,
)

// Initialize analytics after app is stable
setTimeout(() => {
    // Load analytics after initial render
    import("@vercel/analytics/react").then(() => {
        // Analytics will be initialized automatically
        console.log('Analytics loaded');
    }).catch(() => {
        console.warn('Analytics failed to load');
    });
    
    import("@vercel/speed-insights/react").then(() => {
        // Speed insights will be initialized automatically
        console.log('Speed insights loaded');
    }).catch(() => {
        console.warn('Speed insights failed to load');
    });
}, 2000);
