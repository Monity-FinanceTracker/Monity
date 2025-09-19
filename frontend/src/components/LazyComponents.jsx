import { lazy } from 'react';

/**
 * Lazy-loaded components for better performance
 * These components are loaded only when needed, reducing initial bundle size
 */

// Dashboard components
export const Dashboard = lazy(() => import('./dashboard/Dashboard'));
export const EnhancedDashboard = lazy(() => import('./dashboard/EnhancedDashboard'));
export const FinancialHealth = lazy(() => import('./dashboard/FinancialHealth'));
export const FinancialProjections = lazy(() => import('./dashboard/FinancialProjections'));

// Form components
export const AddExpense = lazy(() => import('./forms/AddExpense'));
export const AddIncome = lazy(() => import('./forms/AddIncome'));
export const AddCategory = lazy(() => import('./forms/AddCategory'));

// Feature components
export const TransactionList = lazy(() => import('./transactions/TransactionList'));
export const SavingsGoals = lazy(() => import('./ui/SavingsGoals'));
export const GroupManagement = lazy(() => import('./groups/GroupManagement'));
export const BudgetManagement = lazy(() => import('./budget/BudgetManagement'));

// Settings components
export const Settings = lazy(() => import('./settings/Settings'));
export const Profile = lazy(() => import('./settings/Profile'));
export const Preferences = lazy(() => import('./settings/Preferences'));

// Admin components
export const AdminDashboard = lazy(() => import('./dashboard/AdminDashboard'));
