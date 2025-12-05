# Phase 4: Testing Checklist

**Status:** Ready for Execution
**Created:** 2025-12-01
**Purpose:** Comprehensive testing checklist for all Phase 1-3 features

---

## Quick Navigation

- [Pre-Testing Setup](#pre-testing-setup)
- [Test 1: New Visitor → Demo](#test-1-new-visitor--demo-exploration)
- [Test 2: Demo → Signup](#test-2-demo--signup-flow)
- [Test 3: Onboarding Wizard](#test-3-onboarding-wizard-flow)
- [Test 4: Getting Started Checklist](#test-4-getting-started-checklist)
- [Test 5: Premium Feature Teaser](#test-5-premium-feature-teaser)
- [Test 6: Smart Upgrade Prompts](#test-6-smart-upgrade-prompts)
- [Test 7: Subscription Page](#test-7-subscription-page--trial-flow)
- [Test 8: Interactive Tour](#test-8-interactive-tour)
- [Test 9: Analytics](#test-9-analytics-verification)
- [Test 10-12: Backend APIs](#backend-api-testing)
- [Performance Tests](#performance-testing)
- [Browser Compatibility](#browser-compatibility-testing)
- [Mobile Testing](#mobile-testing)

---

## Pre-Testing Setup

Before starting any tests, ensure:

### 1. Database Migration Executed
```bash
# Verify tables exist
psql -d YOUR_DB -c "SELECT table_name FROM information_schema.tables WHERE table_name IN ('user_onboarding', 'feature_discovery', 'premium_prompt_history', 'premium_trials');"
```
- [ ] Returns 4 rows (all tables exist)

### 2. Development Server Running
```bash
cd frontend
npm start
```
- [ ] Frontend running on http://localhost:3000

```bash
cd backend
npm start
```
- [ ] Backend running on http://localhost:5000

### 3. Clear Browser State
- [ ] Open Chrome DevTools → Application → Storage → "Clear site data"
- [ ] Or use Incognito/Private browsing mode

### 4. Prepare Analytics Monitoring
- [ ] Open browser console (F12)
- [ ] Verify `window.analytics` exists
- [ ] Prepare spreadsheet to track events

---

## Test 1: New Visitor → Demo Exploration

**Purpose:** Test first-time visitor experience with hero overlay and demo mode

### Setup
- [ ] Open browser in incognito mode
- [ ] Clear all localStorage
- [ ] Navigate to `/dashboard` (unauthenticated)

### Execution Steps

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Page loads | `WelcomeHeroOverlay` appears full-screen | [ ] |
| 2 | Check console | Event `hero_overlay_viewed` fires | [ ] |
| 3 | Visual check | Glassmorphism effect visible | [ ] |
| 4 | Visual check | Two gradient orbs animating | [ ] |
| 5 | Visual check | Heading: "Gerencie suas finanças de forma inteligente" | [ ] |
| 6 | Visual check | Two CTAs: "Começar Grátis" + "Explorar Demo" | [ ] |
| 7 | Visual check | Auto-dismiss countdown: "10...9...8..." | [ ] |
| 8 | Click | "Explorar Demo" button | [ ] |
| 9 | Check console | Event `demo_mode_activated` fires | [ ] |
| 10 | Hero dismisses | Hero overlay closes with animation | [ ] |
| 11 | Visual check | Demo badge appears in top navigation | [ ] |
| 12 | Visual check | Demo transactions appear (30 items) | [ ] |
| 13 | Visual check | Demo balance shows: R$ 3.250,00 | [ ] |
| 14 | Visual check | Demo monthly income: R$ 8.500,00 | [ ] |
| 15 | Check transactions | First transaction: "Supermercado Extra" | [ ] |
| 16 | Visual check | All amounts in Brazilian Real (R$) | [ ] |
| 17 | Visual check | All text in Portuguese | [ ] |
| 18 | Wait 10 seconds | `SocialProofBanner` appears at bottom | [ ] |
| 19 | Visual check | Banner shows: "15.000+ usuários" | [ ] |
| 20 | Visual check | "5 estrelas" rating visible | [ ] |

### Post-Test Verification
- [ ] LocalStorage has `monity_demo_active: true`
- [ ] LocalStorage has `monity_hero_shown: true`
- [ ] Refresh page → Hero does NOT appear again
- [ ] Demo data persists after refresh

---

## Test 2: Demo → Signup Flow

**Purpose:** Test conversion from demo mode to signup

### Setup
- [ ] Continue from Test 1 (in demo mode)

### Execution Steps

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Visual check | `SocialProofBanner` visible at bottom | [ ] |
| 2 | Click | "Começar Grátis" button in banner | [ ] |
| 3 | Check console | Event `hero_cta_clicked` fires | [ ] |
| 4 | Navigation | Redirects to `/signup` | [ ] |
| 5 | Visual check | Signup form appears | [ ] |
| 6 | Fill form | Name: "Test User" | [ ] |
| 7 | Fill form | Email: "test@example.com" | [ ] |
| 8 | Fill form | Password: "TestPass123!" | [ ] |
| 9 | Click | "Criar Conta" button | [ ] |
| 10 | Wait | Account creation processes | [ ] |
| 11 | Check backend | User created in database | [ ] |
| 12 | Check localStorage | Auth token saved | [ ] |
| 13 | Navigation | Redirects to `/dashboard` | [ ] |
| 14 | Visual check | User is now authenticated | [ ] |

### Post-Test Verification
- [ ] User exists in `profiles` table
- [ ] `user_onboarding` record auto-created
- [ ] Demo badge disappears (real user now)

---

## Test 3: Onboarding Wizard Flow

**Purpose:** Test complete 5-step onboarding wizard with AHA moment

### Setup
- [ ] Continue from Test 2 (just signed up)

### Execution Steps

#### Wizard Appears

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Page loads | `OnboardingWizard` appears full-screen | [ ] |
| 2 | Check console | Event `onboarding_started` fires | [ ] |
| 3 | Visual check | Progress: "Passo 1 de 5" | [ ] |
| 4 | Visual check | Progress bar shows 20% | [ ] |
| 5 | Visual check | "Pular" button in top right | [ ] |

#### Step 1: Goal Selection

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 6 | Visual check | Heading: "Qual é seu principal objetivo?" | [ ] |
| 7 | Visual check | 4 goal options displayed | [ ] |
| 8 | Click | "Controlar gastos" option | [ ] |
| 9 | Visual check | Option highlights with checkmark | [ ] |
| 10 | Click | "Continuar" button | [ ] |
| 11 | Check network | API call to `/api/v1/onboarding/complete-step` | [ ] |
| 12 | Check console | Event `onboarding_step_completed` (step: 1) | [ ] |
| 13 | Animation | Slides to Step 2 | [ ] |

#### Step 2: Income Estimation

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 14 | Visual check | Progress: "Passo 2 de 5" | [ ] |
| 15 | Visual check | Progress bar shows 40% | [ ] |
| 16 | Visual check | Heading: "Qual é sua renda mensal estimada?" | [ ] |
| 17 | Input | Enter "8500" | [ ] |
| 18 | Visual check | Formats to "R$ 8.500,00" | [ ] |
| 19 | Click | "Continuar" button | [ ] |
| 20 | Check network | API call with income data | [ ] |
| 21 | Check console | Event `onboarding_step_completed` (step: 2) | [ ] |
| 22 | Animation | Slides to Step 3 | [ ] |

#### Step 3: First Transaction (AHA MOMENT)

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 23 | Visual check | Progress: "Passo 3 de 5" | [ ] |
| 24 | Visual check | Progress bar shows 60% | [ ] |
| 25 | Visual check | Heading: "Adicione sua primeira transação" | [ ] |
| 26 | Visual check | Quick transaction form appears | [ ] |
| 27 | Input | Description: "Almoço" | [ ] |
| 28 | Input | Amount: "45.50" | [ ] |
| 29 | Select | Category: "Alimentação" | [ ] |
| 30 | Click | "Adicionar" button | [ ] |
| 31 | Animation | Confetti animation plays 🎉 | [ ] |
| 32 | Visual check | Success message appears | [ ] |
| 33 | Check console | Event `first_transaction_added` fires | [ ] |
| 34 | Check network | Transaction created via API | [ ] |
| 35 | Visual check | Transaction appears in mini-list | [ ] |
| 36 | Click | "Continuar" button | [ ] |
| 37 | Check console | Event `onboarding_step_completed` (step: 3) | [ ] |
| 38 | Animation | Slides to Step 4 | [ ] |

#### Step 4: Category Preferences

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 39 | Visual check | Progress: "Passo 4 de 5" | [ ] |
| 40 | Visual check | Progress bar shows 80% | [ ] |
| 41 | Visual check | Heading: "Escolha suas categorias favoritas" | [ ] |
| 42 | Visual check | 10+ category chips displayed | [ ] |
| 43 | Click | "Alimentação" chip | [ ] |
| 44 | Visual check | Chip highlights/fills | [ ] |
| 45 | Click | "Transporte" chip | [ ] |
| 46 | Click | "Moradia" chip | [ ] |
| 47 | Visual check | 3 categories selected | [ ] |
| 48 | Click | "Continuar" button | [ ] |
| 49 | Check network | API call with categories array | [ ] |
| 50 | Check console | Event `onboarding_step_completed` (step: 4) | [ ] |
| 51 | Animation | Slides to Step 5 | [ ] |

#### Step 5: Notification Preferences

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 52 | Visual check | Progress: "Passo 5 de 5" | [ ] |
| 53 | Visual check | Progress bar shows 100% | [ ] |
| 54 | Visual check | Heading: "Configurar notificações" | [ ] |
| 55 | Visual check | Email toggle switch visible | [ ] |
| 56 | Click | Toggle email notifications ON | [ ] |
| 57 | Visual check | Toggle animates to ON state | [ ] |
| 58 | Click | "Concluir Onboarding" button | [ ] |
| 59 | Animation | Confetti animation plays 🎉 | [ ] |
| 60 | Check network | API call to `/api/v1/onboarding/complete` | [ ] |
| 61 | Check console | Event `onboarding_completed` fires | [ ] |
| 62 | Animation | Wizard fades out and closes | [ ] |
| 63 | Visual check | Dashboard fully visible | [ ] |

### Post-Test Verification
- [ ] Database: `user_onboarding.onboarding_completed = true`
- [ ] Database: `user_onboarding.completed_at` has timestamp
- [ ] Database: All 5 steps in `steps_completed` array
- [ ] First transaction exists in `transactions` table
- [ ] Refresh page → Wizard does NOT appear again

---

## Test 4: Getting Started Checklist

**Purpose:** Test checklist functionality and progress tracking

### Setup
- [ ] Continue from Test 3 (onboarding complete)

### Execution Steps

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Visual check | `GettingStartedChecklist` visible in sidebar | [ ] |
| 2 | Visual check | Heading: "Primeiros Passos" | [ ] |
| 3 | Visual check | Progress shows "2/7 completos" | [ ] |
| 4 | Visual check | Progress bar shows ~29% | [ ] |
| 5 | Visual check | "Criar sua conta" has checkmark ✓ | [ ] |
| 6 | Visual check | "Adicionar primeira transação" has checkmark ✓ | [ ] |
| 7 | Visual check | 5 remaining items unchecked | [ ] |
| 8 | Click | "Criar um orçamento" link | [ ] |
| 9 | Navigation | Redirects to `/budgets` | [ ] |
| 10 | Create budget | Name: "Casa", Amount: 3000 | [ ] |
| 11 | Click | Save budget | [ ] |
| 12 | Navigation | Return to dashboard | [ ] |
| 13 | Visual check | Checklist updates to "3/7 completos" | [ ] |
| 14 | Check console | Event `checklist_item_completed` fires | [ ] |
| 15 | Visual check | "Criar um orçamento" now has checkmark ✓ | [ ] |
| 16 | Animation | Checkmark animates in | [ ] |
| 17 | Visual check | Progress bar animates to ~43% | [ ] |

#### Complete All Remaining Items

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 18 | Complete | "Definir meta de economia" | [ ] |
| 19 | Complete | "Explorar categorização IA" | [ ] |
| 20 | Complete | "Criar ou participar de grupo" | [ ] |
| 21 | Complete | "Baixar relatório" | [ ] |
| 22 | Visual check | Progress shows "7/7 completos" | [ ] |
| 23 | Visual check | Progress bar shows 100% | [ ] |
| 24 | Animation | Confetti animation plays 🎉 | [ ] |
| 25 | Check console | Event `checklist_fully_completed` fires | [ ] |
| 26 | Animation | Checklist collapses with smooth transition | [ ] |
| 27 | Visual check | "Ver novamente" link appears | [ ] |

### Post-Test Verification
- [ ] Database: `checklist_progress` has all 7 items marked true
- [ ] All checkmarks persist after page refresh
- [ ] Clicking "Ver novamente" expands checklist

---

## Test 5: Premium Feature Teaser

**Purpose:** Test locked feature cards and benefit modals

### Setup
- [ ] Login as free tier user
- [ ] Navigate to Cash Flow page

### Execution Steps

#### Locked Feature Card

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Page loads | `PremiumFeatureCard` appears instead of content | [ ] |
| 2 | Visual check | Lock icon visible | [ ] |
| 3 | Visual check | "Premium" badge visible | [ ] |
| 4 | Visual check | Title: "Cash Flow Inteligente" | [ ] |
| 5 | Visual check | Blur overlay effect on background | [ ] |
| 6 | Visual check | "Ver Benefícios Premium" button | [ ] |
| 7 | Hover | Card has hover effect (lift + glow) | [ ] |

#### Feature Teaser Modal

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 8 | Click | Anywhere on locked card | [ ] |
| 9 | Check console | Event `premium_feature_teaser_opened` fires | [ ] |
| 10 | Animation | Modal slides up from bottom | [ ] |
| 11 | Visual check | Modal has glassmorphism backdrop | [ ] |
| 12 | Visual check | Feature icon (large) | [ ] |
| 13 | Visual check | Feature title: "Cash Flow Inteligente" | [ ] |
| 14 | Visual check | 4 benefit points with checkmarks | [ ] |
| 15 | Visual check | "Economize X horas/mês" highlight box | [ ] |
| 16 | Visual check | Screenshot/preview of feature | [ ] |
| 17 | Visual check | Pricing: "R$ 29,90/mês" | [ ] |
| 18 | Visual check | Two CTA buttons visible | [ ] |
| 19 | Visual check | Primary: "Começar Teste Grátis" | [ ] |
| 20 | Visual check | Secondary: "Assinar Agora" | [ ] |
| 21 | Click | "Começar Teste Grátis" | [ ] |
| 22 | Check console | Event `premium_teaser_cta_clicked` fires | [ ] |
| 23 | Navigation | Redirects to Stripe checkout | [ ] |

#### Test All 7 Premium Features

| Feature | Card Appears | Modal Works | Status |
|---------|-------------|-------------|--------|
| Cash Flow | [ ] | [ ] | [ ] |
| AI Categorization | [ ] | [ ] | [ ] |
| Unlimited Budgets | [ ] | [ ] | [ ] |
| Financial Projections | [ ] | [ ] | [ ] |
| Investment Calculator | [ ] | [ ] | [ ] |
| Multi-Currency | [ ] | [ ] | [ ] |
| Priority Support | [ ] | [ ] | [ ] |

### Post-Test Verification
- [ ] All modals have unique content
- [ ] All CTAs redirect correctly
- [ ] Analytics events fire for each feature
- [ ] Close button (X) works on all modals

---

## Test 6: Smart Upgrade Prompts

**Purpose:** Test contextual upgrade prompts with snooze functionality

### Test 6A: Transaction Limit Prompt

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Setup | Login as free user with 9 transactions | [ ] |
| 2 | Add | 10th transaction | [ ] |
| 3 | Wait | 2 seconds | [ ] |
| 4 | Visual check | `SmartUpgradePrompt` modal appears | [ ] |
| 5 | Check console | Event `smart_prompt_shown` (type: transaction_limit) | [ ] |
| 6 | Visual check | Title: "Você está usando muito o Monity!" | [ ] |
| 7 | Visual check | Subtitle: "Já registrou 10 transações este mês" | [ ] |
| 8 | Visual check | Urgency: "Economize tempo com IA" | [ ] |
| 9 | Visual check | Three buttons: Snooze, Dismiss, Upgrade | [ ] |
| 10 | Click | "Agora não" (dismiss) button | [ ] |
| 11 | Check console | Event `smart_prompt_dismissed` fires | [ ] |
| 12 | Check network | API call to `/api/v1/premium/record-prompt-action` | [ ] |
| 13 | Animation | Prompt fades out | [ ] |

#### Verify 7-Day Snooze

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 14 | Add | 11th transaction | [ ] |
| 15 | Wait | 5 seconds | [ ] |
| 16 | Visual check | Prompt does NOT appear | [ ] |
| 17 | Check DB | `dismissed_until` = 7 days in future | [ ] |
| 18 | Check network | API call to `/api/v1/premium/should-show-prompt` | [ ] |
| 19 | Check response | `should_show: false` | [ ] |

### Test 6B: Week 1 Active User Prompt

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Setup | Modify localStorage: `user_created_at` = 7 days ago | [ ] |
| 2 | Refresh | Dashboard page | [ ] |
| 3 | Visual check | `SmartUpgradePrompt` appears with confetti 🎉 | [ ] |
| 4 | Check console | Event `smart_prompt_shown` (type: week_1_active) | [ ] |
| 5 | Visual check | Title: "Você está arrasando! 🎉" | [ ] |
| 6 | Visual check | Celebration message for 1 week active | [ ] |
| 7 | Visual check | Urgency: "Oferta especial: 7 dias grátis" | [ ] |
| 8 | Visual check | Special styling (gradient border) | [ ] |
| 9 | Click | "Começar Teste Grátis" button | [ ] |
| 10 | Check console | Event `smart_prompt_converted` fires | [ ] |
| 11 | Navigation | Redirects to Stripe trial checkout | [ ] |

### Test 6C: AI Feature Prompt

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Setup | Login as free user | [ ] |
| 2 | Navigate | To AI Assistant page | [ ] |
| 3 | Visual check | `SmartUpgradePrompt` appears immediately | [ ] |
| 4 | Check console | Event `smart_prompt_shown` (type: ai_feature) | [ ] |
| 5 | Visual check | Title about AI categorization | [ ] |
| 6 | Visual check | Urgency: "Economize 10h/mês" | [ ] |
| 7 | Visual check | Feature preview/demo | [ ] |

#### Test All 6 Prompt Types

| Prompt Type | Trigger | Appears | Analytics | Status |
|-------------|---------|---------|-----------|--------|
| transaction_limit | 10 transactions | [ ] | [ ] | [ ] |
| budget_limit | 3 budgets | [ ] | [ ] | [ ] |
| ai_feature | Access AI page | [ ] | [ ] | [ ] |
| week_1_active | 7 days old account | [ ] | [ ] | [ ] |
| high_transaction_volume | 50 transactions | [ ] | [ ] | [ ] |
| advanced_feature_exploration | Access premium page | [ ] | [ ] | [ ] |

### Post-Test Verification
- [ ] Each prompt has unique messaging
- [ ] All prompts respect 7-day snooze
- [ ] Premium users never see prompts
- [ ] Analytics events fire correctly
- [ ] Database records created in `premium_prompt_history`

---

## Test 7: Subscription Page & Trial Flow

**Purpose:** Test subscription page and trial checkout flow

### Test 7A: Normal Subscription Page

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Navigate | To `/subscription` | [ ] |
| 2 | Visual check | Two pricing cards: Free & Premium | [ ] |
| 3 | Visual check | Free card: "R$ 0" price | [ ] |
| 4 | Visual check | Premium card: "R$ 29,90/mês" | [ ] |
| 5 | Visual check | "Popular" badge on Premium card | [ ] |
| 6 | Scroll down | To comparison table | [ ] |
| 7 | Visual check | Table shows 11 features | [ ] |
| 8 | Visual check | Checkmarks (✓) and X marks properly displayed | [ ] |
| 9 | Visual check | "Transações": Free="100/mês", Premium="Ilimitadas" | [ ] |
| 10 | Scroll down | To testimonials section | [ ] |
| 11 | Visual check | 3 testimonial cards visible | [ ] |
| 12 | Visual check | Each has photo, name, quote, savings | [ ] |
| 13 | Scroll down | To FAQ section | [ ] |
| 14 | Visual check | 6 FAQ questions visible | [ ] |
| 15 | Click | First FAQ question | [ ] |
| 16 | Animation | Accordion expands smoothly | [ ] |
| 17 | Visual check | Answer text visible | [ ] |
| 18 | Click | Same question again | [ ] |
| 19 | Animation | Accordion collapses | [ ] |
| 20 | Test all FAQs | All 6 accordions expand/collapse | [ ] |
| 21 | Scroll down | To final CTA section | [ ] |
| 22 | Visual check | Large CTA button visible | [ ] |
| 23 | Click | "Começar Teste Grátis" on Premium card | [ ] |
| 24 | Check console | Event `subscription_cta_clicked` fires | [ ] |
| 25 | Navigation | Redirects to Stripe checkout | [ ] |

### Test 7B: Trial Flow via URL Parameter

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Navigate | To `/subscription?trial=true` | [ ] |
| 2 | Visual check | Heading changes to trial-specific | [ ] |
| 3 | Visual check | "Comece seu teste grátis de 7 dias" | [ ] |
| 4 | Visual check | Subtitle emphasizes trial benefits | [ ] |
| 5 | Visual check | Premium card has "TRIAL" badge | [ ] |
| 6 | Visual check | CTA: "Começar Teste Grátis" (trial-specific) | [ ] |
| 7 | Visual check | "Sem cartão necessário" messaging | [ ] |
| 8 | Visual check | "Cancele a qualquer momento" text | [ ] |
| 9 | Click | Trial CTA button | [ ] |
| 10 | Check URL | Stripe URL contains trial parameters | [ ] |
| 11 | Stripe page | Trial information clearly displayed | [ ] |
| 12 | Stripe page | "7-day free trial" mentioned | [ ] |

### Post-Test Verification
- [ ] All links work correctly
- [ ] Mobile responsive (test on mobile)
- [ ] Images load properly
- [ ] No broken layouts
- [ ] Stripe checkout opens correctly

---

## Test 8: Interactive Tour

**Purpose:** Test spotlight tour functionality

### Execution Steps

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Setup | Clear localStorage, complete onboarding | [ ] |
| 2 | Dashboard loads | Tour starts automatically | [ ] |
| 3 | Check console | Event `interactive_tour_started` fires | [ ] |
| 4 | Visual check | Overlay appears with backdrop blur | [ ] |
| 5 | Visual check | Spotlight on Dashboard card | [ ] |
| 6 | Visual check | "Passo 1 de 5" indicator | [ ] |
| 7 | Visual check | Tooltip with explanation text | [ ] |
| 8 | Visual check | "Próximo" button in tooltip | [ ] |
| 9 | Visual check | "Pular Tour" button in corner | [ ] |
| 10 | Click | "Próximo" button | [ ] |
| 11 | Animation | Spotlight smoothly transitions to next element | [ ] |
| 12 | Visual check | "Passo 2 de 5" on Transactions link | [ ] |
| 13 | Complete | All 5 steps | [ ] |
| 14 | Final step | Click "Concluir" | [ ] |
| 15 | Check console | Event `interactive_tour_completed` fires | [ ] |
| 16 | Animation | Tour closes smoothly | [ ] |
| 17 | Refresh page | Tour does NOT restart | [ ] |
| 18 | Check localStorage | `monity_tour_completed: true` | [ ] |

#### Test Skip Functionality

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 19 | Clear localStorage | Reset tour state | [ ] |
| 20 | Start tour | Tour begins at step 1 | [ ] |
| 21 | Click | "Pular Tour" button | [ ] |
| 22 | Check console | Event `interactive_tour_skipped` fires | [ ] |
| 23 | Visual check | Tour immediately closes | [ ] |
| 24 | Check localStorage | `monity_tour_skipped: true` | [ ] |
| 25 | Refresh page | Tour does NOT restart | [ ] |

### Post-Test Verification
- [ ] Tour steps match dashboard layout
- [ ] Spotlight doesn't block interactions
- [ ] Animations smooth on all devices
- [ ] Tour persists across refreshes correctly

---

## Test 9: Analytics Verification

**Purpose:** Verify all analytics events fire correctly

### Setup
- [ ] Open Chrome DevTools → Console
- [ ] Filter for "analytics" or verify `window.analytics` exists

### Events to Verify

#### Landing & Demo Events

| Event Name | Trigger | Properties | Fires | Status |
|------------|---------|------------|-------|--------|
| hero_overlay_viewed | Hero appears | variant | [ ] | [ ] |
| hero_cta_clicked | Click CTA | cta_type, variant | [ ] | [ ] |
| demo_mode_activated | Activate demo | source | [ ] | [ ] |

#### Onboarding Events

| Event Name | Trigger | Properties | Fires | Status |
|------------|---------|------------|-------|--------|
| onboarding_started | Wizard opens | - | [ ] | [ ] |
| onboarding_step_completed | Complete step | step_number | [ ] | [ ] |
| first_transaction_added | Add in wizard | amount, category | [ ] | [ ] |
| onboarding_completed | Finish wizard | - | [ ] | [ ] |
| onboarding_skipped | Skip wizard | step_abandoned | [ ] | [ ] |

#### Checklist Events

| Event Name | Trigger | Properties | Fires | Status |
|------------|---------|------------|-------|--------|
| checklist_item_completed | Complete item | item_id | [ ] | [ ] |
| checklist_fully_completed | 7/7 complete | - | [ ] | [ ] |

#### Premium Events

| Event Name | Trigger | Properties | Fires | Status |
|------------|---------|------------|-------|--------|
| premium_feature_teaser_opened | Open teaser | feature_id, feature_title | [ ] | [ ] |
| premium_teaser_cta_clicked | Click CTA | feature_id, cta_type | [ ] | [ ] |
| smart_prompt_shown | Prompt appears | prompt_type | [ ] | [ ] |
| smart_prompt_dismissed | Dismiss prompt | prompt_type | [ ] | [ ] |
| smart_prompt_converted | Click upgrade | prompt_type | [ ] | [ ] |
| subscription_cta_clicked | Click subscribe | source, plan | [ ] | [ ] |

#### Tour Events

| Event Name | Trigger | Properties | Fires | Status |
|------------|---------|------------|-------|--------|
| interactive_tour_started | Tour begins | - | [ ] | [ ] |
| interactive_tour_step_viewed | Each step | step_number | [ ] | [ ] |
| interactive_tour_completed | Tour finishes | - | [ ] | [ ] |
| interactive_tour_skipped | Skip tour | step_abandoned | [ ] | [ ] |

### Post-Test Verification
- [ ] All 20+ events fire correctly
- [ ] Event properties contain expected data
- [ ] Events appear in your analytics dashboard (if configured)
- [ ] No duplicate events firing

---

## Backend API Testing

### Test 10: Onboarding Endpoints

#### GET /api/v1/onboarding/progress

```bash
curl -X GET http://localhost:5000/api/v1/onboarding/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
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

- [ ] Returns 200 status
- [ ] Response matches expected structure
- [ ] Creates record if doesn't exist

#### POST /api/v1/onboarding/complete-step

```bash
curl -X POST http://localhost:5000/api/v1/onboarding/complete-step \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"step": 1, "data": {"goal": "save_money"}}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "current_step": 2,
    "progress_percentage": 20
  }
}
```

- [ ] Returns 200 status
- [ ] Updates step in database
- [ ] Progress percentage correct

#### POST /api/v1/onboarding/complete

```bash
curl -X POST http://localhost:5000/api/v1/onboarding/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Onboarding completed successfully"
}
```

- [ ] Returns 200 status
- [ ] Sets `onboarding_completed = true`
- [ ] Sets `completed_at` timestamp

#### POST /api/v1/onboarding/checklist

```bash
curl -X POST http://localhost:5000/api/v1/onboarding/checklist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"item": "add_first_transaction", "completed": true}'
```

**Expected Response:**
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

- [ ] Returns 200 status
- [ ] Updates checklist in database
- [ ] Progress persists

### Test 11: Premium Prompt Endpoints

#### GET /api/v1/premium/should-show-prompt

```bash
curl -X GET "http://localhost:5000/api/v1/premium/should-show-prompt?type=transaction_limit" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "should_show": true
}
```

- [ ] Returns 200 status
- [ ] Returns false if premium user
- [ ] Returns false if snoozed
- [ ] Respects frequency rules

#### POST /api/v1/premium/record-prompt-action

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

**Expected Response:**
```json
{
  "success": true,
  "message": "Action recorded successfully"
}
```

- [ ] Returns 200 status
- [ ] Creates record in database
- [ ] Sets `dismissed_until` if dismissed
- [ ] 7-day snooze calculated correctly

#### GET /api/v1/premium/conversion-stats

```bash
curl -X GET http://localhost:5000/api/v1/premium/conversion-stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_prompts_shown": 15,
    "total_conversions": 3,
    "conversion_rate": 0.20,
    "prompt_type_breakdown": {...}
  }
}
```

- [ ] Returns 200 status
- [ ] Calculations are correct
- [ ] Shows breakdown by prompt type

### Test 12: Feature Discovery Endpoints

#### GET /api/v1/features/schedule

```bash
curl -X GET http://localhost:5000/api/v1/features/schedule \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "current_features": [...],
    "upcoming_features": [...]
  }
}
```

- [ ] Returns 200 status
- [ ] Features scheduled by account age
- [ ] Discovered features excluded

#### POST /api/v1/features/mark-discovered

```bash
curl -X POST http://localhost:5000/api/v1/features/mark-discovered \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"feature_id": "budgets", "interaction_type": "tooltip_completed"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Feature marked as discovered"
}
```

- [ ] Returns 200 status
- [ ] Creates discovery record
- [ ] Prevents duplicate discoveries

---

## Performance Testing

### Lighthouse Audit

#### Run Audit

```bash
# Build production version
npm run build

# Preview production build
npm run preview

# In another terminal, run Lighthouse
lighthouse http://localhost:4173 --view
```

#### Target Scores

- [ ] Performance: > 90
- [ ] Accessibility: > 95
- [ ] Best Practices: > 90
- [ ] SEO: > 90

#### Key Metrics

- [ ] First Contentful Paint (FCP): < 1.8s
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] Time to Interactive (TTI): < 3.8s
- [ ] Total Blocking Time (TBT): < 200ms
- [ ] Cumulative Layout Shift (CLS): < 0.1

### Bundle Size Analysis

```bash
# Install analyzer
npm install --save-dev vite-plugin-visualizer

# Run build (analyzer opens automatically)
npm run build
```

#### Bundle Targets

- [ ] Total bundle (gzipped): < 500KB
- [ ] Main chunk: < 200KB
- [ ] Vendor chunk: < 250KB
- [ ] Individual routes: < 50KB each

#### Largest Dependencies

Check if these are necessary:
- [ ] framer-motion: ~50KB (necessary for animations)
- [ ] react-router: ~30KB (necessary)
- [ ] Other large libs identified

### Network Performance

- [ ] Images < 100KB each
- [ ] Fonts properly cached
- [ ] API responses < 2s
- [ ] No waterfall requests
- [ ] Gzip/Brotli compression enabled

---

## Browser Compatibility Testing

### Desktop Browsers

#### Chrome (Latest)

| Feature | Works | Smooth | No Errors | Status |
|---------|-------|--------|-----------|--------|
| Hero overlay | [ ] | [ ] | [ ] | [ ] |
| Onboarding wizard | [ ] | [ ] | [ ] | [ ] |
| Premium teasers | [ ] | [ ] | [ ] | [ ] |
| Animations | [ ] | [ ] | [ ] | [ ] |
| Backdrop blur | [ ] | [ ] | [ ] | [ ] |

#### Firefox (Latest)

| Feature | Works | Smooth | No Errors | Status |
|---------|-------|--------|-----------|--------|
| Hero overlay | [ ] | [ ] | [ ] | [ ] |
| Onboarding wizard | [ ] | [ ] | [ ] | [ ] |
| Premium teasers | [ ] | [ ] | [ ] | [ ] |
| Animations | [ ] | [ ] | [ ] | [ ] |
| Backdrop blur | [ ] | [ ] | [ ] | [ ] |

#### Safari (Latest)

| Feature | Works | Smooth | No Errors | Status |
|---------|-------|--------|-----------|--------|
| Hero overlay | [ ] | [ ] | [ ] | [ ] |
| Onboarding wizard | [ ] | [ ] | [ ] | [ ] |
| Premium teasers | [ ] | [ ] | [ ] | [ ] |
| Animations | [ ] | [ ] | [ ] | [ ] |
| Backdrop blur | [ ] | [ ] | [ ] | [ ] |

#### Edge (Latest)

| Feature | Works | Smooth | No Errors | Status |
|---------|-------|--------|-----------|--------|
| Hero overlay | [ ] | [ ] | [ ] | [ ] |
| Onboarding wizard | [ ] | [ ] | [ ] | [ ] |
| Premium teasers | [ ] | [ ] | [ ] | [ ] |
| Animations | [ ] | [ ] | [ ] | [ ] |
| Backdrop blur | [ ] | [ ] | [ ] | [ ] |

---

## Mobile Testing

### iOS Safari

#### iPhone SE (320px)

- [ ] Hero overlay fully visible
- [ ] Text readable without zooming
- [ ] Buttons tappable (44px min touch target)
- [ ] Modals don't exceed screen height
- [ ] Scrolling smooth
- [ ] No horizontal overflow

#### iPhone 12/13 (375px)

- [ ] Hero overlay well-proportioned
- [ ] Onboarding wizard steps clear
- [ ] Checklist readable
- [ ] Premium cards properly sized
- [ ] Animations 60fps
- [ ] Touch interactions responsive

#### iPhone 12 Pro Max (414px)

- [ ] All content properly scaled
- [ ] No wasted space
- [ ] Images clear and crisp
- [ ] Buttons appropriately sized

### Android Chrome

#### Small Device (360px)

- [ ] Hero overlay fits screen
- [ ] Text not cut off
- [ ] Buttons accessible
- [ ] Modals scroll correctly
- [ ] No layout issues

#### Medium Device (412px)

- [ ] Content well-spaced
- [ ] Animations smooth
- [ ] Touch targets adequate
- [ ] Forms usable

### Tablet Testing

#### iPad (768px)

- [ ] Layout switches to tablet view
- [ ] Sidebar visible alongside content
- [ ] Modals centered and sized appropriately
- [ ] Touch interactions work

#### iPad Pro (1024px)

- [ ] Desktop-like experience
- [ ] No stretched elements
- [ ] Full feature set visible
- [ ] Smooth animations

---

## Final Checklist

### Before Launch

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests completed (Tests 1-9)
- [ ] All backend API tests passing (Tests 10-12)
- [ ] Lighthouse scores > 90
- [ ] Bundle size < 500KB
- [ ] Cross-browser testing complete (4 browsers)
- [ ] Mobile testing complete (iOS + Android)
- [ ] Responsive testing complete (7 breakpoints)
- [ ] Analytics verified (20+ events)
- [ ] Database migration executed
- [ ] Stripe configured correctly
- [ ] Error monitoring set up
- [ ] Performance optimized

### Post-Launch Monitoring

- [ ] Monitor error logs (first 24 hours)
- [ ] Check analytics dashboard daily (first week)
- [ ] Track conversion rates:
  - [ ] Hero → Demo: > 40%
  - [ ] Demo → Signup: > 15%
  - [ ] Signup → Onboarding Complete: > 70%
  - [ ] Onboarding → First Transaction: > 80%
  - [ ] Premium Prompt → Conversion: > 5%
- [ ] Gather user feedback
- [ ] Document bugs for fixing
- [ ] Plan iterations based on data

---

## Test Results Summary

### Overall Status

- **Total Tests:** 12 test suites
- **Passed:** ___
- **Failed:** ___
- **Skipped:** ___

### Critical Issues Found

1. ___
2. ___
3. ___

### Minor Issues Found

1. ___
2. ___
3. ___

### Performance Results

- **Lighthouse Performance:** ___
- **Bundle Size:** ___
- **LCP:** ___

### Browser Compatibility

- **Chrome:** ✅ / ❌
- **Firefox:** ✅ / ❌
- **Safari:** ✅ / ❌
- **Edge:** ✅ / ❌

### Mobile Compatibility

- **iOS Safari:** ✅ / ❌
- **Android Chrome:** ✅ / ❌

### Ready for Launch?

- [ ] Yes, all tests passing
- [ ] No, issues need to be fixed first

---

**Completed by:** _______________
**Date:** _______________
**Time spent:** _______________

