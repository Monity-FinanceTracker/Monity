const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { referralController } = controllers;

    // Get or generate user's referral code
    router.get('/my-code', (req, res) => referralController.getMyCode(req, res));

    // Validate a referral code (used during signup)
    router.post('/validate-code', (req, res) => referralController.validateCode(req, res));

    // Get detailed referral statistics
    router.get('/stats', (req, res) => referralController.getStats(req, res));

    // Get paginated list of referrals
    router.get('/list', (req, res) => referralController.listReferrals(req, res));

    // Get referrals leaderboard
    router.get('/leaderboard', (req, res) => referralController.getLeaderboard(req, res));

    // Regenerate referral code (max once per month)
    router.post('/regenerate-code', (req, res) => referralController.regenerateCode(req, res));

    return router;
};
