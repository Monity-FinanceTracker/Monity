const { supabaseAdmin } = require("../config/supabase");
const { logger } = require("../utils/logger");
const AnalyticsService = require("../services/analyticsService");

// Initialize Stripe only if the secret key is available
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
} else {
  logger.warn("STRIPE_SECRET_KEY not found. Billing features will be disabled.");
}

class BillingController {
  constructor(supabase) {
    this.supabase = supabase;
    this.analyticsService = new AnalyticsService(supabaseAdmin);
  }

  // Helper method to check if Stripe is available
  _ensureStripeAvailable() {
    if (!stripe) {
      throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
    }
  }

  // Helper to look up or create a Stripe customer

  async getOrCreateStripeCustomerId(userId, email) {
    this._ensureStripeAvailable();
    
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
    try {
      this._ensureStripeAvailable();
    } catch (error) {
      return res.status(503).json({ error: error.message });
    }

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
    try {
      this._ensureStripeAvailable();
    } catch (error) {
      return res.status(503).json({ error: error.message });
    }

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
    try {
      this._ensureStripeAvailable();
    } catch (error) {
      return res.status(503).json({ error: error.message });
    }

    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    logger.info("Webhook received", {
      hasSignature: !!sig,
      hasSecret: !!endpointSecret,
      bodyLength: req.body?.length || 0,
      contentType: req.headers["content-type"],
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });

    let event;

    try {
      // With express.raw(), req.body contains the raw buffer
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

      logger.info("Webhook signature verified successfully", {
        eventType: event.type,
        eventId: event.id,
        created: event.created,
        livemode: event.livemode,
      });
    } catch (err) {
      logger.error("Webhook signature verification failed", {
        error: err.message,
        signature: sig,
        bodyLength: req.body?.length || 0,
        bodyPreview: req.body?.toString().substring(0, 200) + "...",
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const checkoutSession = event.data.object;
          const { metadata: { supabase_user_id } = {}, subscription } =
            checkoutSession;

          // ENHANCED LOGGING: Log full checkout session details
          logger.info("Processing checkout.session.completed - DETAILED", {
            sessionId: checkoutSession.id,
            subscriptionId: subscription,
            userId: supabase_user_id,
            paymentStatus: checkoutSession.payment_status,
            status: checkoutSession.status,
            mode: checkoutSession.mode,
            hasMetadata: !!checkoutSession.metadata,
            metadataKeys: Object.keys(checkoutSession.metadata || {}),
            allMetadata: checkoutSession.metadata,
            customerId: checkoutSession.customer,
            amountTotal: checkoutSession.amount_total,
            currency: checkoutSession.currency,
          });

          // METADATA VALIDATION: Check if user ID exists
          if (!supabase_user_id) {
            logger.error("CRITICAL: Missing supabase_user_id in checkout session metadata", {
              sessionId: checkoutSession.id,
              hasMetadata: !!checkoutSession.metadata,
              metadataKeys: Object.keys(checkoutSession.metadata || {}),
              metadata: checkoutSession.metadata,
              customerId: checkoutSession.customer,
            });
            // Don't break - still return 200 to Stripe, but log the issue
            break;
          }

          if (subscription && supabase_user_id) {
            // This is a subscription payment
            logger.info("STARTING: Processing subscription payment", {
              userId: supabase_user_id,
              subscriptionId: subscription,
            });
            await this.handleSubscriptionChange(supabase_user_id, subscription);
            logger.info("SUCCESS: Subscription updated successfully", {
              userId: supabase_user_id,
              subscriptionId: subscription,
            });
          } else if (
            supabase_user_id &&
            checkoutSession.payment_status === "paid"
          ) {
            // This is a one-time payment - upgrade user to premium
            logger.info("STARTING: Processing one-time payment upgrade", {
              userId: supabase_user_id,
              sessionId: checkoutSession.id,
              paymentStatus: checkoutSession.payment_status,
            });

            await this.handleOneTimePayment(supabase_user_id, checkoutSession);
            logger.info("SUCCESS: One-time payment processed successfully", {
              userId: supabase_user_id,
            });
          } else {
            logger.error("SKIPPED: Missing required data in checkout session", {
              hasSubscription: !!subscription,
              hasUserId: !!supabase_user_id,
              paymentStatus: checkoutSession.payment_status,
              status: checkoutSession.status,
              mode: checkoutSession.mode,
              sessionId: checkoutSession.id,
            });
          }
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscriptionObject = event.data.object;
          const customerId = subscriptionObject.customer;

          logger.info("Processing subscription event", {
            eventType: event.type,
            subscriptionId: subscriptionObject.id,
            customerId: customerId,
            status: subscriptionObject.status,
          });

          const { data: [userProfile] = [], error: profileError } =
            await supabaseAdmin
              .from("profiles")
              .select("id, email")
              .eq("stripe_customer_id", customerId);

          if (profileError) {
            logger.error("Failed to find user by stripe_customer_id", {
              customerId: customerId,
              error: profileError.message,
              eventType: event.type,
            });
          } else if (!userProfile) {
            logger.error("No user found with stripe_customer_id", {
              customerId: customerId,
              eventType: event.type,
            });
          } else {
            logger.info("Found user for subscription event", {
              userId: userProfile.id,
              userEmail: userProfile.email,
              customerId: customerId,
            });
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

          logger.info("Processing subscription cancellation/failure", {
            eventType: event.type,
            subscriptionId: deletedSub.id,
            customerId: deletedCustId,
          });

          const { data: [deletedProfile] = [], error: deletedProfileError } =
            await supabaseAdmin
              .from("profiles")
              .select("id, email, subscription_tier")
              .eq("stripe_customer_id", deletedCustId);

          if (deletedProfileError) {
            logger.error("Failed to find user for cancellation", {
              customerId: deletedCustId,
              error: deletedProfileError.message,
            });
          } else if (!deletedProfile) {
            logger.warn("No user found for cancellation", {
              customerId: deletedCustId,
            });
          } else {
            logger.info("Downgrading user to free tier", {
              userId: deletedProfile.id,
              userEmail: deletedProfile.email,
              currentTier: deletedProfile.subscription_tier,
            });

            const { data, error: updateError } = await supabaseAdmin
              .from("profiles")
              .update({
                subscription_tier: "free",
                subscription_status: "canceled",
                stripe_subscription_id: null,
                current_period_end: null,
                plan_price_id: null,
              })
              .eq("id", deletedProfile.id)
              .select();

            if (updateError) {
              logger.error("Failed to downgrade user to free", {
                userId: deletedProfile.id,
                error: updateError.message,
              });
            } else {
              logger.info("Successfully downgraded user to free", {
                userId: deletedProfile.id,
                rowsAffected: data?.length || 0,
              });

              // ANALYTICS: Track subscription cancellation
              try {
                await this.analyticsService.track({
                  userId: deletedProfile.id,
                  sessionId: deletedSub.id,
                  eventName: event.type === 'invoice.payment_failed' ? 'payment_failed' : 'subscription_cancelled',
                  properties: {
                    subscriptionId: deletedSub.id,
                    fromTier: deletedProfile.subscription_tier,
                    toTier: 'free',
                    reason: event.type === 'invoice.payment_failed' ? 'payment_failed' : 'cancelled',
                  },
                  context: {
                    subscriptionTier: 'free',
                  }
                });
                
                logger.info("ANALYTICS: Tracked subscription cancellation event", {
                  userId: deletedProfile.id,
                });
              } catch (analyticsError) {
                logger.error("WARNING: Failed to track analytics event", {
                  userId: deletedProfile.id,
                  error: analyticsError.message,
                });
              }
            }
          }
          break;
        }
        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          const customerId = invoice.customer;
          const subscriptionId = invoice.subscription;

          logger.info("Processing invoice.payment_succeeded", {
            eventType: event.type,
            invoiceId: invoice.id,
            customerId: customerId,
            subscriptionId: subscriptionId,
            amountPaid: invoice.amount_paid,
            currency: invoice.currency,
          });

          if (!subscriptionId) {
            logger.warn("Invoice payment succeeded but no subscription ID", {
              invoiceId: invoice.id,
              customerId: customerId,
            });
            break;
          }

          // Find user by Stripe customer ID
          const { data: [invoiceUserProfile] = [], error: invoiceProfileError } =
            await supabaseAdmin
              .from("profiles")
              .select("id, email, subscription_tier")
              .eq("stripe_customer_id", customerId);

          if (invoiceProfileError) {
            logger.error("Failed to find user for invoice payment", {
              customerId: customerId,
              error: invoiceProfileError.message,
              invoiceId: invoice.id,
            });
          } else if (!invoiceUserProfile) {
            logger.error("No user found for invoice payment", {
              customerId: customerId,
              invoiceId: invoice.id,
            });
          } else {
            logger.info("Found user for invoice payment, updating subscription", {
              userId: invoiceUserProfile.id,
              userEmail: invoiceUserProfile.email,
              currentTier: invoiceUserProfile.subscription_tier,
              customerId: customerId,
            });
            await this.handleSubscriptionChange(
              invoiceUserProfile.id,
              subscriptionId
            );
            logger.info("Successfully processed invoice payment", {
              userId: invoiceUserProfile.id,
              invoiceId: invoice.id,
            });

            // ANALYTICS: Track invoice payment success
            try {
              await this.analyticsService.track({
                userId: invoiceUserProfile.id,
                sessionId: invoice.id,
                eventName: 'payment_succeeded',
                properties: {
                  invoiceId: invoice.id,
                  subscriptionId: subscriptionId,
                  amount: invoice.amount_paid,
                  currency: invoice.currency,
                  paymentType: 'subscription',
                },
                context: {
                  subscriptionTier: invoiceUserProfile.subscription_tier || 'free',
                }
              });
              
              logger.info("ANALYTICS: Tracked payment success event", {
                userId: invoiceUserProfile.id,
                invoiceId: invoice.id,
              });
            } catch (analyticsError) {
              logger.error("WARNING: Failed to track analytics event", {
                userId: invoiceUserProfile.id,
                error: analyticsError.message,
              });
            }
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
        errorCode: error.code,
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
      });

      // USER VERIFICATION: Check if user exists before attempting update
      logger.info("STEP 1: Verifying user exists in database", {
        userId: supabase_user_id,
      });

      const { data: existingUser, error: userCheckError } = await supabaseAdmin
        .from("profiles")
        .select("id, email, subscription_tier, subscription_status")
        .eq("id", supabase_user_id)
        .single();

      if (userCheckError) {
        logger.error("CRITICAL: User lookup failed", {
          userId: supabase_user_id,
          error: userCheckError.message,
          errorCode: userCheckError.code,
          errorDetails: userCheckError.details,
        });
        throw new Error(`User lookup failed: ${userCheckError.message}`);
      }

      if (!existingUser) {
        logger.error("CRITICAL: User not found in database", {
          userId: supabase_user_id,
          sessionId: checkoutSession.id,
        });
        throw new Error(`User ${supabase_user_id} not found in database`);
      }

      logger.info("STEP 1 SUCCESS: User found in database", {
        userId: supabase_user_id,
        userEmail: existingUser.email,
        currentTier: existingUser.subscription_tier,
        currentStatus: existingUser.subscription_status,
      });

      // For one-time payments, upgrade user to premium for a fixed period
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1); // 1 month premium

      logger.info("STEP 2: Updating user to premium", {
        userId: supabase_user_id,
        fromTier: existingUser.subscription_tier,
        toTier: "premium",
        expiresAt: currentPeriodEnd.toISOString(),
      });

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
        logger.error("CRITICAL: Database update failed", {
          userId: supabase_user_id,
          error: error.message,
          errorCode: error.code,
          errorDetails: error.details,
          sessionId: checkoutSession.id,
        });
        throw error;
      }

      if (!data || data.length === 0) {
        logger.error("CRITICAL: No rows updated (user may have been deleted)", {
          userId: supabase_user_id,
          sessionId: checkoutSession.id,
        });
        throw new Error("Database update returned no rows");
      }

      logger.info("STEP 2 SUCCESS: Database update completed", {
        userId: supabase_user_id,
        rowsAffected: data?.length || 0,
      });

      // POST-UPDATE VERIFICATION: Confirm the update worked
      logger.info("STEP 3: Verifying database update", {
        userId: supabase_user_id,
      });

      const { data: updatedUser, error: verifyError } = await supabaseAdmin
        .from("profiles")
        .select("subscription_tier, subscription_status, current_period_end")
        .eq("id", supabase_user_id)
        .single();

      if (verifyError) {
        logger.error("WARNING: Post-update verification failed", {
          userId: supabase_user_id,
          error: verifyError.message,
        });
      } else {
        logger.info("STEP 3 SUCCESS: Update verification completed", {
          userId: supabase_user_id,
          verifiedTier: updatedUser?.subscription_tier,
          verifiedStatus: updatedUser?.subscription_status,
          verifiedExpiry: updatedUser?.current_period_end,
          updateSuccessful: updatedUser?.subscription_tier === "premium",
        });

        if (updatedUser?.subscription_tier !== "premium") {
          logger.error("CRITICAL: Update verification FAILED - tier not premium!", {
            userId: supabase_user_id,
            expectedTier: "premium",
            actualTier: updatedUser?.subscription_tier,
          });
        }
      }

      logger.info("COMPLETE: One-time payment processing finished", {
        userId: supabase_user_id,
        updatedTier: "premium",
        updatedStatus: "active",
        expiresAt: currentPeriodEnd.toISOString(),
      });

      // ANALYTICS: Track successful premium upgrade
      try {
        await this.analyticsService.track({
          userId: supabase_user_id,
          sessionId: checkoutSession.id,
          eventName: 'subscription_upgraded',
          properties: {
            fromTier: existingUser.subscription_tier || 'free',
            toTier: 'premium',
            paymentType: 'one_time',
            amount: checkoutSession.amount_total,
            currency: checkoutSession.currency,
            sessionId: checkoutSession.id,
            expiresAt: currentPeriodEnd.toISOString(),
          },
          context: {
            subscriptionTier: 'premium',
          }
        });
        
        logger.info("ANALYTICS: Tracked subscription upgrade event", {
          userId: supabase_user_id,
        });
      } catch (analyticsError) {
        // Don't fail the payment if analytics fails
        logger.error("WARNING: Failed to track analytics event", {
          userId: supabase_user_id,
          error: analyticsError.message,
        });
      }
    } catch (error) {
      logger.error("FAILED: Error in handleOneTimePayment", {
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
      this._ensureStripeAvailable();
      
      // Validate inputs
      if (!supabase_user_id) {
        throw new Error("supabase_user_id is required");
      }
      if (!stripe_subscription_id) {
        throw new Error("stripe_subscription_id is required");
      }

      logger.info("Retrieving subscription from Stripe", {
        userId: supabase_user_id,
        subscriptionId: stripe_subscription_id,
      });

      // Retrieve subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(stripe_subscription_id);

      // Validate subscription data
      if (!subscription) {
        throw new Error("Failed to retrieve subscription from Stripe");
      }

      if (!subscription.items || !subscription.items.data || subscription.items.data.length === 0) {
        throw new Error("Subscription has no items");
      }

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

      logger.info("STEP 2: Preparing to update user subscription in database", {
        userId: supabase_user_id,
        newTier: newTier,
        newStatus: newStatus,
        subscriptionId: subscription.id,
        priceId: priceId,
        currentPeriodEnd: currentPeriodEnd,
      });

      // First, check if user profile exists and get current state
      logger.info("STEP 2A: Checking if user profile exists", {
        userId: supabase_user_id,
      });

      const { data: existingProfile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, email, subscription_tier, subscription_status")
        .eq("id", supabase_user_id)
        .single();

      if (profileError) {
        logger.error("CRITICAL: User profile lookup failed", {
          userId: supabase_user_id,
          error: profileError.message,
          errorCode: profileError.code,
        });
        throw new Error(`User profile not found: ${profileError.message}`);
      }

      if (!existingProfile) {
        logger.error("CRITICAL: No profile found for user", {
          userId: supabase_user_id,
        });
        throw new Error(`No profile found for user ${supabase_user_id}`);
      }

      logger.info("STEP 2A SUCCESS: User profile found", {
        userId: supabase_user_id,
        email: existingProfile.email,
        currentTier: existingProfile.subscription_tier,
        currentStatus: existingProfile.subscription_status,
      });

      logger.info("STEP 2B: Executing database update", {
        userId: supabase_user_id,
        fromTier: existingProfile.subscription_tier,
        toTier: newTier,
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
        logger.error("CRITICAL: Failed to update user subscription in database", {
          userId: supabase_user_id,
          error: error.message,
          errorCode: error.code,
          errorDetails: error.details,
          subscriptionId: stripe_subscription_id,
        });
        throw error;
      }

      if (!data || data.length === 0) {
        logger.error("CRITICAL: No rows updated in database", {
          userId: supabase_user_id,
          subscriptionId: stripe_subscription_id,
        });
        throw new Error("No rows were updated in the database");
      }

      logger.info("STEP 2B SUCCESS: Database update completed", {
        userId: supabase_user_id,
        rowsAffected: data?.length || 0,
        updatedProfile: data[0],
      });

      // POST-UPDATE VERIFICATION: Confirm the update worked
      logger.info("STEP 3: Verifying database update", {
        userId: supabase_user_id,
      });

      const { data: verifiedProfile, error: verifyError } = await supabaseAdmin
        .from("profiles")
        .select("subscription_tier, subscription_status, stripe_subscription_id, current_period_end")
        .eq("id", supabase_user_id)
        .single();

      if (verifyError) {
        logger.error("WARNING: Post-update verification failed", {
          userId: supabase_user_id,
          error: verifyError.message,
        });
      } else {
        const tierMatches = verifiedProfile?.subscription_tier === newTier;
        const statusMatches = verifiedProfile?.subscription_status === newStatus;

        logger.info("STEP 3 SUCCESS: Update verification completed", {
          userId: supabase_user_id,
          expectedTier: newTier,
          verifiedTier: verifiedProfile?.subscription_tier,
          tierMatches: tierMatches,
          expectedStatus: newStatus,
          verifiedStatus: verifiedProfile?.subscription_status,
          statusMatches: statusMatches,
          verifiedSubscriptionId: verifiedProfile?.stripe_subscription_id,
          verifiedExpiry: verifiedProfile?.current_period_end,
          updateSuccessful: tierMatches && statusMatches,
        });

        if (!tierMatches || !statusMatches) {
          logger.error("CRITICAL: Update verification FAILED - mismatch detected!", {
            userId: supabase_user_id,
            tierMismatch: !tierMatches,
            statusMismatch: !statusMatches,
            expected: { tier: newTier, status: newStatus },
            actual: { 
              tier: verifiedProfile?.subscription_tier,
              status: verifiedProfile?.subscription_status
            },
          });
        }
      }

      logger.info("COMPLETE: Successfully updated user subscription", {
        userId: supabase_user_id,
        updatedTier: newTier,
        updatedStatus: newStatus,
      });

      // ANALYTICS: Track subscription change
      try {
        await this.analyticsService.track({
          userId: supabase_user_id,
          sessionId: stripe_subscription_id,
          eventName: newStatus === 'active' || newStatus === 'trialing' ? 'subscription_activated' : 'subscription_status_changed',
          properties: {
            fromTier: existingProfile.subscription_tier || 'free',
            toTier: newTier,
            subscriptionId: subscription.id,
            status: newStatus,
            priceId: priceId,
            currentPeriodEnd: currentPeriodEnd,
          },
          context: {
            subscriptionTier: newTier,
          }
        });
        
        logger.info("ANALYTICS: Tracked subscription change event", {
          userId: supabase_user_id,
          eventName: newStatus === 'active' ? 'subscription_activated' : 'subscription_status_changed',
        });
      } catch (analyticsError) {
        logger.error("WARNING: Failed to track analytics event", {
          userId: supabase_user_id,
          error: analyticsError.message,
        });
      }

      return {
        success: true,
        userId: supabase_user_id,
        subscriptionId: subscription.id,
        tier: newTier,
        status: newStatus,
      };
    } catch (error) {
      logger.error("Error in handleSubscriptionChange", {
        userId: supabase_user_id,
        subscriptionId: stripe_subscription_id,
        error: error.message,
        errorCode: error.code,
        stack: error.stack,
      });
      throw error;
    }
  }
}

module.exports = BillingController;
