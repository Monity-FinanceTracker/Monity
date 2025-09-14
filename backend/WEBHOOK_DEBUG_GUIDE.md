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
2. Check that your webhook endpoint URL is correct: `https://yourdomain.com/api/v1/billing/webhook`
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
5. Update Stripe webhook URL to: `https://abc123.ngrok.io/api/v1/billing/webhook`
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

## Next Steps

If the webhook is working but the frontend isn't updating:

1. Check if `refreshSubscription()` is called after payment return
2. Verify the subscription API endpoint returns updated data
3. Check for caching issues in the frontend
4. Ensure the user is properly authenticated when checking subscription

If the webhook isn't working at all:

1. Verify Stripe webhook configuration
2. Check server accessibility
3. Test with the simple webhook test script
4. Review server logs for errors
