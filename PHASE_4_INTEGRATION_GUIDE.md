# Phase 4: Integration & Testing Guide

**Status:** In Progress
**Created:** 2025-12-01
**Purpose:** Step-by-step guide for integrating all Phase 1-3 components and running comprehensive tests

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Critical Integrations](#critical-integrations)
3. [Database Migration](#database-migration)
4. [Stripe Configuration](#stripe-configuration)
5. [Smart Prompt Integration](#smart-prompt-integration)
6. [Premium Feature Card Placement](#premium-feature-card-placement)
7. [Testing Checklist](#testing-checklist)
8. [Performance Optimization](#performance-optimization)
9. [Launch Readiness](#launch-readiness)

---

## Prerequisites

Before starting Phase 4 integration, ensure:

- ✅ All Phase 1-3 components are built and tested
- ✅ Build passes without errors (`npm run build` successful)
- ✅ Development environment is running
- ✅ Database access credentials are available
- ✅ Stripe account is configured and active
- ✅ Analytics tracking is set up and verified

---

## Critical Integrations

### Priority 1: Database Migration (BLOCKING)

**⚠️ CRITICAL:** Nothing works until this migration is executed.

### Priority 2: Stripe Trial URL (BLOCKING)

**⚠️ CRITICAL:** Premium conversion flow won't work without this.

### Priority 3: Smart Prompt Triggers (HIGH)

**🔥 HIGH IMPACT:** Drives premium conversions.

### Priority 4: Premium Feature Cards (HIGH)

**🔥 HIGH IMPACT:** Teases premium features to free users.

---

## 1. Database Migration

### Step 1: Review Migration File

**File:** `/backend/migrations/create_onboarding_tables.sql`

This migration creates:
- `user_onboarding` table
- `feature_discovery` table
- `premium_prompt_history` table
- `premium_trials` table
- Helper functions (`should_show_onboarding`, `get_or_create_onboarding`, `mark_feature_discovered`, `should_show_premium_prompt`)

### Step 2: Execute Migration

#### Option A: Using psql Command Line

```bash
# Navigate to backend directory
cd /Users/leostuart/Downloads/Monity-All/Monity/backend

# Execute migration (replace with your actual DB credentials)
psql -h YOUR_SUPABASE_HOST \
     -U YOUR_DB_USER \
     -d YOUR_DB_NAME \
     -f migrations/create_onboarding_tables.sql
```

#### Option B: Using Supabase Dashboard

1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `create_onboarding_tables.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify success (should see "Success. No rows returned")

#### Option C: Using Database Client (DBeaver, pgAdmin, etc.)

1. Connect to your Supabase database
2. Open SQL query window
3. Copy and paste migration file contents
4. Execute
5. Verify tables were created

### Step 3: Verify Migration Success

Run this query to verify all tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_onboarding',
    'feature_discovery',
    'premium_prompt_history',
    'premium_trials'
  );
```

Should return 4 rows.

Verify helper functions exist:

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_type = 'FUNCTION'
  AND routine_name IN (
    'should_show_onboarding',
    'get_or_create_onboarding',
    'mark_feature_discovered',
    'should_show_premium_prompt'
  );
```

Should return 4 rows.

### Step 4: Test Database Endpoints

After migration, test the onboarding endpoints:

```bash
# Get onboarding progress (should create new record if not exists)
curl -X GET http://localhost:5000/api/v1/onboarding/progress \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return:
# {
#   "success": true,
#   "data": {
#     "user_id": "...",
#     "onboarding_completed": false,
#     "current_step": 1,
#     "steps_completed": [],
#     "checklist_progress": {}
#   }
# }
```

---

## 2. Stripe Configuration

### Step 1: Create Stripe Trial Checkout Link

#### Via Stripe Dashboard:

1. Go to Stripe Dashboard → Products
2. Find your "Premium" product
3. Click "Create payment link"
4. Configure:
   - **Name:** "Monity Premium - 7 Day Trial"
   - **Price:** Your premium price (e.g., R$29.90/month)
   - **Trial period:** 7 days
   - **Description:** "Get full access to Monity Premium features with a 7-day free trial. No credit card required."
5. Set Success URL: `https://yourdomain.com/welcome-premium?trial=success`
6. Set Cancel URL: `https://yourdomain.com/subscription?trial=cancelled`
7. Click "Create link"
8. Copy the generated URL (format: `https://buy.stripe.com/...`)

### Step 2: Update Frontend Code

**File:** `/frontend/src/components/navigation/EnhancedSubscription.jsx`

Find line 47 and replace placeholder URL:

```javascript
// BEFORE (line 47)
const STRIPE_TRIAL_CHECKOUT_URL = 'https://buy.stripe.com/REPLACE_WITH_YOUR_TRIAL_LINK';

// AFTER
const STRIPE_TRIAL_CHECKOUT_URL = 'https://buy.stripe.com/YOUR_ACTUAL_TRIAL_LINK_HERE';
```

### Step 3: Update Premium Prompt Component

**File:** `/frontend/src/components/premium/SmartUpgradePrompt.jsx`

Find line ~200 and update trial URL:

```javascript
// BEFORE
const TRIAL_URL = 'https://buy.stripe.com/REPLACE_WITH_YOUR_TRIAL_LINK';

// AFTER
const TRIAL_URL = 'https://buy.stripe.com/YOUR_ACTUAL_TRIAL_LINK_HERE';
```

### Step 4: Test Trial Flow

1. Open `/subscription?trial=true` in browser
2. Verify "Comece seu teste grátis de 7 dias" heading appears
3. Click "Começar Teste Grátis" button
4. Should redirect to Stripe Checkout
5. Verify trial information is displayed in Stripe UI

---

## 3. Smart Prompt Integration

Smart upgrade prompts need to be triggered at specific moments in the user journey. Here's where to add each trigger:

### Trigger 1: Transaction Limit (10+ transactions)

**File to modify:** `/frontend/src/components/transactions/TransactionList.jsx` (or equivalent)

**Add this code:**

```javascript
import { useSmartUpgradePrompt } from '../premium/SmartUpgradePrompt';

const TransactionList = () => {
  const { showPrompt } = useSmartUpgradePrompt();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const checkTransactionCount = async () => {
      // If user is not premium and has 10+ transactions this month
      const currentMonthTransactions = transactions.filter(t =>
        new Date(t.date).getMonth() === new Date().getMonth()
      );

      if (currentMonthTransactions.length >= 10) {
        await showPrompt('transaction_limit', {
          transaction_count: currentMonthTransactions.length,
          source: 'transaction_list'
        });
      }
    };

    if (transactions.length > 0) {
      checkTransactionCount();
    }
  }, [transactions]);

  // ... rest of component
};
```

### Trigger 2: Budget Limit (3+ budgets)

**File to modify:** `/frontend/src/components/budgets/BudgetList.jsx` (or equivalent)

**Add this code:**

```javascript
import { useSmartUpgradePrompt } from '../premium/SmartUpgradePrompt';

const BudgetList = () => {
  const { showPrompt } = useSmartUpgradePrompt();
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    const checkBudgetCount = async () => {
      if (budgets.length >= 3) {
        await showPrompt('budget_limit', {
          budget_count: budgets.length,
          source: 'budget_list'
        });
      }
    };

    if (budgets.length > 0) {
      checkBudgetCount();
    }
  }, [budgets]);

  // ... rest of component
};
```

### Trigger 3: AI Feature Access

**File to modify:** `/frontend/src/components/ai/AIAssistant.jsx` (or equivalent)

**Add this code:**

```javascript
import { useSmartUpgradePrompt } from '../premium/SmartUpgradePrompt';

const AIAssistant = () => {
  const { showPrompt } = useSmartUpgradePrompt();

  const handleAIFeatureClick = async () => {
    // Check if user is free tier
    const userTier = localStorage.getItem('subscription_tier') || 'free';

    if (userTier === 'free') {
      await showPrompt('ai_feature', {
        feature_name: 'AI Categorization',
        source: 'ai_assistant'
      });
      return; // Don't allow access
    }

    // Allow premium users to proceed
    // ... rest of AI logic
  };

  // ... rest of component
};
```

### Trigger 4: Week 1 Active User

**File to modify:** `/frontend/src/components/dashboard/EnhancedDashboard.jsx`

**Add this code:**

```javascript
import { useSmartUpgradePrompt } from '../premium/SmartUpgradePrompt';

const EnhancedDashboard = () => {
  const { showPrompt } = useSmartUpgradePrompt();

  useEffect(() => {
    const checkWeek1Active = async () => {
      const userCreatedAt = localStorage.getItem('user_created_at');
      if (!userCreatedAt) return;

      const accountAge = Date.now() - new Date(userCreatedAt).getTime();
      const daysOld = accountAge / (1000 * 60 * 60 * 24);

      // Show after 7 days of account creation
      if (daysOld >= 7 && daysOld <= 10) {
        const hasSeenWeek1Prompt = localStorage.getItem('week1_prompt_shown');
        if (!hasSeenWeek1Prompt) {
          await showPrompt('week_1_active', {
            days_active: Math.floor(daysOld),
            source: 'dashboard'
          });
          localStorage.setItem('week1_prompt_shown', 'true');
        }
      }
    };

    checkWeek1Active();
  }, []);

  // ... rest of component
};
```

### Trigger 5: High Transaction Volume (50+ transactions)

**File to modify:** `/frontend/src/components/transactions/TransactionList.jsx`

**Add this code (in addition to Trigger 1):**

```javascript
useEffect(() => {
  const checkHighVolume = async () => {
    if (transactions.length >= 50) {
      await showPrompt('high_transaction_volume', {
        total_transactions: transactions.length,
        source: 'transaction_list'
      });
    }
  };

  if (transactions.length > 0) {
    checkHighVolume();
  }
}, [transactions]);
```

### Trigger 6: Advanced Feature Exploration

**File to modify:** `/frontend/src/components/cashflow/CashFlowPage.jsx` (or equivalent)

**Add this code:**

```javascript
import { useSmartUpgradePrompt } from '../premium/SmartUpgradePrompt';

const CashFlowPage = () => {
  const { showPrompt } = useSmartUpgradePrompt();

  useEffect(() => {
    const checkAdvancedFeature = async () => {
      const userTier = localStorage.getItem('subscription_tier') || 'free';

      if (userTier === 'free') {
        await showPrompt('advanced_feature_exploration', {
          feature_name: 'Cash Flow Analysis',
          source: 'cashflow_page'
        });
      }
    };

    checkAdvancedFeature();
  }, []);

  // ... rest of component
};
```

---

## 4. Premium Feature Card Placement

Replace premium features with `PremiumFeatureCard` component for free tier users.

### Import Statement

Add this to the top of each file where you place premium cards:

```javascript
import { PremiumFeatureCard } from '../premium';
```

### Location 1: Cash Flow Page

**File:** `/frontend/src/components/cashflow/CashFlowPage.jsx`

**Replace entire page content for free users:**

```javascript
const CashFlowPage = () => {
  const userTier = localStorage.getItem('subscription_tier') || 'free';

  if (userTier === 'free') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PremiumFeatureCard
          featureId="cash_flow"
          variant="full_page"
        />
      </div>
    );
  }

  // Show actual cash flow for premium users
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Actual cash flow content */}
    </div>
  );
};
```

### Location 2: AI Assistant (Message Limit)

**File:** `/frontend/src/components/ai/AIAssistant.jsx`

**After 3 messages for free users:**

```javascript
const AIAssistant = () => {
  const [messageCount, setMessageCount] = useState(0);
  const userTier = localStorage.getItem('subscription_tier') || 'free';

  const handleSendMessage = async (message) => {
    // Increment message count
    const newCount = messageCount + 1;
    setMessageCount(newCount);

    // Show premium card after 3 messages for free users
    if (userTier === 'free' && newCount >= 3) {
      return (
        <PremiumFeatureCard
          featureId="ai_categorization"
          variant="inline"
        />
      );
    }

    // Process message for premium users or under limit
    // ... rest of logic
  };

  // ... rest of component
};
```

### Location 3: Advanced Budgets

**File:** `/frontend/src/components/budgets/BudgetForm.jsx`

**When creating 4th budget:**

```javascript
const BudgetForm = () => {
  const [existingBudgets, setExistingBudgets] = useState([]);
  const userTier = localStorage.getItem('subscription_tier') || 'free';

  const handleCreateBudget = async () => {
    // Check budget limit for free users
    if (userTier === 'free' && existingBudgets.length >= 3) {
      return (
        <PremiumFeatureCard
          featureId="unlimited_budgets"
          variant="modal"
        />
      );
    }

    // Allow budget creation
    // ... rest of logic
  };

  // ... rest of component
};
```

### Location 4: Financial Projections

**File:** `/frontend/src/components/projections/FinancialProjections.jsx`

**Replace entire page for free users:**

```javascript
const FinancialProjections = () => {
  const userTier = localStorage.getItem('subscription_tier') || 'free';

  if (userTier === 'free') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PremiumFeatureCard
          featureId="financial_projections"
          variant="full_page"
        />
      </div>
    );
  }

  // Show actual projections for premium users
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Actual projections content */}
    </div>
  );
};
```

### Location 5: Investment Calculator

**File:** `/frontend/src/components/tools/InvestmentCalculator.jsx`

**Replace entire page for free users:**

```javascript
const InvestmentCalculator = () => {
  const userTier = localStorage.getItem('subscription_tier') || 'free';

  if (userTier === 'free') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PremiumFeatureCard
          featureId="investment_calculator"
          variant="full_page"
        />
      </div>
    );
  }

  // Show actual calculator for premium users
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Actual calculator content */}
    </div>
  );
};
```

### Location 6: Multi-Currency Support

**File:** `/frontend/src/components/settings/CurrencySettings.jsx`

**Show premium card when trying to add 2nd currency:**

```javascript
const CurrencySettings = () => {
  const [currencies, setCurrencies] = useState(['BRL']);
  const userTier = localStorage.getItem('subscription_tier') || 'free';

  const handleAddCurrency = () => {
    if (userTier === 'free' && currencies.length >= 1) {
      return (
        <PremiumFeatureCard
          featureId="multi_currency"
          variant="modal"
        />
      );
    }

    // Allow adding currency
    // ... rest of logic
  };

  // ... rest of component
};
```

### Location 7: Priority Support Badge

**File:** `/frontend/src/components/support/SupportPage.jsx`

**Show badge for premium users:**

```javascript
const SupportPage = () => {
  const userTier = localStorage.getItem('subscription_tier') || 'free';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {userTier === 'free' && (
        <div className="mb-6">
          <PremiumFeatureCard
            featureId="priority_support"
            variant="banner"
          />
        </div>
      )}

      {/* Rest of support page */}
    </div>
  );
};
```

---

## 5. Testing Checklist

### End-to-End User Journey Testing

#### Test 1: New Visitor → Demo Exploration

**Steps:**
1. Open browser in incognito mode
2. Navigate to `http://localhost:3000/dashboard` (or your domain)
3. ✅ Verify `WelcomeHeroOverlay` appears
4. ✅ Verify analytics event `hero_overlay_viewed` fires
5. Click "Explorar Demo"
6. ✅ Verify demo mode activates (see demo data)
7. ✅ Verify analytics event `demo_mode_activated` fires
8. ✅ Verify demo badge appears in top navigation
9. ✅ Verify 30 demo transactions are visible
10. ✅ Verify demo budgets and goals appear
11. After 10 seconds, verify hero auto-dismisses
12. ✅ Verify `SocialProofBanner` appears at bottom

#### Test 2: Demo → Signup Flow

**Steps:**
1. Continue from Test 1 (in demo mode)
2. Click "Começar Grátis" in social proof banner
3. ✅ Verify redirects to `/signup`
4. ✅ Verify analytics event `hero_cta_clicked` fires
5. Complete signup form
6. ✅ Verify account is created
7. ✅ Verify redirects to `/dashboard`
8. ✅ Verify `OnboardingWizard` appears immediately
9. ✅ Verify analytics event `onboarding_started` fires

#### Test 3: Onboarding Wizard Flow

**Steps:**
1. Continue from Test 2 (onboarding wizard visible)

**Step 1: Goal Selection**
2. ✅ Verify Step 1/5 indicator at top
3. Select "Controlar gastos" goal
4. ✅ Verify progress bar updates
5. Click "Continuar"
6. ✅ Verify API call to `/api/v1/onboarding/complete-step` succeeds
7. ✅ Verify analytics event `onboarding_step_completed` fires with `step: 1`

**Step 2: Income Estimation**
8. ✅ Verify Step 2/5 indicator
9. Enter "8500" in income field
10. Click "Continuar"
11. ✅ Verify step completes and advances to step 3

**Step 3: First Transaction (AHA MOMENT)**
12. ✅ Verify Step 3/5 indicator
13. ✅ Verify quick transaction form appears
14. Fill out: Description="Almoço", Amount="45.50", Category="Alimentação"
15. Click "Adicionar"
16. ✅ Verify confetti animation plays 🎉
17. ✅ Verify success message: "Parabéns! Você adicionou sua primeira transação!"
18. ✅ Verify analytics event `first_transaction_added` fires
19. ✅ Verify transaction appears in transaction list
20. Click "Continuar"

**Step 4: Category Preferences**
21. ✅ Verify Step 4/5 indicator
22. Select 3-5 categories (e.g., Alimentação, Transporte, Moradia)
23. Click "Continuar"
24. ✅ Verify selected categories are highlighted

**Step 5: Notification Preferences**
25. ✅ Verify Step 5/5 indicator
26. Toggle email notifications on/off
27. Click "Concluir Onboarding"
28. ✅ Verify confetti animation plays 🎉
29. ✅ Verify analytics event `onboarding_completed` fires
30. ✅ Verify modal closes and dashboard appears
31. ✅ Verify `GettingStartedChecklist` appears in sidebar

#### Test 4: Getting Started Checklist

**Steps:**
1. Continue from Test 3 (dashboard with checklist visible)
2. ✅ Verify checklist shows progress: 2/7 items completed
3. ✅ Verify "Criar sua conta" is checked (auto-complete)
4. ✅ Verify "Adicionar primeira transação" is checked (from onboarding)
5. Click "Criar um orçamento" link
6. ✅ Verify navigates to `/budgets`
7. Create a budget
8. Return to dashboard
9. ✅ Verify checklist updates: 3/7 items completed
10. ✅ Verify analytics event `checklist_item_completed` fires
11. ✅ Verify progress bar animates
12. Click "Set up budget" again
13. ✅ Verify checkmark appears immediately
14. Complete all 7 checklist items
15. ✅ Verify confetti animation when 100% complete
16. ✅ Verify analytics event `checklist_fully_completed` fires
17. ✅ Verify checklist collapses after completion

#### Test 5: Premium Feature Teaser

**Steps:**
1. As free tier user, navigate to Cash Flow page
2. ✅ Verify `PremiumFeatureCard` appears instead of actual content
3. ✅ Verify "Cash Flow Inteligente" title
4. ✅ Verify lock icon is visible
5. ✅ Verify "Premium" badge
6. Click on the locked card
7. ✅ Verify `PremiumFeatureTeaser` modal opens
8. ✅ Verify analytics event `premium_feature_teaser_opened` fires
9. ✅ Verify modal shows:
   - Feature title
   - 3-4 benefit points
   - Screenshots/preview
   - "Economize X horas/mês" highlight
   - Pricing: R$29,90/mês
   - Two CTAs: "Começar Teste Grátis" and "Assinar Agora"
10. Click "Começar Teste Grátis"
11. ✅ Verify analytics event `premium_teaser_cta_clicked` fires
12. ✅ Verify redirects to Stripe trial checkout

#### Test 6: Smart Upgrade Prompts

**Test 6A: Transaction Limit Prompt**
1. As free tier user, add 10 transactions
2. ✅ Verify after 10th transaction, `SmartUpgradePrompt` appears
3. ✅ Verify prompt type: `transaction_limit`
4. ✅ Verify message: "Você está usando muito o Monity!"
5. ✅ Verify analytics event `smart_prompt_shown` fires
6. Click "Agora não"
7. ✅ Verify analytics event `smart_prompt_dismissed` fires
8. ✅ Verify prompt closes
9. Add 11th transaction
10. ✅ Verify prompt does NOT appear (7-day snooze active)

**Test 6B: Week 1 Active Prompt**
1. Modify localStorage: `user_created_at` = 7 days ago
2. Refresh dashboard
3. ✅ Verify `SmartUpgradePrompt` appears with confetti
4. ✅ Verify prompt type: `week_1_active`
5. ✅ Verify message: "Você está arrasando! 🎉"
6. ✅ Verify special trial offer messaging
7. Click "Começar Teste Grátis"
8. ✅ Verify analytics event `smart_prompt_converted` fires
9. ✅ Verify redirects to Stripe trial checkout

**Test 6C: AI Feature Prompt**
1. As free tier user, click on AI Assistant
2. ✅ Verify `SmartUpgradePrompt` appears
3. ✅ Verify prompt type: `ai_feature`
4. ✅ Verify message about AI categorization
5. ✅ Verify "Economize 10h/mês" urgency message

#### Test 7: Subscription Page & Trial Flow

**Test 7A: Normal Subscription Page**
1. Navigate to `/subscription`
2. ✅ Verify two pricing cards: Free and Premium
3. ✅ Verify comparison table with 11 features
4. ✅ Verify 3 testimonials with savings highlights
5. ✅ Verify FAQ section with 6 questions
6. ✅ Verify all accordions expand/collapse correctly
7. Scroll to bottom
8. ✅ Verify final CTA section
9. Click "Começar Teste Grátis" on premium card
10. ✅ Verify redirects to Stripe checkout
11. ✅ Verify analytics event `subscription_cta_clicked` fires

**Test 7B: Trial Flow via URL Parameter**
1. Navigate to `/subscription?trial=true`
2. ✅ Verify heading changes to: "Comece seu teste grátis de 7 dias"
3. ✅ Verify subtitle emphasizes trial
4. ✅ Verify premium card CTA: "Começar Teste Grátis"
5. ✅ Verify trial badge appears on premium card
6. ✅ Verify "Sem cartão necessário" messaging
7. Click CTA
8. ✅ Verify redirects to Stripe trial checkout URL

#### Test 8: Interactive Tour

**Steps:**
1. As new user (clear localStorage), complete onboarding
2. ✅ Verify tour starts automatically after onboarding
3. ✅ Verify analytics event `interactive_tour_started` fires
4. ✅ Verify Step 1/5 spotlight on Dashboard card
5. ✅ Verify overlay with backdrop blur
6. ✅ Verify tooltip with text and "Próximo" button
7. Click "Próximo"
8. ✅ Verify Step 2/5 spotlight on Transactions link
9. Complete all 5 tour steps
10. ✅ Verify analytics event `interactive_tour_completed` fires
11. ✅ Verify tour closes
12. Refresh page
13. ✅ Verify tour does NOT restart (localStorage tracking works)
14. Clear localStorage, refresh
15. ✅ Verify tour restarts

#### Test 9: Analytics Verification

**Steps:**
1. Open browser console
2. Check if `window.analytics` exists
3. Complete Test 1-8 flows
4. ✅ Verify all analytics events fire in console
5. Check your analytics dashboard (if configured)
6. ✅ Verify events are being tracked server-side

**Key Events to Verify:**
- `hero_overlay_viewed`
- `hero_cta_clicked`
- `demo_mode_activated`
- `onboarding_started`
- `onboarding_step_completed` (x5)
- `onboarding_completed`
- `first_transaction_added`
- `checklist_item_completed`
- `checklist_fully_completed`
- `premium_feature_teaser_opened`
- `premium_teaser_cta_clicked`
- `smart_prompt_shown`
- `smart_prompt_dismissed`
- `smart_prompt_converted`
- `subscription_cta_clicked`
- `interactive_tour_started`
- `interactive_tour_completed`

### Backend API Testing

#### Test 10: Onboarding Endpoints

**Endpoint:** `GET /api/v1/onboarding/progress`

```bash
curl -X GET http://localhost:5000/api/v1/onboarding/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ Expected Response:
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "onboarding_completed": false,
    "current_step": 1,
    "steps_completed": [],
    "checklist_progress": {}
  }
}
```

**Endpoint:** `POST /api/v1/onboarding/complete-step`

```bash
curl -X POST http://localhost:5000/api/v1/onboarding/complete-step \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"step": 1, "data": {"goal": "save_money"}}'
```

✅ Expected Response:
```json
{
  "success": true,
  "data": {
    "current_step": 2,
    "progress_percentage": 20
  }
}
```

**Endpoint:** `POST /api/v1/onboarding/complete`

```bash
curl -X POST http://localhost:5000/api/v1/onboarding/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ Expected Response:
```json
{
  "success": true,
  "message": "Onboarding completed successfully"
}
```

**Endpoint:** `POST /api/v1/onboarding/checklist`

```bash
curl -X POST http://localhost:5000/api/v1/onboarding/checklist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"item": "add_first_transaction", "completed": true}'
```

✅ Expected Response:
```json
{
  "success": true,
  "data": {
    "checklist_progress": {
      "add_first_transaction": true
    }
  }
}
```

#### Test 11: Premium Prompt Endpoints

**Endpoint:** `GET /api/v1/premium/should-show-prompt?type=transaction_limit`

```bash
curl -X GET "http://localhost:5000/api/v1/premium/should-show-prompt?type=transaction_limit" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ Expected Response:
```json
{
  "success": true,
  "should_show": true
}
```

**Endpoint:** `POST /api/v1/premium/record-prompt-action`

```bash
curl -X POST http://localhost:5000/api/v1/premium/record-prompt-action \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt_type": "transaction_limit",
    "action_taken": "dismissed",
    "context": {"transaction_count": 10}
  }'
```

✅ Expected Response:
```json
{
  "success": true,
  "message": "Action recorded successfully"
}
```

**Endpoint:** `GET /api/v1/premium/conversion-stats`

```bash
curl -X GET http://localhost:5000/api/v1/premium/conversion-stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ Expected Response:
```json
{
  "success": true,
  "data": {
    "total_prompts_shown": 15,
    "total_conversions": 3,
    "conversion_rate": 0.20,
    "prompt_type_breakdown": { ... }
  }
}
```

#### Test 12: Feature Discovery Endpoints

**Endpoint:** `GET /api/v1/features/schedule`

```bash
curl -X GET http://localhost:5000/api/v1/features/schedule \
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ Expected Response:
```json
{
  "success": true,
  "data": {
    "current_features": [...],
    "upcoming_features": [...]
  }
}
```

**Endpoint:** `POST /api/v1/features/mark-discovered`

```bash
curl -X POST http://localhost:5000/api/v1/features/mark-discovered \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"feature_id": "budgets", "interaction_type": "tooltip_completed"}'
```

✅ Expected Response:
```json
{
  "success": true,
  "message": "Feature marked as discovered"
}
```

---

## 6. Performance Optimization

### Step 1: Run Lighthouse Audit

```bash
# Install Lighthouse globally
npm install -g lighthouse

# Run audit on production build
npm run build
npm run preview  # Vite preview server

# In another terminal
lighthouse http://localhost:4173 --view
```

**Target Scores:**
- ✅ Performance: > 90
- ✅ Accessibility: > 95
- ✅ Best Practices: > 90
- ✅ SEO: > 90

### Step 2: Analyze Bundle Size

```bash
# Install bundle analyzer
npm install --save-dev vite-plugin-visualizer

# Add to vite.config.js
import { visualizer } from 'vite-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ]
});

# Build and open analyzer
npm run build
```

**Target:** Total bundle < 500KB (gzipped)

### Step 3: Code Splitting Optimization

Implement lazy loading for large components:

```javascript
// In App.jsx
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const OnboardingWizard = lazy(() => import('./components/onboarding/OnboardingWizard'));
const EnhancedSubscription = lazy(() => import('./components/navigation/EnhancedSubscription'));
const CashFlowPage = lazy(() => import('./components/cashflow/CashFlowPage'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <OnboardingWizard />
</Suspense>
```

### Step 4: Image Optimization

```bash
# Install image optimization
npm install --save-dev vite-plugin-imagemin

# Add to vite.config.js
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react(),
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      svgo: { plugins: [{ removeViewBox: false }] }
    })
  ]
});
```

### Step 5: Font Optimization

Ensure fonts are loaded efficiently:

```css
/* In your CSS */
@font-face {
  font-family: 'YourFont';
  src: url('/fonts/your-font.woff2') format('woff2');
  font-display: swap; /* Prevent FOIT */
}
```

---

## 7. Cross-Browser & Mobile Testing

### Desktop Browsers

Test in the following browsers:

**Chrome (Latest)**
- ✅ All features work
- ✅ Animations smooth
- ✅ No console errors

**Firefox (Latest)**
- ✅ All features work
- ✅ Animations smooth
- ✅ No console errors

**Safari (Latest)**
- ✅ All features work
- ✅ Backdrop blur works
- ✅ Animations smooth
- ✅ No console errors

**Edge (Latest)**
- ✅ All features work
- ✅ Animations smooth
- ✅ No console errors

### Mobile Browsers

**iOS Safari**
- ✅ Responsive layout works
- ✅ Touch interactions work
- ✅ Modals scroll correctly
- ✅ Animations smooth (60fps)

**Android Chrome**
- ✅ Responsive layout works
- ✅ Touch interactions work
- ✅ Modals scroll correctly
- ✅ Animations smooth

### Responsive Testing

Test at the following breakpoints:

- ✅ 320px (iPhone SE)
- ✅ 375px (iPhone 12/13)
- ✅ 414px (iPhone 12 Pro Max)
- ✅ 768px (iPad)
- ✅ 1024px (iPad Pro)
- ✅ 1280px (Desktop)
- ✅ 1920px (Large Desktop)

---

## 8. Launch Readiness Checklist

### Pre-Launch (DO NOT SKIP)

- [ ] Database migration executed successfully
- [ ] All 4 tables created and verified
- [ ] All 4 helper functions created and verified
- [ ] Stripe trial checkout URL configured
- [ ] Smart prompt triggers integrated in all 6 locations
- [ ] Premium feature cards placed in all 7 locations
- [ ] All End-to-End tests passing (Tests 1-9)
- [ ] All Backend API tests passing (Tests 10-12)
- [ ] Lighthouse score > 90 on all metrics
- [ ] Bundle size < 500KB gzipped
- [ ] Cross-browser testing complete (4 browsers)
- [ ] Mobile testing complete (iOS + Android)
- [ ] Responsive testing complete (7 breakpoints)
- [ ] Analytics tracking verified (20+ events)
- [ ] Error monitoring set up (Sentry or equivalent)
- [ ] Production environment variables configured
- [ ] SSL certificate valid
- [ ] CDN configured (if applicable)

### Launch Day

- [ ] Deploy to production
- [ ] Verify all routes accessible
- [ ] Test one complete user journey in production
- [ ] Monitor error logs for first hour
- [ ] Monitor analytics dashboard
- [ ] Check database for onboarding records being created
- [ ] Verify Stripe webhooks are firing
- [ ] Check premium prompt frequency (not too aggressive)

### Post-Launch (Week 1)

- [ ] Daily analytics review
- [ ] Monitor key metrics:
  - Hero overlay → Demo activation rate (target: > 40%)
  - Demo → Signup conversion rate (target: > 15%)
  - Signup → Onboarding completion rate (target: > 70%)
  - Onboarding → First transaction rate (target: > 80%)
  - Checklist → 50% completion rate (target: > 40%)
  - Premium prompt → Conversion rate (target: > 5%)
- [ ] Gather user feedback
- [ ] Fix any critical bugs immediately
- [ ] Document any issues for Phase 5 optimization

---

## 9. Troubleshooting

### Issue: Onboarding wizard doesn't appear after signup

**Possible causes:**
1. Database migration not executed
2. API endpoint `/api/v1/onboarding/progress` failing
3. Token not being sent in Authorization header

**Fix:**
1. Verify migration executed: Run verification queries from Section 1
2. Check backend logs for errors
3. Check browser console for network errors
4. Verify localStorage has valid token

### Issue: Premium prompts appearing too frequently

**Possible causes:**
1. `dismissed_until` not being set correctly
2. Helper function `should_show_premium_prompt()` not working

**Fix:**
1. Check `premium_prompt_history` table for records
2. Verify `dismissed_until` column has correct 7-day future timestamp
3. Test helper function directly in database:
```sql
SELECT should_show_premium_prompt('user-id-here', 'transaction_limit');
```

### Issue: Stripe trial checkout not working

**Possible causes:**
1. Placeholder URL not replaced
2. Stripe trial link expired
3. Stripe account not activated

**Fix:**
1. Verify actual Stripe URL in `EnhancedSubscription.jsx` line 47
2. Test URL in browser directly
3. Check Stripe dashboard for payment link status

### Issue: Demo data not appearing

**Possible causes:**
1. DemoDataContext not wrapped around App
2. Demo mode not activated
3. LocalStorage blocking demo state

**Fix:**
1. Verify `<DemoDataProvider>` wrapper in `App.jsx`
2. Clear localStorage and try again
3. Check console for errors in `useDemoData` hook

### Issue: Animations janky or slow

**Possible causes:**
1. Too many animations running simultaneously
2. Large bundle size slowing down app
3. Unoptimized images

**Fix:**
1. Reduce animation complexity (fewer moving parts)
2. Run bundle analyzer to find large dependencies
3. Optimize images (use WebP format, compress)
4. Use `will-change` CSS property for animated elements

---

## 10. Next Steps After Phase 4

Once all testing is complete and launch is successful, proceed to:

### Phase 5: Launch & Monitoring

1. **A/B Testing Setup** (Week 2)
   - Test hero overlay variants
   - Test onboarding wizard flows
   - Test premium prompt messaging

2. **Optimization** (Week 3-4)
   - Analyze conversion funnel drop-off points
   - Iterate on low-performing components
   - Improve prompt messaging based on data

3. **Feature Enhancements** (Month 2)
   - Add more demo data scenarios
   - Build mobile app integration
   - Create video tutorials for onboarding

---

## Summary

This integration guide provides step-by-step instructions for:

1. ✅ Executing database migration (CRITICAL)
2. ✅ Configuring Stripe trial URLs (CRITICAL)
3. ✅ Integrating smart prompt triggers in 6 locations
4. ✅ Placing premium feature cards in 7 locations
5. ✅ Running comprehensive tests (12 test suites)
6. ✅ Optimizing performance (Lighthouse > 90, bundle < 500KB)
7. ✅ Cross-browser and mobile testing
8. ✅ Launch readiness checklist

**Estimated Time:** 2-3 days for complete integration and testing

**Priority Order:**
1. Database migration (Day 1 morning)
2. Stripe configuration (Day 1 morning)
3. Smart prompt integration (Day 1 afternoon)
4. Premium card placement (Day 1 afternoon)
5. End-to-end testing (Day 2)
6. Performance optimization (Day 3)
7. Cross-browser testing (Day 3)

Once complete, you'll have a fully integrated, tested, and optimized landing-to-premium conversion flow ready for production launch.
