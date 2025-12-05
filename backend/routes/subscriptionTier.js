const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { subscriptionController } = controllers;
    router.get('/', (req, res) => subscriptionController.getSubscriptionTier(req, res));
    return router;
};

