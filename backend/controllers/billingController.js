// backend/controllers/billingController.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { supabaseAdmin } = require("../config/supabase");
const { logger } = require("../utils/logger");

class BillingController {
  constructor(supabase) {
    this.supabase = supabase;
  }

  // Helper to look up or create a Stripe customer
  async getOrCreateStripeCustomerId(userId, email) {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      throw new Error("User profile not found.");
    }

    if (profile.stripe_customer_id) {
      return profile.stripe_customer_id;
    }

    // No customer ID, create a new one
    const customer = await stripe.customers.create({
      email,
      metadata: { supabase_user_id: userId },
    });

    await supabaseAdmin
      .from("profiles")
      .update({ stripe_customer_id: customer.id })
      .eq("id", userId);

    return customer.id;
  }

  // POST /api/v1/billing/create-checkout-session
  createCheckoutSession = async (req, res) => {
    const { priceId } = req.body;
    const user = req.user; // from auth middleware

    if (!user || !user.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const customerId = await this.getOrCreateStripeCustomerId(
        user.id,
        user.email
      );

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        billing_address_collection: "auto",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?canceled=true`,
        customer: customerId,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      res.json({ url: session.url });
    } catch (error) {
      logger.error("Error creating checkout session", { error: error.message });
      res.status(500).json({ error: error.message });
    }
  };

  // POST /api/v1/billing/create-portal-session
  createBillingPortalSession = async (req, res) => {
    const user = req.user;

    try {
      const customerId = await this.getOrCreateStripeCustomerId(
        user.id,
        user.email
      );

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription`,
      });

      res.json({ url: session.url });
    } catch (error) {
      logger.error("Error creating billing portal session", {
        error: error.message,
      });
      res.status(500).json({ error: error.message });
    }
  };

  // Stripe webhook (registered before JSON parser in server.js)
  handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // In Express, ensure req is the raw body for this route
      event = stripe.webhooks.constructEvent(
        req.body || req.rawBody,
        sig,
        endpointSecret
      );
    } catch (err) {
      logger.error("Webhook signature verification failed", {
        error: err.message,
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object;
        const { metadata: { supabase_user_id } = {}, subscription } =
          checkoutSession;
        if (subscription && supabase_user_id) {
          await this.handleSubscriptionChange(supabase_user_id, subscription);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscriptionObject = event.data.object;
        const customerId = subscriptionObject.customer;

        const { data: [userProfile] = [], error: profileError } =
          await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId);

        if (!profileError && userProfile) {
          await this.handleSubscriptionChange(
            userProfile.id,
            subscriptionObject.id
          );
        }
        break;
      }
      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const deletedSub = event.data.object;
        const deletedCustId = deletedSub.customer;

        const { data: [deletedProfile] = [], error: deletedProfileError } =
          await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", deletedCustId);

        if (!deletedProfileError && deletedProfile) {
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_tier: "free",
              subscription_status: "canceled",
              stripe_subscription_id: null,
              current_period_end: null,
              plan_price_id: null,
            })
            .eq("id", deletedProfile.id);
        }
        break;
      }
      default: {
        logger.info(`Unhandled event type ${event.type}`);
      }
    }

    res.json({ received: true });
  };

  // Internal helper
  async handleSubscriptionChange(supabase_user_id, stripe_subscription_id) {
    const subscription = await stripe.subscriptions.retrieve(
      stripe_subscription_id
    );

    const newStatus = subscription.status;
    const newTier =
      newStatus === "active" || newStatus === "trialing" ? "premium" : "free";
    const priceId = subscription.items.data[0].price.id;

    // Create a variable to store the date, defaulting to null
    let currentPeriodEnd = null;

    // Check if the timestamp exists and is a valid number before converting
    if (
      subscription.current_period_end &&
      typeof subscription.current_period_end === "number"
    ) {
      currentPeriodEnd = new Date(
        subscription.current_period_end * 1000
      ).toISOString();
    }

    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_tier: newTier,
        subscription_status: newStatus,
        stripe_subscription_id: subscription.id,
        current_period_end: currentPeriodEnd, // Use the new variable
        plan_price_id: priceId,
      })
      .eq("id", supabase_user_id);
  }
}

module.exports = BillingController;
