import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { 
  AddExpense, 
  AddIncome, 
  EnhancedDashboard, 
  ImprovedTransactionList, 
  Sidebar, 
  Login, 
  Signup, 
  EnhancedCategories, 
  EnhancedSettings, 
  AdminDashboard, 
  EnhancedBudgets, 
  Subscription, 
  PremiumPage, 
  Spinner, 
  UnifiedTopBar, 
  NotificationProvider, 
  SavingsGoals, 
  TotalExpenses, 
  DateRangeFilter, 
  Groups, 
  CreateGroup, 
  GroupPage, 
  Savings, 
  FinancialHealth 
} from './components'
import { useAuth } from './context/AuthContext'
import { useEffect, useState } from 'react'
import { isPremium } from './utils/premium'


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

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [useLocation().pathname]);

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
        <Route path="/settings" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><EnhancedSettings /></MainLayout></ProtectedRoute>} />
        <Route path="/budgets" element={<ProtectedRoute><MainLayout isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}><EnhancedBudgets /></MainLayout></ProtectedRoute>} />
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
