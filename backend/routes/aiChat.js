const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { aiChatController } = controllers;

    // Send a message and get AI response
    router.post('/message', (req, res, next) => aiChatController.sendMessage(req, res, next));

    // Get chat history
    router.get('/history', (req, res, next) => aiChatController.getHistory(req, res, next));

    // Get usage statistics
    router.get('/usage', (req, res, next) => aiChatController.getUsage(req, res, next));

    // Clear chat history
    router.delete('/history', (req, res, next) => aiChatController.clearHistory(req, res, next));

    // Get suggested prompts
    router.get('/prompts', (req, res, next) => aiChatController.getSuggestedPrompts(req, res, next));

    return router;
};
