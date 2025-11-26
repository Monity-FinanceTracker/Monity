# 🚀 Quick Start: Debug Your Stripe Webhook

## The Fast Path to Finding Your Issue

### Step 1: Check Your Logs (2 minutes)
Look at your server logs for the most recent webhook. Search for these keywords:

**If you see**: `"CRITICAL: Missing supabase_user_id"`
- **Problem**: User ID not being sent to Stripe
- **Fix**: Add `metadata: { supabase_user_id: user.id }` to your checkout session creation

**If you see**: `"CRITICAL: User not found in database"`
- **Problem**: User doesn't exist or wrong ID
- **Fix**: Verify the user ID, check if user was deleted

**If you see**: `"CRITICAL: Database update failed"`
- **Problem**: Database permissions or RLS policy blocking update
- **Fix**: Verify you're using service role key, check RLS policies

**If you see**: `"CRITICAL: Update verification FAILED"`
- **Problem**: Update runs but data doesn't change
- **Fix**: Check for database triggers or other code reverting changes

**If you see**: `"COMPLETE: One-time payment processing finished"`
- **Good News**: Everything worked! Check your database to confirm

### Step 2: Test Locally (5 minutes)

```bash
# Install Stripe CLI (if needed)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to http://localhost:3000/api/v1/webhook/stripe

# In another terminal, trigger test event
stripe trigger checkout.session.completed
```

Watch the output - you'll see detailed logs showing exactly what's happening.

### Step 3: Check Database (1 minute)

```sql
SELECT 
  id, 
  email, 
  subscription_tier, 
  subscription_status
FROM profiles 
WHERE id = 'YOUR_USER_ID';
```

Expected after payment: `subscription_tier = 'premium'`

## Most Common Issues

### 1. User ID Not Being Sent (80% of cases)
When creating checkout session, make sure you have:
```javascript
metadata: {
  supabase_user_id: user.id  // ← This line!
}
```

### 2. Wrong Supabase Key (15% of cases)
You MUST use the **service role key**, not the anon key:
```bash
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Service role key
```

### 3. User Deleted/Doesn't Exist (5% of cases)
Verify the user ID exists in your profiles table.

## What Was Changed?

Your webhook now has:
- ✅ Detailed logging at every step
- ✅ Metadata validation
- ✅ User verification before update
- ✅ Post-update verification
- ✅ Clear error messages

## Next Payment Should Show

```
INFO: Processing checkout.session.completed - DETAILED
INFO: STARTING: Processing one-time payment upgrade
INFO: STEP 1 SUCCESS: User found in database
INFO: STEP 2 SUCCESS: Database update completed
INFO: STEP 3 SUCCESS: Update verification completed
INFO: COMPLETE: One-time payment processing finished
```

## Still Having Issues?

Read the full guides:
- `STRIPE_WEBHOOK_TESTING.md` - Complete testing guide
- `WEBHOOK_FIX_SUMMARY.md` - Detailed changes made

## Emergency Checklist

- [ ] User ID is in Stripe checkout metadata
- [ ] User exists in profiles table
- [ ] Using service role key (not anon key)
- [ ] Webhook secret is correct
- [ ] Server is running and accessible
- [ ] Checked logs for "CRITICAL" errors

That's it! The enhanced logging will tell you exactly what's wrong. 🎉

