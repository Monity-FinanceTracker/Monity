# Cash Flow Calendar Feature - Implementation Summary

## Overview
The Cash Flow Calendar is a premium-only feature that allows users to visualize their balance across time with a calendar interface, similar to Google Calendar. Users can create both one-time scheduled transactions and recurring transactions that automatically execute on their scheduled dates.

## Features Implemented

### 1. **Backend Components**

#### Database
- **Table**: `scheduled_transactions`
- **Location**: `/backend/migrations/create-scheduled-transactions-table.sql`
- **Features**:
  - Encrypted data storage (description, amount, category)
  - Support for one-time and recurring transactions
  - Recurrence patterns: once, daily, weekly, monthly, yearly
  - Configurable recurrence intervals (e.g., every 2 weeks)
  - Optional end dates for recurring transactions
  - Execution tracking (next_execution_date, last_executed_date)
  - Row Level Security (RLS) policies

#### Models
- **File**: `/backend/models/ScheduledTransaction.js`
- **Methods**:
  - `create()` - Create new scheduled transaction
  - `getById()` - Get specific transaction
  - `getAll()` - Get all active scheduled transactions for a user
  - `getAllDueTransactions()` - Get transactions due for execution
  - `getByDateRange()` - Get transactions within a date range
  - `update()` - Update transaction
  - `delete()` - Delete transaction
  - `deactivate()` - Deactivate transaction

#### Services
- **File**: `/backend/services/scheduledTransactionService.js`
- **Features**:
  - Automated cron job (runs daily at 00:01 UTC)
  - Executes due scheduled transactions
  - Creates actual transactions from scheduled ones
  - Updates recurrence for recurring transactions
  - Deactivates completed one-time transactions
  - Calculates future occurrences within date ranges
  - Recurrence logic for all patterns (daily, weekly, monthly, yearly)

#### Controllers
- **File**: `/backend/controllers/cashFlowController.js`
- **Endpoints**:
  - `GET /api/v1/cashflow/scheduled-transactions` - Get all scheduled transactions
  - `GET /api/v1/cashflow/scheduled-transactions/:id` - Get one transaction
  - `POST /api/v1/cashflow/scheduled-transactions` - Create transaction
  - `PUT /api/v1/cashflow/scheduled-transactions/:id` - Update transaction
  - `DELETE /api/v1/cashflow/scheduled-transactions/:id` - Delete transaction
  - `GET /api/v1/cashflow/calendar-data?start_date=X&end_date=Y` - Get calendar data with daily balances

#### Routes
- **File**: `/backend/routes/cashFlow.js`
- All routes require authentication

### 2. **Frontend Components**

#### Main Calendar Component
- **File**: `/frontend/src/components/cashFlow/CashFlowCalendar.jsx`
- **Features**:
  - Google Calendar-style interface using `react-big-calendar`
  - Custom day cells showing daily balance
  - Color-coded balances (red for negative, green for positive)
  - Shows income and expenses for each day
  - Click on any day to create a scheduled transaction
  - Monthly navigation
  - Responsive design

#### Transaction Form
- **File**: `/frontend/src/components/cashFlow/ScheduledTransactionForm.jsx`
- **Features**:
  - Create and edit scheduled transactions
  - Transaction type selector (Income/Expense)
  - Category selection from existing categories
  - Date picker for scheduled date
  - Recurrence pattern selector
  - Interval configuration for recurring transactions
  - Optional end date for recurring transactions
  - Real-time validation
  - Success/error toast notifications

#### Transaction List
- **File**: `/frontend/src/components/cashFlow/ScheduledTransactionList.jsx`
- **Features**:
  - Display all scheduled transactions
  - Edit and delete actions
  - Shows next execution date
  - Shows recurrence pattern in human-readable format
  - Category badges
  - Empty state for no transactions

### 3. **Integration**

#### Premium Protection
- Cash Flow route is wrapped with `PremiumRoute` component
- Only users with `subscriptionTier === 'premium'` can access
- Redirects free users to subscription page

#### Sidebar Menu
- "Cash Flow" menu item only visible to premium users
- Located between "Financial Health" and subscription sections
- Uses `CalendarDays` icon from Lucide React

#### Translations
- **English** (`en.json`): Full translation set
- **Portuguese** (`pt.json`): Full translation set
- Includes all UI labels, form fields, error messages, and success notifications

### 4. **Cron Service**

#### Initialization
- Service initialized in `/backend/server.js` on server start
- Runs daily at 00:01 UTC
- Automatically executes due scheduled transactions
- Creates real transactions in the database
- Updates recurring transactions for next execution
- Deactivates completed one-time transactions

## Database Migration

To create the `scheduled_transactions` table, run the migration SQL:

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U postgres -d postgres -f backend/migrations/create-scheduled-transactions-table.sql
```

Or use Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `backend/migrations/create-scheduled-transactions-table.sql`
3. Execute the SQL

## Usage Flow

### For Users

1. **Access Feature**:
   - Premium users see "Cash Flow" in sidebar
   - Click to view cash flow calendar

2. **View Calendar**:
   - See daily balances for the month
   - Red-highlighted days indicate negative balance
   - Green text shows positive balance
   - View income/expenses for each day

3. **Create Scheduled Transaction**:
   - Click "Add Scheduled Transaction" or click on a specific day
   - Choose transaction type (Income/Expense)
   - Enter description, amount, and category
   - Select scheduled date
   - Choose recurrence pattern:
     - **Once**: One-time transaction
     - **Daily/Weekly/Monthly/Yearly**: Recurring transaction
   - Set interval (e.g., every 2 weeks)
   - Optionally set end date
   - Click Save

4. **Manage Scheduled Transactions**:
   - View all scheduled transactions in the list below calendar
   - Edit transactions using edit button
   - Delete transactions using delete button

5. **Automatic Execution**:
   - Server executes transactions daily at midnight UTC
   - Scheduled transactions create real transactions when their date arrives
   - Recurring transactions update to next execution date
   - One-time transactions are deactivated after execution

### Daily Balance Calculation Logic

1. **Past Days**: Show actual balance based on completed transactions
2. **Future Days**: Show projected balance including scheduled transactions
3. **Calculation**:
   - Start with balance before the date range
   - For each day:
     - Add all income transactions
     - Subtract all expense transactions
     - Include scheduled transactions for future dates
   - Color code based on positive/negative

## Technical Details

### Recurrence Patterns

- **Once**: Executes on `scheduled_date`, then deactivates
- **Daily**: Executes every N days
- **Weekly**: Executes every N weeks (same day of week)
- **Monthly**: Executes every N months (same day of month)
- **Yearly**: Executes every N years (same month and day)

### Data Security

- All scheduled transaction data is encrypted using the existing encryption middleware
- Fields encrypted: `description`, `amount`, `category`
- Row Level Security (RLS) ensures users can only access their own transactions

### Performance Optimizations

- Database indexes on `userId`, `next_execution_date`, and `is_active`
- Cron job processes only due transactions (`next_execution_date <= today`)
- Calendar data fetched only for visible month
- Lazy loading of Cash Flow component

## Dependencies Added

### Frontend
- `react-big-calendar`: Calendar UI library
- `moment`: Date manipulation (peer dependency for react-big-calendar)

## Files Created/Modified

### Backend (New Files)
- `/backend/models/ScheduledTransaction.js`
- `/backend/services/scheduledTransactionService.js`
- `/backend/controllers/cashFlowController.js`
- `/backend/routes/cashFlow.js`
- `/backend/migrations/create-scheduled-transactions-table.sql`

### Backend (Modified Files)
- `/backend/models/index.js` - Added ScheduledTransaction export
- `/backend/services/index.js` - Added scheduledTransactionService
- `/backend/controllers/index.js` - Added CashFlowController initialization
- `/backend/routes/index.js` - Added cashflow routes
- `/backend/server.js` - Initialize scheduled transaction service

### Frontend (New Files)
- `/frontend/src/components/cashFlow/CashFlowCalendar.jsx`
- `/frontend/src/components/cashFlow/ScheduledTransactionForm.jsx`
- `/frontend/src/components/cashFlow/ScheduledTransactionList.jsx`

### Frontend (Modified Files)
- `/frontend/src/App.jsx` - Added /cashflow route with PremiumRoute protection
- `/frontend/src/components/layout/Sidebar.jsx` - Added Cash Flow menu item
- `/frontend/src/utils/locales/en.json` - Added translations
- `/frontend/src/utils/locales/pt.json` - Added translations
- `/frontend/package.json` - Added react-big-calendar and moment

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Scheduled transaction CRUD operations work
- [ ] Premium users can access Cash Flow page
- [ ] Free users are redirected from Cash Flow page
- [ ] Calendar displays correct daily balances
- [ ] Can create one-time scheduled transaction
- [ ] Can create recurring scheduled transaction
- [ ] Can edit scheduled transaction
- [ ] Can delete scheduled transaction
- [ ] Cron job executes due transactions (wait until next day or test manually)
- [ ] Recurring transactions update to next date after execution
- [ ] One-time transactions deactivate after execution
- [ ] Negative balances show in red
- [ ] Translations work in both English and Portuguese

## Future Enhancements (Optional)

1. **Notification System**: Notify users before scheduled transaction executes
2. **Manual Execution**: Allow users to manually execute a scheduled transaction early
3. **Skip/Pause**: Allow users to pause recurring transactions temporarily
4. **Templates**: Save common transactions as templates
5. **Bulk Operations**: Create multiple scheduled transactions at once
6. **Export**: Export scheduled transactions to CSV/PDF
7. **Statistics**: Show statistics about upcoming cash flow
8. **AI Predictions**: Use AI to suggest scheduled transactions based on patterns

## Support

For issues or questions about this feature:
1. Check the migration file has been run
2. Verify premium subscription is active
3. Check browser console for errors
4. Check server logs for cron execution
5. Verify encryption keys are properly configured

---

**Feature Status**: ✅ Complete and Ready for Testing
**Premium Only**: Yes
**Database Migration Required**: Yes
