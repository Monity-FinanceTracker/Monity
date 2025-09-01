const express = require('express');

module.exports = (controllers) => {
    const router = express.Router();
    const { invitationController } = controllers;

    router.get('/pending', (req, res) => invitationController.getPendingInvitations(req, res));

    return router;
};
