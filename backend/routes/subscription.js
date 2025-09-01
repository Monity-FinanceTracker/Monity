const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { subscriptionController } = controllers;
    router.get('/', subscriptionController.getSubscriptionTier.bind(subscriptionController));
    return router;
};
