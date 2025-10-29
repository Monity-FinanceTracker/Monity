import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext';
import { isPremium } from './utils/premium';
// Removed preloadComponents import - now using useComponentPreloader hook

// Keep only critical components as regular imports for faster initial loading
import {
  AddExpense,
  AddIncome,
  Sidebar,
  Login,
  Signup,
  Spinner,
  UnifiedTopBar,
  NotificationProvider
} from './components';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ConfigCheck from './components/ui/ConfigCheck';
import Privace from './components/privace';

// Lazy load non-critical components
const EnhancedCategories = lazy(() => import('./components/settings/EnhancedCategories'));
const Subscription = lazy(() => import('./components/navigation/Subscription'));
const PremiumPage = lazy(() => import('./components/navigation/PremiumPage'));
const SavingsGoals = lazy(() => import('./components/ui/SavingsGoals'));
const Savings = lazy(() => import('./components/ui/Savings'));
const CashFlowCalendar = lazy(() => import('./components/cashFlow/CashFlowCalendar'));
const AIAssistantPage = lazy(() => import('./components/ai/AIAssistantPage'));

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
  LazyGroupPage,
  useComponentPreloader
} from './components/LazyComponents';


// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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
  const { preloadCriticalComponents } = useComponentPreloader();
  const { user } = useAuth();

  // Preload critical components after layout is mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadCriticalComponents();
    }, 1000);

    return () => clearTimeout(timer);
  }, [preloadCriticalComponents]);

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] font-sans">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#01C38D] text-[#232323] p-2 z-50 rounded">
        Skip to main content
      </a>
      {/* Sidebar - Full height */}
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 sidebar-transition ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Top navigation bar */}
        <UnifiedTopBar 
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Main content */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 content-container overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
});

const App = React.memo(() => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
        <Route path="/privacy" element={<Privace />} />

        {/* Protected routes - using lazy components */}
        <Route path="/" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyEnhancedDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyImprovedTransactionList /></MainLayout></ProtectedRoute>} />
        <Route path="/add-expense" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><AddExpense /></MainLayout></ProtectedRoute>} />
        <Route path="/add-income" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><AddIncome /></MainLayout></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><EnhancedCategories /></Suspense></MainLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyEnhancedSettings /></MainLayout></ProtectedRoute>} />
        <Route path="/budgets" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyEnhancedBudgets /></MainLayout></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><Subscription /></Suspense></MainLayout></ProtectedRoute>} />
        <Route path="/savings-goals" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><SavingsGoals /></Suspense></MainLayout></ProtectedRoute>} />
        <Route path="/savings" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><Savings /></Suspense></MainLayout></ProtectedRoute>} />
        <Route path="/financial-health" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyFinancialHealth /></MainLayout></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><AIAssistantPage /></Suspense></MainLayout></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyGroups /></MainLayout></ProtectedRoute>} />
        <Route path="/groups/create" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyCreateGroup /></MainLayout></ProtectedRoute>} />
        <Route path="/groups/:id" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyGroupPage /></MainLayout></ProtectedRoute>} />

        {/* Premium routes */}
        <Route path="/premium" element={<PremiumRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><PremiumPage /></Suspense></MainLayout></PremiumRoute>} />
        <Route path="/cashflow" element={<PremiumRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><CashFlowCalendar /></Suspense></MainLayout></PremiumRoute>} />

        {/* Admin route */}
        <Route path="/admin" element={<AdminRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><LazyAdminDashboard /></MainLayout></AdminRoute>} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </NotificationProvider>
    </ErrorBoundary>
  );
});

export default App;
