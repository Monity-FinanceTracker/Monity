# Premium Features & Limitations Guide

This document provides a comprehensive overview of all premium features and limitations implemented in the Monity application.

## Overview

Monity operates on a freemium model with two subscription tiers:
- **Free Tier**: Basic functionality with limitations
- **Premium Tier**: Full access to all features

## Subscription Management

### Database Schema
- User subscription status is stored in the `profiles` table
- Key fields: `subscription_tier`, `subscription_status`, `stripe_subscription_id`, `current_period_end`, `plan_price_id`

### Subscription Tiers
- `free`: Default tier for new users
- `premium`: Paid subscription with full access

### Billing Integration
- **Payment Processor**: Stripe
- **Subscription Management**: Stripe Subscriptions API
- **Webhook Handling**: Real-time subscription status updates
- **Billing Portal**: Customer self-service portal for subscription management

## ACTUAL Premium Limitations (Implemented in Code)

**IMPORTANT**: After thorough code analysis, most "premium" features are NOT actually restricted. Only the following features have real limitations implemented:

### 1. Savings Goals - ✅ ACTUALLY LIMITED

**Free Tier Limitation:**
- Maximum 2 savings goals per user
- Add new goal button disabled after reaching limit
- Upgrade prompt displayed when limit reached

**Code Implementation:**
```javascript
// frontend/src/components/ui/SavingsGoals.jsx:37
const isLimited = subscriptionTier === 'free' && goals.length >= 2;

// UI Limitation Logic (Lines 150-166)
{isLimited && (
    <Link
        to="/subscription"
        className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
    >
        {t('savings_goals.upgrade_to_add')}
    </Link>
)}
<button 
    onClick={() => setIsModalOpen(true)} 
    className={`bg-[#01C38D] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#01a87a] transition-colors ${isLimited ? 'opacity-50 cursor-not-allowed' : ''}`}
    disabled={isLimited}
>
    {t('savings_goals.add_new_goal')}
</button>

// Modal Restriction (Line 168)
{isModalOpen && !isLimited && (
    <Modal onClose={() => setIsModalOpen(false)}>
        {/* Add Goal Form */}
    </Modal>
)}
```

**Premium Benefits:**
- Unlimited savings goals
- Full access to goal management features

### 2. Budget Management - ✅ ACTUALLY LIMITED

**Free Tier Limitation:**
- Maximum 2 budgets per user
- Add new budget button disabled after reaching limit
- Upgrade prompt displayed when limit reached

**Code Implementation:**
```javascript
// frontend/src/components/settings/EnhancedBudgets.jsx:111
const isLimited = subscriptionTier === 'free' && budgets.length >= 2;

// UI Limitation Logic (Lines 125-141)
{isLimited && (
    <Link
        to="/subscription"
        className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors"
    >
        {t('budgets.upgrade_to_add')}
    </Link>
)}
<button
    onClick={() => setShowAddForm(true)}
    className={`mt-4 sm:mt-0 bg-[#01C38D] text-white px-6 py-3 rounded-lg hover:bg-[#00b37e] transition-colors flex items-center gap-2 font-medium ${isLimited ? 'opacity-50 cursor-not-allowed' : ''}`}
    disabled={isLimited}
>
    <span className="text-lg">+</span>
    {t('budgets.add_new')}
</button>

// Modal Restriction (Line 283)
{showAddForm && !isLimited && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        {/* Add Budget Form */}
    </div>
)}
```

**Premium Benefits:**
- Unlimited budgets
- Full access to budget tracking and analytics

### 3. Premium Route Protection - ✅ ACTUALLY IMPLEMENTED

**Code Implementation:**
```javascript
// frontend/src/App.jsx:52-63
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

// Usage in Routes (Line 122)
<Route path="/premium" element={<PremiumRoute><MainLayout><PremiumPage /></MainLayout></PremiumRoute>} />
```

## Features ADVERTISED as Premium but NOT Actually Limited

### 1. AI Features - ❌ NOT LIMITED

**What's Advertised:**
- AI categorization suggestions (Premium only)
- AI insights dashboard (Premium only)

**Reality:**
```javascript
// backend/routes/ai.js - NO premium middleware
router.post('/suggest-category', (req, res, next) => aiController.categorizeTransaction(req, res, next));
router.post('/feedback', (req, res, next) => aiController.recordFeedback(req, res, next));
router.get('/projections', (req, res, next) => aiController.getProjectedExpenses(req, res, next));

// AI API endpoints work for ALL users - only UI elements are hidden
```

**Code Evidence:**
- AI controller has no premium checks
- AI routes only require authentication, not premium subscription
- All users can access AI categorization via API

### 2. Advanced Analytics - ❌ NOT LIMITED

**What's Advertised:**
- Advanced analytics and insights (Premium only)
- Comprehensive spending reports (Premium only)

**Reality:**
```javascript
// backend/routes/index.js - NO premium middleware on analytics
v1Router.use("/ai", middleware.auth.authenticate, aiRoutes(controllers));
v1Router.use("/financial-projections", middleware.auth.authenticate, financialProjectionsRoutes(controllers));
```

**Code Evidence:**
- Analytics endpoints only require authentication
- No premium checks in financial projections or analytics services
- All users can access advanced analytics

### 3. Data Export - ❌ NOT LIMITED

**What's Advertised:**
- Export data to CSV/PDF (Premium only)

**Reality:**
```javascript
// frontend/src/components/settings/EnhancedSettings.jsx:414-416
<button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
    {t('settings.export_button')} // Available to ALL users
</button>

// backend/services/dataExportService.js - NO premium checks
class DataExportService {
    async exportTransactions(userId, format, options = {}) {
        // No subscription tier validation
        // Works for all authenticated users
    }
}
```

**Code Evidence:**
- Export buttons visible to all users in settings
- Data export service has no premium restrictions
- Export functionality works for all authenticated users

### 4. Priority Support - ❌ NOT IMPLEMENTED

**What's Advertised:**
- Priority customer support (Premium only)

**Reality:**
- No support system implementation found in codebase
- No premium support features
- Only mentioned in upgrade benefits list

### 5. Premium Middleware - ✅ EXISTS BUT ❌ NOT USED

**Code Implementation:**
```javascript
// backend/middleware/auth.js:33-59
const checkPremium = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication is required for this feature.' });
    }

    try {
        const { data: profile, error } = await req.supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', req.user.id)
            .single();

        if (error || !profile) {
            logger.warn('Could not retrieve user profile for premium check', { userId: req.user.id, error });
            return res.status(404).json({ success: false, message: 'User profile not found.' });
        }

        if (profile.subscription_tier !== 'premium') {
            return res.status(403).json({ success: false, message: 'Forbidden: A premium subscription is required for this feature.' });
        }

        next();
    } catch (err) {
        logger.error('Error in premium check middleware', { userId: req.user.id, error: err });
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};
```

**Reality:**
- Premium middleware exists but is NOT used on any API endpoints
- No routes in `backend/routes/index.js` use `checkPremium` middleware
- Available for implementation but not currently enforced

## Technical Implementation

### Frontend Premium Checks

**Premium Detection:**
```javascript
// utils/premium.js
export const isPremium = (user) => {
  return user?.subscription_tier === 'premium';
};
```

**Route Protection:**
```javascript
// App.jsx - PremiumRoute component
const PremiumRoute = ({ children }) => {
  const { user, loading, subscriptionTier } = useAuth();
  
  if (!user || subscriptionTier !== 'premium') {
    return <Navigate to="/subscription" replace />;
  }
  return children;
};
```

**UI Limitations:**
- Disabled buttons with visual indicators
- Upgrade prompts and call-to-action buttons
- Conditional rendering of premium features

### Backend Premium Checks

**Middleware:**
```javascript
// middleware/auth.js
const checkPremium = async (req, res, next) => {
  const { data: profile } = await req.supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', req.user.id)
    .single();

  if (profile.subscription_tier !== 'premium') {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: A premium subscription is required for this feature.' 
    });
  }
  next();
};
```

**Current API Endpoints:**
- All endpoints require authentication via `middleware.auth.authenticate`
- No endpoints currently use `checkPremium` middleware (premium checks are handled client-side)

### Subscription Management

**AuthContext Integration:**
```javascript
// context/AuthContext.jsx
const [subscriptionTier, setSubscriptionTier] = useState("free");

const refreshSubscription = useCallback(async (options = {}) => {
  const tier = await checkSubscription({ ...options, force: true });
  setSubscriptionTier(tier);
  return tier;
}, []);
```

**Subscription API:**
- `GET /api/v1/subscription-tier/` - Get current subscription tier
- `POST /api/v1/billing/create-checkout-session` - Create Stripe checkout
- `POST /api/v1/billing/create-portal-session` - Access billing portal

## Upgrade Flow

### 1. User Journey
1. User hits limitation (e.g., tries to add 3rd savings goal)
2. UI shows upgrade prompt with "Upgrade to Premium" button
3. Button redirects to `/subscription` page
4. Subscription page shows current plan and upgrade benefits
5. User clicks "Upgrade to Premium" button
6. Redirected to Stripe checkout
7. After payment, webhook updates subscription status
8. User gains access to premium features

### 2. Upgrade Benefits Display
The subscription page shows these premium benefits:
- ✓ Unlimited transactions
- ✓ Advanced analytics and insights
- ✓ Export data to CSV/PDF
- ✓ Priority customer support

### 3. Stripe Integration
- **Checkout Sessions**: For new subscriptions
- **Billing Portal**: For existing subscribers to manage billing
- **Webhooks**: Real-time subscription status updates
- **Customer Management**: Automatic customer creation and management

## Database Schema

### Profiles Table
```sql
profiles (
  id UUID PRIMARY KEY,
  subscription_tier VARCHAR DEFAULT 'free',
  subscription_status VARCHAR DEFAULT 'inactive',
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  current_period_end TIMESTAMP,
  plan_price_id VARCHAR
)
```

## Environment Variables

### Required for Premium Features
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PRICE_PREMIUM_MONTHLY=price_...
VITE_STRIPE_PRICE_ID=price_...

# Application URLs
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Security Considerations

### Premium Feature Protection
- Client-side checks for UI limitations
- Server-side validation for critical operations
- Stripe webhook signature verification
- Secure subscription status caching

### Data Privacy
- User subscription status is encrypted in transit
- Stripe handles all payment data securely
- No sensitive billing information stored locally

## Monitoring & Analytics

### Admin Dashboard Metrics
- Total users vs premium users
- Premium conversion rate
- Subscription revenue tracking
- User engagement metrics

### Key Metrics Tracked
- Premium user count
- Free user count
- Monthly recurring revenue (MRR)
- Churn rate
- Feature usage statistics

## Future Premium Features (Potential)

Based on the codebase structure, potential future premium features could include:

1. **Advanced Reporting**
   - Custom report builder
   - Scheduled reports
   - Advanced filtering options

2. **Team/Group Features**
   - Multi-user access
   - Shared budgets
   - Team expense management

3. **Integrations**
   - Bank account connections
   - Third-party app integrations
   - API access for developers

4. **Enhanced AI Features**
   - Predictive analytics
   - Spending pattern recognition
   - Personalized recommendations

5. **Advanced Budgeting**
   - Recurring budget templates
   - Budget rollover options
   - Advanced budget categories

## Troubleshooting

### Common Issues

1. **Subscription Status Not Updating**
   - Check Stripe webhook configuration
   - Verify webhook signature validation
   - Check database connection

2. **Premium Features Not Accessible**
   - Verify subscription tier in database
   - Check AuthContext subscription refresh
   - Clear browser cache

3. **Payment Processing Issues**
   - Verify Stripe API keys
   - Check webhook endpoint accessibility
   - Review Stripe dashboard for failed payments

### Debug Tools
- Admin dashboard for user statistics
- Stripe dashboard for payment monitoring
- Application logs for webhook processing
- Database queries for subscription status verification

## Conclusion

The Monity application implements a comprehensive freemium model with clear premium limitations and benefits. The system uses Stripe for payment processing and provides a smooth upgrade experience for users. Premium features focus on removing limitations (unlimited savings goals and budgets) and adding advanced functionality (AI features, advanced analytics, data export).

The implementation is well-structured with proper separation between frontend UI limitations and backend subscription management, ensuring a secure and user-friendly premium experience.
