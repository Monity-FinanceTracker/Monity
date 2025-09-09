// backend/routes/billing.js
const express = require("express");

module.exports = (controllers) => {
  const router = express.Router();

  // Auth is applied at mount point in routes/index.js
  router.post(
    "/create-checkout-session",
    controllers.billingController.createCheckoutSession
  );

  router.post(
    "/create-portal-session",
    controllers.billingController.createBillingPortalSession
  );

  return router;
};
