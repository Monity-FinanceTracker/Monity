# Webhook Debug Guide

## Problem

After successful payment, neither the database nor the browser updates the user's subscription to premium.

## Debugging Steps

### 1. Check Server Logs

Start the server and watch for webhook logs:

```bash
npm start
```

Look for these log messages:

- "Webhook received" - confirms webhook is being called
- "Webhook signature verified successfully" - confirms Stripe signature is valid
- "Processing checkout.session.completed" - confirms event processing
- "Successfully updated user subscription" - confirms database update

### 2. Test Webhook Manually

Run the simple webhook test:

```bash
node test-webhook-simple.js
```

This will send a test webhook to your server and show you the response.

### 3. Test Subscription Endpoint

Test if the subscription endpoint is working:

```bash
node test-subscription-endpoint.js
```

### 4. Check Environment Variables

Make sure these are set in your `.env` file:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://...
SUPABASE_KEY=eyJ...
```

### 5. Verify Stripe Webhook Configuration

1. Go to Stripe Dashboard > Webhooks
2. Check that your webhook endpoint URL is correct: `https://yourdomain.com/api/v1/webhook/stripe`
3. Make sure these events are enabled:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 6. Check Database

Verify the user profile exists and has the correct structure:

```sql
SELECT id, email, subscription_tier, subscription_status, stripe_customer_id
FROM profiles
WHERE id = 'your-user-id';
```

### 7. Test Real Payment Flow

1. Start your server: `npm start`
2. Open your frontend: `npm run dev`
3. Login and try to upgrade
4. Complete the payment
5. Check server logs for webhook processing
6. Check database for subscription update

## Common Issues

### Issue 1: Webhook Not Receiving Events

**Symptoms:** No "Webhook received" logs
**Solutions:**

- Check webhook URL in Stripe dashboard
- Ensure server is accessible from internet (use ngrok for local testing)
- Check firewall/network settings

### Issue 2: Signature Verification Failing

**Symptoms:** "Webhook signature verification failed" logs
**Solutions:**

- Verify STRIPE_WEBHOOK_SECRET is correct
- Ensure webhook endpoint uses `express.raw({ type: 'application/json' })`
- Check that webhook is defined BEFORE `express.json()` middleware

### Issue 3: Database Update Failing

**Symptoms:** "Failed to update user subscription in database" logs
**Solutions:**

- Check database connection
- Verify user profile exists
- Check database permissions
- Ensure SUPABASE_KEY has admin privileges

### Issue 4: Frontend Not Refreshing

**Symptoms:** Database updates but UI doesn't change
**Solutions:**

- Check if `refreshSubscription()` is being called
- Verify `/api/v1/subscription-tier` endpoint works
- Check browser network tab for API calls
- Clear browser cache

## Testing with ngrok (for local development)

1. Install ngrok: `npm install -g ngrok`
2. Start your server: `npm start`
3. In another terminal: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Update Stripe webhook URL to: `https://abc123.ngrok.io/api/v1/webhook/stripe`
6. Test the payment flow

## Log Analysis

Look for these log patterns:

### Successful Flow:

```
Webhook received
Webhook signature verified successfully
Processing checkout.session.completed
Retrieving subscription from Stripe
Updating user subscription in database
Successfully updated user subscription
```

### Failed Flow:

```
Webhook received
Webhook signature verification failed
```

OR

```
Webhook received
Webhook signature verified successfully
Processing checkout.session.completed
Failed to update user subscription in database
```

## New Debugging Tools

### 1. Offline Webhook Test (Recommended for debugging)
Test the database update logic without Stripe API calls:

```bash
node __tests__/webhook-offline-test.js
```

This will:
- Test database connectivity
- Simulate webhook database updates
- Verify subscription tier updates
- No Stripe API calls required

### 2. Simple Webhook Test
Start with the simple test to quickly verify webhook functionality:

```bash
node __tests__/simple-webhook-test.js
```

This will:
- Check environment setup
- Find or create a test user
- Test basic webhook functionality
- Verify user profile updates

### 3. Comprehensive Webhook Test Suite
Run the full test suite to check all webhook scenarios:

```bash
node __tests__/comprehensive-webhook-test.js
```

This will test:
- Environment setup
- Database connectivity
- All webhook event types
- Error scenarios
- User profile updates

### 4. Webhook Debug Helper
Use the debug helper for targeted testing:

```bash
node __tests__/webhook-debug-helper.js
```

Or use it programmatically:
```javascript
const WebhookDebugHelper = require('./__tests__/webhook-debug-helper');
const helper = new WebhookDebugHelper();

// Check environment
await helper.checkEnvironment();

// Test specific webhook
await helper.sendTestWebhook('checkout.session.completed', 'user-id');

// Check user profile
await helper.checkUserProfile('user-id');
```

### 5. Subscription Monitoring
Monitor subscription profiles and statistics:

```bash
node __tests__/webhook-monitor.js
```

This will:
- Show current subscription profiles
- Display subscription statistics
- Identify problematic profiles
- Monitor subscription health

## Enhanced Error Handling

The webhook now includes:
- ✅ Input validation for all parameters
- ✅ Database existence checks before updates
- ✅ Detailed error logging with context
- ✅ Row count verification after updates
- ✅ Comprehensive error messages

## Common Issues & Solutions

### Issue 1: "User profile not found"
**Cause:** User doesn't exist in profiles table
**Solution:**
1. Check if user was created during registration
2. Verify the user ID in webhook metadata
3. Check database connection and permissions

### Issue 2: "No rows were updated in database"
**Cause:** Database update didn't affect any rows
**Solution:**
1. Verify user ID exists and matches exactly
2. Check database permissions
3. Ensure profile table has correct structure

### Issue 3: "Subscription has no items"
**Cause:** Stripe subscription object is malformed
**Solution:**
1. Check Stripe subscription in dashboard
2. Verify webhook payload structure
3. Test with different subscription types

### Issue 4: Webhook signature verification fails
**Cause:** Incorrect webhook secret or payload format
**Solution:**
1. Verify STRIPE_WEBHOOK_SECRET in environment
2. Check webhook endpoint uses `express.raw()`
3. Ensure webhook is defined before `express.json()`

### Issue 5: 405 Method Not Allowed Error
**Cause:** Route conflict with authenticated billing routes
**Solution:**
1. Webhook is now at `/api/v1/webhook/stripe` (not `/api/v1/billing/webhook`)
2. Update Stripe webhook URL in dashboard
3. Ensure webhook route is defined before other routes in server.js

## Next Steps

If the webhook is working but the frontend isn't updating:

1. Check if `refreshSubscription()` is called after payment return
2. Verify the subscription API endpoint returns updated data
3. Check for caching issues in the frontend (use `clearSubscriptionCache()`)
4. Ensure the user is properly authenticated when checking subscription

If the webhook isn't working at all:

1. Run the comprehensive test suite
2. Use the webhook debug helper for targeted testing
3. Monitor webhook events in real-time
4. Check server logs for detailed error information
5. Verify Stripe webhook configuration in dashboard
