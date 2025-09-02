# Components Organization

This directory contains all React components organized into logical folders for better maintainability and discoverability.

## Folder Structure

### 📁 `auth/` - Authentication Components
Components related to user authentication and account management.
- `Login.jsx` - User login form
- `Signup.jsx` - User registration form

### 📁 `dashboard/` - Dashboard Components
Main dashboard and analytics components.
- `EnhancedDashboard.jsx` - Main user dashboard
- `Dashboard.jsx` - Basic dashboard component
- `AdminDashboard.jsx` - Admin analytics dashboard
- `PerformanceDashboard.jsx` - System performance monitoring
- `FinancialHealth.jsx` - Financial wellness dashboard
- `FinancialProjections.jsx` - AI-powered financial forecasting

### 📁 `charts/` - Data Visualization
Chart and graph components for displaying financial data.
- `BalanceChart.jsx` - Balance over time chart
- `ExpenseChart.jsx` - Expense breakdown charts

### 📁 `forms/` - Form Components
Reusable form components for data input.
- `AddExpense.jsx` - Expense entry form
- `AddIncome.jsx` - Income entry form
- `AddCategory.jsx` - Category creation form
- `MobileOptimizedForm.jsx` - Mobile-friendly form wrapper

### 📁 `groups/` - Group Management
Components for managing shared expenses and group finances.
- `GroupPage.jsx` - Main group page
- `Groups.jsx` - Groups overview
- `CreateGroup.jsx` - Group creation form
- `GroupInvitations.jsx` - Group invitation management
- `GroupSpendingCard.jsx` - Group spending summary

### 📁 `layout/` - Layout Components
Structural components that define the app's layout.
- `Sidebar.jsx` - Main navigation sidebar
- `TopBar.jsx` - Top navigation bar
- `UnifiedTopBar.jsx` - Enhanced top bar with features
- `NavBar.jsx` - Navigation component

### 📁 `navigation/` - Navigation & Routing
Components related to app navigation and premium features.
- `PremiumPage.jsx` - Premium features page
- `Subscription.jsx` - Subscription management
- `LanguageSwitcher.jsx` - Language selection component

### 📁 `settings/` - Settings & Configuration
Components for user preferences and app configuration.
- `Settings.jsx` - Main settings page
- `EnhancedSettings.jsx` - Advanced settings interface
- `EnhancedCategories.jsx` - Category management
- `EnhancedBudgets.jsx` - Budget configuration
- `BudgetsAndRecurring.jsx` - Budget and recurring expense setup

### 📁 `transactions/` - Transaction Management
Components for viewing and managing financial transactions.
- `Transactions.jsx` - Main transactions page
- `ImprovedTransactionList.jsx` - Enhanced transaction list
- `VirtualizedTransactionList.jsx` - Performance-optimized list
- `ExpenseList.jsx` - Expense-specific transaction list
- `IncomeList.jsx` - Income-specific transaction list

### 📁 `ui/` - Reusable UI Components
Common UI components used throughout the application.
- `Card.jsx` - Basic card component
- `BalanceCard.jsx` - Balance display card
- `Balance.jsx` - Balance component
- `TotalExpenses.jsx` - Total expenses display
- `Savings.jsx` - Savings overview
- `SavingsOverviewCard.jsx` - Savings summary card
- `SavingsGoals.jsx` - Savings goals management
- `ExpensivePurchase.jsx` - Large purchase tracking
- `SmartCategoryButton.jsx` - AI-powered category button
- `DateRangeFilter.jsx` - Date filtering component
- `EmptyStates.jsx` - Empty state placeholders
- `NotificationSystem.jsx` - Notification management
- `Spinner.jsx` - Loading spinner component
- `Spinner.css` - Spinner styles

## Import Patterns

### Import from specific folders:
```javascript
import { Login, Signup } from './components/auth';
import { EnhancedDashboard } from './components/dashboard';
import { BalanceChart } from './components/charts';
```

### Import from main index:
```javascript
import { Login, EnhancedDashboard, BalanceChart } from './components';
```

## Benefits of This Organization

1. **Logical Grouping**: Related components are grouped together
2. **Easy Discovery**: Developers can quickly find components by category
3. **Maintainability**: Easier to maintain and update related components
4. **Scalability**: New components can be easily added to appropriate folders
5. **Import Clarity**: Clear import paths make dependencies obvious
6. **Team Collaboration**: Multiple developers can work on different areas without conflicts

## Adding New Components

When adding new components:

1. **Identify the category** - Which folder does it belong in?
2. **Update the folder's index.js** - Export the new component
3. **Update the main index.js** - If it's a new category, add the export
4. **Follow naming conventions** - Use PascalCase for component files
5. **Add to README** - Document the new component in this file

## Migration Notes

This organization was implemented to improve the maintainability of the Monity frontend. All existing imports should continue to work through the main `index.js` file, but consider updating imports to use the more specific folder imports for better clarity.
