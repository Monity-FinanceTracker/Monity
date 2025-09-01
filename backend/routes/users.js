const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { userController } = controllers;

    // User search endpoint
    router.get('/search', (req, res, next) => userController.searchUsers(req, res, next));

    return router;
};
