const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { supabaseAdmin } = require("../config/supabase");
const { logger } = require("../utils/logger");

class BillingController {
  constructor(supabase) {
    this.supabase = supabase;
  } // Helper to look up or create a Stripe customer

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
    } // No customer ID, create a new one

    const customer = await stripe.customers.create({
      email,
      metadata: { supabase_user_id: userId },
    });

    await supabaseAdmin
      .from("profiles")
      .update({ stripe_customer_id: customer.id })
      .eq("id", userId);

    return customer.id;
  } // POST /api/v1/billing/create-checkout-session

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
  }; // POST /api/v1/billing/create-portal-session

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
  }; // Stripe webhook (registered before JSON parser in server.js)

  handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    logger.info("Webhook received", {
      hasSignature: !!sig,
      hasSecret: !!endpointSecret,
      bodyLength: req.body?.length || 0,
      contentType: req.headers["content-type"],
    });

    let event;

    try {
      // With express.raw(), req.body contains the raw buffer
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

      logger.info("Webhook signature verified successfully", {
        eventType: event.type,
        eventId: event.id,
      });
    } catch (err) {
      logger.error("Webhook signature verification failed", {
        error: err.message,
        signature: sig,
        bodyLength: req.body?.length || 0,
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const checkoutSession = event.data.object;
          const { metadata: { supabase_user_id } = {}, subscription } =
            checkoutSession;

          logger.info("Processing checkout.session.completed", {
            sessionId: checkoutSession.id,
            subscriptionId: subscription,
            userId: supabase_user_id,
            paymentStatus: checkoutSession.payment_status,
            status: checkoutSession.status,
          });

          if (subscription && supabase_user_id) {
            // This is a subscription payment
            await this.handleSubscriptionChange(supabase_user_id, subscription);
            logger.info("Subscription updated successfully", {
              userId: supabase_user_id,
              subscriptionId: subscription,
            });
          } else if (
            supabase_user_id &&
            checkoutSession.payment_status === "paid"
          ) {
            // This is a one-time payment - upgrade user to premium
            logger.info("Processing one-time payment upgrade", {
              userId: supabase_user_id,
              sessionId: checkoutSession.id,
            });

            await this.handleOneTimePayment(supabase_user_id, checkoutSession);
            logger.info("One-time payment processed successfully", {
              userId: supabase_user_id,
            });
          } else {
            logger.warn("Missing required data in checkout session", {
              hasSubscription: !!subscription,
              hasUserId: !!supabase_user_id,
              paymentStatus: checkoutSession.payment_status,
            });
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
          logger.info(`Unhandled event type ${event.type}`, {
            eventId: event.id,
            eventType: event.type,
          });
        }
      }

      res.json({ received: true });
    } catch (error) {
      logger.error("Error processing webhook event", {
        eventType: event.type,
        eventId: event.id,
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Internal server error" });
    }
  }; // Handle one-time payments (upgrade to premium)

  async handleOneTimePayment(supabase_user_id, checkoutSession) {
    try {
      logger.info("Processing one-time payment upgrade", {
        userId: supabase_user_id,
        sessionId: checkoutSession.id,
        amount: checkoutSession.amount_total,
        currency: checkoutSession.currency,
      }); // For one-time payments, upgrade user to premium for a fixed period // You can customize this logic based on your business model

      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1); // 1 month premium

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update({
          subscription_tier: "premium",
          subscription_status: "active",
          stripe_subscription_id: null, // No subscription for one-time payments
          current_period_end: currentPeriodEnd.toISOString(),
          plan_price_id: null,
        })
        .eq("id", supabase_user_id)
        .select();

      if (error) {
        logger.error("Failed to process one-time payment upgrade", {
          userId: supabase_user_id,
          error: error.message,
          sessionId: checkoutSession.id,
        });
        throw error;
      }

      logger.info("Successfully processed one-time payment upgrade", {
        userId: supabase_user_id,
        updatedTier: "premium",
        updatedStatus: "active",
        rowsAffected: data?.length || 0,
        expiresAt: currentPeriodEnd.toISOString(),
      });
    } catch (error) {
      logger.error("Error in handleOneTimePayment", {
        userId: supabase_user_id,
        sessionId: checkoutSession.id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  } // Internal helper

  async handleSubscriptionChange(supabase_user_id, stripe_subscription_id) {
    try {
      logger.info("Retrieving subscription from Stripe", {
        userId: supabase_user_id,
        subscriptionId: stripe_subscription_id,
      });

      const subscription = await stripe.subscriptions.retrieve(
        stripe_subscription_id
      );

      const newStatus = subscription.status;
      const newTier =
        newStatus === "active" || newStatus === "trialing" ? "premium" : "free";
      const priceId = subscription.items.data[0].price.id; // Create a variable to store the date, defaulting to null

      let currentPeriodEnd = null; // Check if the timestamp exists and is a valid number before converting

      if (
        subscription.current_period_end &&
        typeof subscription.current_period_end === "number"
      ) {
        currentPeriodEnd = new Date(
          subscription.current_period_end * 1000
        ).toISOString();
      }

      logger.info("Updating user subscription in database", {
        userId: supabase_user_id,
        newTier: newTier,
        newStatus: newStatus,
        subscriptionId: subscription.id,
        priceId: priceId,
        currentPeriodEnd: currentPeriodEnd,
      });

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update({
          subscription_tier: newTier,
          subscription_status: newStatus,
          stripe_subscription_id: subscription.id,
          current_period_end: currentPeriodEnd,
          plan_price_id: priceId,
        })
        .eq("id", supabase_user_id)
        .select();

      if (error) {
        logger.error("Failed to update user subscription in database", {
          userId: supabase_user_id,
          error: error.message,
          subscriptionId: stripe_subscription_id,
        });
        throw error;
      }

      logger.info("Successfully updated user subscription", {
        userId: supabase_user_id,
        updatedTier: newTier,
        updatedStatus: newStatus,
        rowsAffected: data?.length || 0,
      });
    } catch (error) {
      logger.error("Error in handleSubscriptionChange", {
        userId: supabase_user_id,
        subscriptionId: stripe_subscription_id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

module.exports = BillingController;
