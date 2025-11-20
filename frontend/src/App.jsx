import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { usePageTracking } from './hooks/usePageTracking';
import { useAuth } from './context/AuthContext';

// Keep only critical components as regular imports for faster initial loading
import {
  AddExpense,
  AddIncome,
  Sidebar,
  Login,
  Signup,
  ConfirmEmail,
  EmailConfirmed,
  ForgotPassword,
  ResetPassword,
  Spinner,
  UnifiedTopBar,
  NotificationProvider
} from './components';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ConfigCheck from './components/ui/ConfigCheck';
import Privace from './components/privace';
import Terms from './components/terms';
import AuthCallback from './pages/AuthCallback';
import EmailConfirmation from './pages/EmailConfirmation';
import BlockingAuthModal from './components/ui/BlockingAuthModal';
import AnalyticsConsentBanner from './components/ui/AnalyticsConsentBanner';

// Lazy load non-critical components
const EnhancedCategories = lazy(() => import('./components/settings/EnhancedCategories'));
const Subscription = lazy(() => import('./components/navigation/Subscription'));
const SavingsGoals = lazy(() => import('./components/ui/SavingsGoals'));
const Savings = lazy(() => import('./components/ui/Savings'));
const CashFlowCalendar = lazy(() => import('./components/cashFlow/CashFlowCalendar'));
const AIAssistantPage = lazy(() => import('./components/ai/AIAssistantPage'));
const InvestmentCalculator = lazy(() => import('./components/investment/InvestmentCalculator'));
const GroupsInfo = lazy(() => import('./components/groups/GroupsInfo'));
const WhatsNewPage = lazy(() => import('./components/whatsNew/WhatsNewPage'));
const AnalyticsDashboard = lazy(() => import('./components/admin/AnalyticsDashboard'));

// Import lazy components with optimized loading
import {
  LazyEnhancedDashboard,
  LazyImprovedTransactionList,
  LazyAdminDashboard,
  LazyFinancialHealth,
  LazyGroups,
  LazyEnhancedSettings,
  LazyEnhancedBudgets,
  LazyCreateGroup,
  LazyGroupPage
} from './components/LazyComponents';
import useLazyComponentPreloader from './hooks/useLazyComponentPreloader';


// View-only route - allows viewing but blocks actions without login
const ViewOnlyRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  // Allow viewing even without login
  // Components will handle blocking actions internally
  return children;
};

// Protected route component - requires full authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading, isEmailConfirmed } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's email is confirmed
  if (!isEmailConfirmed()) {
    return <Navigate to="/confirm-email" replace state={{ email: user.email }} />;
  }

  return children;
};

// Premium route component
const PremiumRoute = ({ children }) => {
  const { user, loading, subscriptionTier } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user || subscriptionTier !== 'premium') {
    return <Navigate to="/subscription" replace />;
  }
  return children;
}

// Admin route component
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Main layout for protected pages
const MainLayout = React.memo(({ children, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { preloadCriticalComponents } = useLazyComponentPreloader();
  const { user, loading } = useAuth();
  const location = useLocation();
  const isUnauthenticated = !user && !loading;
  const isWhatsNewPage = location.pathname === '/whats-new';

  // Preload critical components after layout is mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadCriticalComponents();
    }, 1000);

    return () => clearTimeout(timer);
  }, [preloadCriticalComponents]);

  // Prevent body scrolling when on WhatsNew page
  useEffect(() => {
    if (isWhatsNewPage) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isWhatsNewPage]);

  return (
    <div className={`flex bg-[#262624] font-sans ${isWhatsNewPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#56a69f] text-[#1F1E1D] p-2 z-50 rounded">
        Skip to main content
      </a>
      {/* Sidebar - Full height */}
      <div className={isUnauthenticated ? 'pointer-events-none opacity-60' : ''}>
        <Sidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>
      
      {/* Main content area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 sidebar-transition ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'} relative ${isWhatsNewPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
        {/* Top navigation bar */}
        <div className={isUnauthenticated ? 'pointer-events-none opacity-60' : ''}>
          <UnifiedTopBar 
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>

        {/* Main content */}
        <main
          id="main-content"
          className={`flex-1 px-4 sm:px-6 pt-4 sm:pt-6 pb-1 sm:pb-2 content-container overflow-x-hidden relative ${
            isWhatsNewPage ? 'overflow-hidden min-h-0' : ''
          }`}
        >
          <div className={isUnauthenticated ? 'pointer-events-none opacity-60' : ''}>
            {children}
          </div>
          {isUnauthenticated && <BlockingAuthModal />}
        </main>
      </div>
    </div>
  );
});

const App = React.memo(() => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Track page views automatically
  usePageTracking();

  // Component preloading is now handled in MainLayout

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <ConfigCheck />
      <NotificationProvider>
        <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/email-confirmed" element={<EmailConfirmed />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<Privace />} />
        <Route path="/terms" element={<Terms />} />

        {/* View-only routes - can view without login, actions require auth */}
        <Route path="/" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyEnhancedDashboard /></MainLayout></ViewOnlyRoute>} />
        <Route path="/transactions" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyImprovedTransactionList /></MainLayout></ViewOnlyRoute>} />
        <Route path="/add-expense" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><AddExpense /></MainLayout></ProtectedRoute>} />
        <Route path="/add-income" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><AddIncome /></MainLayout></ProtectedRoute>} />
        <Route path="/categories" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><EnhancedCategories /></Suspense></MainLayout></ViewOnlyRoute>} />
        {/* Settings uses Portal to render as modal overlay on top of everything */}
        <Route path="/settings" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyEnhancedSettings /></MainLayout></ProtectedRoute>} />
        <Route path="/budgets" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyEnhancedBudgets /></MainLayout></ViewOnlyRoute>} />
        <Route path="/subscription" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><Subscription /></Suspense></MainLayout></ViewOnlyRoute>} />
        <Route path="/savings-goals" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><SavingsGoals /></Suspense></MainLayout></ViewOnlyRoute>} />
        <Route path="/savings" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><Savings /></Suspense></MainLayout></ViewOnlyRoute>} />
        <Route path="/financial-health" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyFinancialHealth /></MainLayout></ViewOnlyRoute>} />
        <Route path="/ai-assistant" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><AIAssistantPage /></Suspense></MainLayout></ViewOnlyRoute>} />
        <Route path="/investment-calculator" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><InvestmentCalculator /></Suspense></MainLayout></ViewOnlyRoute>} />
        <Route path="/whats-new" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><WhatsNewPage /></Suspense></MainLayout></ViewOnlyRoute>} />
        <Route path="/groups" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyGroups /></MainLayout></ViewOnlyRoute>} />
        <Route path="/groups/info" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><GroupsInfo /></Suspense></MainLayout></ViewOnlyRoute>} />
        <Route path="/groups/create" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyCreateGroup /></MainLayout></ProtectedRoute>} />
        <Route path="/groups/:id" element={<ViewOnlyRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyGroupPage /></MainLayout></ViewOnlyRoute>} />

        {/* Premium routes */}
        <Route path="/cashflow" element={<PremiumRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><CashFlowCalendar /></Suspense></MainLayout></PremiumRoute>} />

        {/* Admin route */}
        <Route path="/admin" element={<AdminRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyAdminDashboard /></MainLayout></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><AnalyticsDashboard /></Suspense></MainLayout></AdminRoute>} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Analytics Consent Banner */}
      <AnalyticsConsentBanner />

      </NotificationProvider>
    </ErrorBoundary>
  );
});

export default App;
