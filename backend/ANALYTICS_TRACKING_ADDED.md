# Analytics Tracking for Subscription Events

## ✅ Analytics Tracking NOW IMPLEMENTED

Previously, subscription upgrades and payments were **not being tracked** in your analytics system. This has been fixed!

## Events Now Being Tracked

### 1. `subscription_upgraded` 
**Triggered when**: User completes one-time payment and becomes premium

**Properties tracked**:
```javascript
{
  fromTier: 'free',           // Previous tier
  toTier: 'premium',          // New tier
  paymentType: 'one_time',    // Payment type
  amount: 990,                // Amount paid (in cents)
  currency: 'usd',            // Currency
  sessionId: 'cs_test_...',   // Stripe session ID
  expiresAt: '2025-12-25...'  // Subscription expiry
}
```

**Use cases**:
- Track conversion rate from free to premium
- Measure revenue from one-time purchases
- Analyze user upgrade patterns
- Calculate customer acquisition cost (CAC)

---

### 2. `subscription_activated`
**Triggered when**: Subscription is activated (recurring payment starts)

**Properties tracked**:
```javascript
{
  fromTier: 'free',              // Previous tier
  toTier: 'premium',             // New tier
  subscriptionId: 'sub_...',     // Stripe subscription ID
  status: 'active',              // Subscription status
  priceId: 'price_...',          // Stripe price ID
  currentPeriodEnd: '2025-12-25' // Billing period end
}
```

**Use cases**:
- Track recurring subscription starts
- Measure Monthly Recurring Revenue (MRR)
- Analyze subscription retention
- Monitor billing cycles

---

### 3. `subscription_status_changed`
**Triggered when**: Subscription status changes (but not to active)

**Properties tracked**:
```javascript
{
  fromTier: 'premium',        // Previous tier
  toTier: 'free',             // New tier
  subscriptionId: 'sub_...',  // Stripe subscription ID
  status: 'past_due',         // New status
  priceId: 'price_...',       // Stripe price ID
  currentPeriodEnd: null      // Billing period end
}
```

**Use cases**:
- Track subscription state changes
- Monitor past_due subscriptions
- Identify at-risk customers
- Measure churn indicators

---

### 4. `payment_succeeded`
**Triggered when**: Invoice payment succeeds (recurring payments)

**Properties tracked**:
```javascript
{
  invoiceId: 'in_...',        // Stripe invoice ID
  subscriptionId: 'sub_...',  // Stripe subscription ID
  amount: 990,                // Amount paid
  currency: 'usd',            // Currency
  paymentType: 'subscription' // Payment type
}
```

**Use cases**:
- Track successful payments
- Calculate revenue metrics
- Monitor payment success rate
- Analyze payment patterns

---

### 5. `subscription_cancelled`
**Triggered when**: User cancels subscription

**Properties tracked**:
```javascript
{
  subscriptionId: 'sub_...',  // Stripe subscription ID
  fromTier: 'premium',        // Previous tier
  toTier: 'free',             // New tier
  reason: 'cancelled'         // Cancellation reason
}
```

**Use cases**:
- Track churn rate
- Analyze cancellation patterns
- Calculate customer lifetime value (LTV)
- Identify retention issues

---

### 6. `payment_failed`
**Triggered when**: Payment fails (e.g., card declined)

**Properties tracked**:
```javascript
{
  subscriptionId: 'sub_...',  // Stripe subscription ID
  fromTier: 'premium',        // Previous tier
  toTier: 'free',             // New tier
  reason: 'payment_failed'    // Failure reason
}
```

**Use cases**:
- Track failed payments
- Monitor payment success rate
- Identify users with payment issues
- Trigger dunning campaigns

---

## Implementation Details

### Location
File: `/Monity/backend/controllers/billingController.js`

### Integration
- Uses `AnalyticsService` from `/Monity/backend/services/analyticsService.js`
- Tracks events asynchronously (doesn't block payment processing)
- Errors in analytics don't affect payment success
- All events include user ID, session ID, and context

### Error Handling
```javascript
try {
  await this.analyticsService.track({ ... });
  logger.info("ANALYTICS: Tracked event");
} catch (analyticsError) {
  // Analytics failure doesn't affect payment
  logger.error("WARNING: Failed to track analytics event", {
    error: analyticsError.message,
  });
}
```

## How to View Analytics

### Database Tables
Analytics events are stored in these tables:
- `analytics_events` - All tracked events
- `analytics_sessions` - User sessions
- `analytics_user_traits` - User properties

### Query Examples

**Total premium upgrades today:**
```sql
SELECT COUNT(*) 
FROM analytics_events 
WHERE event_name = 'subscription_upgraded' 
AND DATE(timestamp) = CURRENT_DATE;
```

**Revenue from one-time purchases this month:**
```sql
SELECT SUM((event_properties->>'amount')::numeric / 100) as revenue
FROM analytics_events 
WHERE event_name = 'subscription_upgraded'
AND event_properties->>'paymentType' = 'one_time'
AND DATE_TRUNC('month', timestamp) = DATE_TRUNC('month', CURRENT_DATE);
```

**Churn rate this month:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE event_name = 'subscription_cancelled') as cancelled,
  COUNT(*) FILTER (WHERE event_name = 'subscription_activated') as activated,
  ROUND(
    COUNT(*) FILTER (WHERE event_name = 'subscription_cancelled')::numeric / 
    NULLIF(COUNT(*) FILTER (WHERE event_name = 'subscription_activated'), 0) * 100, 
    2
  ) as churn_rate_percent
FROM analytics_events 
WHERE DATE_TRUNC('month', timestamp) = DATE_TRUNC('month', CURRENT_DATE);
```

**Failed payment rate:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE event_name = 'payment_succeeded') as successful,
  COUNT(*) FILTER (WHERE event_name = 'payment_failed') as failed,
  ROUND(
    COUNT(*) FILTER (WHERE event_name = 'payment_failed')::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as failure_rate_percent
FROM analytics_events 
WHERE event_name IN ('payment_succeeded', 'payment_failed')
AND timestamp > NOW() - INTERVAL '30 days';
```

## Key Metrics You Can Now Track

### Revenue Metrics
- ✅ Monthly Recurring Revenue (MRR)
- ✅ Annual Recurring Revenue (ARR)
- ✅ Average Revenue Per User (ARPU)
- ✅ One-time payment revenue

### Customer Metrics
- ✅ Conversion rate (free → premium)
- ✅ Churn rate
- ✅ Customer Lifetime Value (LTV)
- ✅ Customer Acquisition Cost (CAC)

### Payment Metrics
- ✅ Payment success rate
- ✅ Failed payment rate
- ✅ Retry success rate
- ✅ Average transaction value

### Engagement Metrics
- ✅ Active subscribers
- ✅ Subscription duration
- ✅ Cancellation reasons
- ✅ Upgrade timing

## Dashboard Integration

The tracked events can be visualized in:
1. **Admin Dashboard** - View in `/admin/analytics` route
2. **Analytics Service** - Query using `analyticsQueryService.js`
3. **External Tools** - Export to tools like Mixpanel, Amplitude, etc.

## Next Steps

1. ✅ **Events are now tracked** - Deploy the updated code
2. **Build dashboards** - Create visual dashboards for key metrics
3. **Set up alerts** - Get notified of important events (e.g., high churn)
4. **Analyze trends** - Use data to improve conversion and retention
5. **A/B testing** - Test different pricing and features

## Testing Analytics

To verify analytics is working:

1. **Trigger a test payment** using Stripe test mode
2. **Check server logs** for "ANALYTICS: Tracked..." messages
3. **Query the database**:
   ```sql
   SELECT * FROM analytics_events 
   WHERE event_name LIKE 'subscription%' 
   ORDER BY timestamp DESC 
   LIMIT 10;
   ```
4. **Verify properties** are correct in the event data

---

## Summary

**Before**: ❌ No analytics tracking for subscriptions
**After**: ✅ Complete tracking of all subscription lifecycle events

This gives you full visibility into:
- Who is upgrading to premium
- How much revenue you're generating
- Why users are cancelling
- Which payment methods are failing
- Customer lifetime patterns

You can now make data-driven decisions about pricing, features, and retention strategies! 📊







