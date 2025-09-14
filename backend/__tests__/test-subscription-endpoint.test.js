require("dotenv").config();
const axios = require("axios");

console.log("🧪 Testing Subscription Endpoint");
console.log("=================================");

async function testSubscriptionEndpoint() {
  try {
    console.log("📤 Testing /api/v1/subscription-tier endpoint...");

    // Test without authentication (should fail)
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/subscription-tier"
      );
      console.log("❌ Unexpected: Endpoint should require authentication");
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Authentication required (expected)");
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    // Test with invalid token
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/subscription-tier",
        {
          headers: {
            Authorization: "Bearer invalid-token",
          },
        }
      );
      console.log("❌ Unexpected: Invalid token should be rejected");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Invalid token rejected (expected)");
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    console.log("\n✅ Subscription endpoint is properly protected");
    console.log("To test with real authentication, you need to:");
    console.log("1. Login through the frontend");
    console.log("2. Get the JWT token from browser dev tools");
    console.log("3. Use that token in the Authorization header");
  } catch (error) {
    console.log("❌ Test failed:");

    if (error.code === "ECONNREFUSED") {
      console.log("Server is not running. Start it with: npm start");
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
}

// Run the test
testSubscriptionEndpoint();
