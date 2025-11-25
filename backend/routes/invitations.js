const express = require('express');

module.exports = (controllers) => {
    const router = express.Router();
    const { invitationController } = controllers;

    // Authenticated routes
    router.get('/pending', (req, res) => invitationController.getPendingInvitations(req, res));
    router.post('/:invitationId/respond', (req, res) => invitationController.respondToInvitation(req, res));

    return router;
};
