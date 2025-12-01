# Stripe Webhook Testing & Debugging Guide

## What Was Fixed

The Stripe webhook was returning 200 success but silently failing to update user roles. We've added:

1. ✅ **Enhanced Logging** - Detailed logs at every step to identify failures
2. ✅ **Metadata Validation** - Explicit checks for `supabase_user_id` in metadata
3. ✅ **User Verification** - Pre-update checks to ensure user exists
4. ✅ **Post-Update Verification** - Confirms database changes actually happened
5. ✅ **Better Error Handling** - Clear error messages for all failure points

## Step 1: Check Your Server Logs

The enhanced logging will now show exactly what's happening. Look for these key log messages:

### Success Path Logs:
```
✅ "Processing checkout.session.completed - DETAILED" - Event received
✅ "STARTING: Processing one-time payment upgrade" - Starting update
✅ "STEP 1 SUCCESS: User found in database" - User exists
✅ "STEP 2 SUCCESS: Database update completed" - Update executed
✅ "STEP 3 SUCCESS: Update verification completed" - Update confirmed
✅ "COMPLETE: One-time payment processing finished" - All done
```

### Failure Point Logs:
```
❌ "CRITICAL: Missing supabase_user_id in checkout session metadata" - User ID not sent
❌ "CRITICAL: User not found in database" - User doesn't exist
❌ "CRITICAL: Database update failed" - DB error
❌ "CRITICAL: Update verification FAILED" - Update didn't work
```

## Step 2: Verify Your Environment Variables

Ensure these are set in your production environment:

```bash
STRIPE_SECRET_KEY=sk_live_...  # or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://...
SUPABASE_KEY=eyJhbGci...  # Service role key
```

## Step 3: Test with Stripe CLI (Local Testing)

### Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### Login to Stripe
```bash
stripe login
```

### Forward Webhooks to Your Local Server
```bash
# If running locally
stripe listen --forward-to http://localhost:3000/api/v1/webhook/stripe

# If testing production
stripe listen --forward-to https://api.monity-finance.com/api/v1/webhook/stripe
```

This will give you a webhook signing secret like: `whsec_...`

### Trigger Test Events
```bash
# Test a successful checkout
stripe trigger checkout.session.completed
```

Watch the terminal output and your server logs for detailed information.

## Step 4: Test with Real Stripe Events

### Option A: Stripe Dashboard Test
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. Click "Send test webhook"
4. Select `checkout.session.completed`
5. Modify the test data to include your metadata:
   ```json
   {
     "metadata": {
       "supabase_user_id": "YOUR_ACTUAL_USER_ID"
     }
   }
   ```
6. Send the test event
7. Check the webhook response and your server logs

### Option B: Real Purchase Flow
1. Create a real test purchase using Stripe test mode
2. Use test card: `4242 4242 4242 4242`
3. Complete the checkout
4. Stripe will automatically send the webhook
5. Check your server logs

## Step 5: Verify Database Changes

After a webhook is received, check your Supabase database:

```sql
-- Check user's subscription status
SELECT 
  id,
  email,
  subscription_tier,
  subscription_status,
  current_period_end,
  stripe_subscription_id,
  updated_at
FROM profiles
WHERE id = 'YOUR_USER_ID';
```

Expected result after successful payment:
- `subscription_tier`: `'premium'`
- `subscription_status`: `'active'`
- `current_period_end`: A date ~1 month in the future

## Common Issues & Solutions

### Issue 1: "CRITICAL: Missing supabase_user_id in checkout session metadata"

**Problem**: User ID is not being sent to Stripe in the checkout session.

**Solution**: Check your checkout session creation code:
```javascript
const session = await stripe.checkout.sessions.create({
  // ... other config
  metadata: {
    supabase_user_id: user.id,  // ← Make sure this is set!
  },
});
```

### Issue 2: "CRITICAL: User not found in database"

**Problem**: The user ID in Stripe metadata doesn't exist in your database.

**Solutions**:
1. Verify the user ID is correct
2. Check if the user was deleted
3. Ensure you're using the Supabase user ID, not email

### Issue 3: "CRITICAL: Database update failed"

**Problem**: Database permissions or RLS policies blocking the update.

**Solutions**:
1. Verify `SUPABASE_KEY` is the **service role key** (not anon key)
2. Check RLS policies on `profiles` table
3. Review the error message in logs for specific issue

### Issue 4: "CRITICAL: Update verification FAILED - tier not premium!"

**Problem**: Database update returns success but data doesn't change.

**Solutions**:
1. Check for database triggers that might be reverting changes
2. Verify no other code is immediately updating the user
3. Check Supabase realtime subscriptions aren't interfering

## Step 6: Monitor Production Webhooks

### View Webhook History in Stripe
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. View recent webhook attempts
4. Check for:
   - ✅ Successful responses (200)
   - ❌ Failed responses (4xx, 5xx)
   - Response body content

### Check Your Application Logs
Look for the enhanced log messages listed in Step 1.

### Set Up Alerts (Optional)
Consider setting up alerts for:
- Webhook failures
- Missing metadata warnings
- Database update failures

## Debugging Checklist

When a webhook isn't working:

- [ ] Webhook secret is correct in environment variables
- [ ] Server is receiving the webhook (check initial logs)
- [ ] Signature verification passes (check "Webhook signature verified successfully" log)
- [ ] Metadata contains `supabase_user_id` (check "DETAILED" log)
- [ ] User exists in database (check "STEP 1 SUCCESS" log)
- [ ] Database update executes (check "STEP 2 SUCCESS" log)
- [ ] Verification confirms the update (check "STEP 3 SUCCESS" log)
- [ ] User role is actually premium in database (query directly)

## Testing Commands Reference

```bash
# Test webhook locally
stripe listen --forward-to http://localhost:3000/api/v1/webhook/stripe

# Trigger test event
stripe trigger checkout.session.completed

# View webhook logs
stripe logs tail

# Test specific event with custom data
stripe trigger checkout.session.completed --add checkout_session:metadata[supabase_user_id]=user_123
```

## Expected Behavior

After implementing these fixes:

1. **Webhook receives event** → Detailed logs show exact event data
2. **Metadata validated** → Error logged if `supabase_user_id` missing
3. **User verified** → Error logged if user not found
4. **Update executed** → Error logged if update fails
5. **Update verified** → Error logged if verification fails
6. **Success confirmed** → Clear success message with new tier

## Need More Help?

If issues persist after following this guide:

1. Check the server logs for specific error messages
2. Query the database directly to see current user state
3. Review Stripe Dashboard webhook history
4. Verify all environment variables are set correctly
5. Ensure you're using the service role key (not anon key)

## Summary

The webhook has been significantly enhanced with:
- 🔍 **Detailed logging** at every step
- ✅ **Validation** of all inputs
- 🛡️ **Error handling** for edge cases
- 🔐 **Verification** of all changes

You should now be able to see exactly where any failures occur!





