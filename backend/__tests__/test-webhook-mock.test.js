require("dotenv").config();
const crypto = require("crypto");
const axios = require("axios");

console.log("🧪 Testing Webhook - Mock Test (No Stripe API calls)");
console.log("=====================================================");

// Test payload that won't trigger Stripe API calls
const testPayload = {
  id: "evt_test_mock",
  object: "event",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_mock",
      object: "checkout.session",
      subscription: null, // No subscription to avoid Stripe API call
      customer: "cus_test_mock",
      metadata: {
        supabase_user_id: "550e8400-e29b-41d4-a716-446655440000",
      },
      payment_status: "paid",
      status: "complete",
    },
  },
};

async function testWebhook() {
  try {
    // Check environment
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.log("❌ STRIPE_WEBHOOK_SECRET not found");
      return;
    }

    console.log("✅ Environment variables loaded");

    // Create Stripe signature
    const payload = JSON.stringify(testPayload);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest("hex");

    const stripeSignature = `t=${timestamp},v1=${signature}`;

    console.log("📤 Sending webhook test...");
    console.log(`Event: ${testPayload.type}`);
    console.log(
      `User ID: ${testPayload.data.object.metadata.supabase_user_id}`
    );
    console.log(`Subscription: ${testPayload.data.object.subscription}`);

    // Send webhook request
    const response = await axios.post(
      "http://localhost:3000/api/v1/billing/webhook",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": stripeSignature,
        },
        timeout: 10000,
      }
    );

    console.log("✅ Webhook test successful!");
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, response.data);
  } catch (error) {
    console.log("❌ Webhook test failed:");

    if (error.code === "ECONNREFUSED") {
      console.log("Server is not running. Start it with: npm start");
    } else if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error:`, error.response.data);
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
}

// Run the test
testWebhook();
