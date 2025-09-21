import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext';
import { isPremium } from './utils/premium';
import { preloadComponents } from './components/LazyWrapper';

// Lazy load heavy components for better performance
const EnhancedDashboard = lazy(() => import('./components/dashboard/EnhancedDashboard'));
const ImprovedTransactionList = lazy(() => import('./components/transactions/ImprovedTransactionList'));
const AdminDashboard = lazy(() => import('./components/dashboard/AdminDashboard'));
const FinancialHealth = lazy(() => import('./components/dashboard/FinancialHealth'));
const Groups = lazy(() => import('./components/groups/Groups'));
const EnhancedSettings = lazy(() => import('./components/settings/EnhancedSettings'));
const EnhancedBudgets = lazy(() => import('./components/settings/EnhancedBudgets'));

// Keep frequently used components as regular imports for faster loading
import { 
  AddExpense, 
  AddIncome, 
  Sidebar, 
  Login, 
  Signup, 
  EnhancedCategories, 
  Subscription, 
  PremiumPage, 
  Spinner, 
  UnifiedTopBar, 
  NotificationProvider, 
  SavingsGoals, 
  TotalExpenses, 
  DateRangeFilter, 
  CreateGroup, 
  GroupPage, 
  Savings 
} from './components';


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

const App = React.memo(() => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Preload components after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadComponents();
    }, 2000); // Preload after 2 seconds to not block initial load

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
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

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><EnhancedDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><ImprovedTransactionList /></MainLayout></ProtectedRoute>} />
        <Route path="/add-expense" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><AddExpense /></MainLayout></ProtectedRoute>} />
        <Route path="/add-income" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><AddIncome /></MainLayout></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><EnhancedCategories /></MainLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><EnhancedSettings /></Suspense></MainLayout></ProtectedRoute>} />
        <Route path="/budgets" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Suspense fallback={<Spinner />}><EnhancedBudgets /></Suspense></MainLayout></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Subscription /></MainLayout></ProtectedRoute>} />
        <Route path="/savings-goals" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><SavingsGoals /></MainLayout></ProtectedRoute>} />
        <Route path="/savings" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Savings /></MainLayout></ProtectedRoute>} />
        <Route path="/financial-health" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><FinancialHealth /></MainLayout></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><Groups /></MainLayout></ProtectedRoute>} />
        <Route path="/groups/create" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><CreateGroup /></MainLayout></ProtectedRoute>} />
        <Route path="/groups/:id" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><GroupPage /></MainLayout></ProtectedRoute>} />

        {/* Premium route */}
        <Route path="/premium" element={<PremiumRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><PremiumPage /></MainLayout></PremiumRoute>} />

        {/* Admin route */}
        <Route path="/admin" element={<AdminRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><AdminDashboard /></MainLayout></AdminRoute>} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NotificationProvider>
  );
}

// Main layout for protected pages
const MainLayout = ({ children, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#191E29] font-sans">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#01C38D] text-[#191E29] p-2 z-50 rounded">
        Skip to main content
      </a>
      {/* Sidebar - Full height */}
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      {/* Main content area with topbar */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <UnifiedTopBar 
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          isMobileMenuOpen={isMobileMenuOpen} 
        />
        <main id="main-content" className="flex-1 p-4 md:p-6 overflow-y-auto" aria-live="polite">
          {children}
        </main>
      </div>
    </div>
  );
};

export default App;
