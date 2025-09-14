const express = require("express");

module.exports = (controllers) => {
  const router = express.Router(); // Suas rotas existentes

  router.post(
    "/create-checkout-session",
    controllers.billingController.createCheckoutSession
  );

  router.post(
    "/create-portal-session",
    controllers.billingController.createBillingPortalSession
  ); // A rota do webhook foi movida para server.js para evitar conflitos // e garantir que o corpo da requisição bruta seja analisado corretamente.

  return router;
};
