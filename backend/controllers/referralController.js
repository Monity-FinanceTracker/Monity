const ReferralService = require('../services/referralService');
const { logger } = require('../utils/logger');
const { supabaseAdmin } = require('../config/supabase');

class ReferralController {
    constructor(supabase) {
        // Use supabaseAdmin to bypass RLS policies for backend operations
        this.supabase = supabaseAdmin;
        this.referralService = new ReferralService(supabaseAdmin);
    }

    /**
     * GET /api/v1/referrals/my-code
     * Get or generate user's referral code
     */
    async getMyCode(req, res) {
        try {
            const userId = req.user.id;
            const userName = req.user.user_metadata?.name || req.user.email;

            // Generate or retrieve referral code
            const result = await this.referralService.generateReferralCode(userId, userName);

            // Build full URLs
            const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://app.monity-finance.com';
            const fullLink = `${baseUrl}/signup?ref=${result.referralCode}`;
            const shortUrl = `${baseUrl}/r/${result.shortLink}`;

            // Get stats
            const stats = await this.referralService.getReferralStats(userId);

            return res.status(200).json({
                success: true,
                data: {
                    referralCode: result.referralCode,
                    shortLink: result.shortLink,
                    fullLink,
                    shortUrl,
                    qrCodeUrl: `${process.env.NEXT_PUBLIC_BASE_URL || baseUrl}/api/v1/referrals/qr/${result.shortLink}`,
                    stats: {
                        totalReferrals: stats.totalReferrals,
                        successfulReferrals: stats.successfulReferrals,
                        pendingReferrals: stats.pendingReferrals,
                        totalDaysEarned: stats.totalDaysEarned,
                        monthlyCapRemaining: stats.monthlyCapRemaining
                    }
                }
            });

        } catch (error) {
            logger.error('Error getting referral code', {
                userId: req.user?.id,
                error: error.message
            });

            return res.status(500).json({
                success: false,
                error: 'Failed to get referral code',
                message: error.message
            });
        }
    }

    /**
     * POST /api/v1/referrals/validate-code
     * Validate a referral code
     */
    async validateCode(req, res) {
        try {
            const { referralCode } = req.body;

            if (!referralCode) {
                return res.status(400).json({
                    success: false,
                    valid: false,
                    error: 'Referral code is required'
                });
            }

            const validation = await this.referralService.validateReferralCode(referralCode);

            if (validation.valid) {
                return res.status(200).json({
                    success: true,
                    valid: true,
                    referrerName: validation.referrerName,
                    message: `Código válido! Você ganhará 7 dias de teste grátis, e ${validation.referrerName} receberá recompensas.`
                });
            } else {
                return res.status(200).json({
                    success: true,
                    valid: false,
                    message: 'Código de indicação inválido ou expirado.'
                });
            }

        } catch (error) {
            logger.error('Error validating referral code', {
                error: error.message
            });

            return res.status(500).json({
                success: false,
                valid: false,
                error: 'Failed to validate referral code'
            });
        }
    }

    /**
     * GET /api/v1/referrals/stats
     * Get detailed referral statistics for current user
     */
    async getStats(req, res) {
        try {
            const userId = req.user.id;

            const stats = await this.referralService.getReferralStats(userId);

            return res.status(200).json({
                success: true,
                data: {
                    summary: {
                        totalReferrals: stats.totalReferrals,
                        successfulReferrals: stats.successfulReferrals,
                        pendingReferrals: stats.pendingReferrals,
                        expiredReferrals: stats.expiredReferrals,
                        totalDaysEarned: stats.totalDaysEarned,
                        currentTier: stats.currentTier,
                        currentTierDays: stats.currentTierDays,
                        nextTier: stats.nextTier,
                        monthlyCapRemaining: stats.monthlyCapRemaining
                    },
                    recentReferrals: stats.recentReferrals.slice(0, 10).map(ref => ({
                        id: ref.id,
                        referredUserName: ref.profiles?.name || 'Usuário',
                        status: ref.status,
                        signupDate: ref.signup_completed_at,
                        qualifiedDate: ref.first_transaction_at,
                        rewardDays: ref.reward_days,
                        rewardTier: ref.reward_tier
                    }))
                }
            });

        } catch (error) {
            logger.error('Error getting referral stats', {
                userId: req.user?.id,
                error: error.message
            });

            return res.status(500).json({
                success: false,
                error: 'Failed to get referral stats',
                message: error.message
            });
        }
    }

    /**
     * GET /api/v1/referrals/list
     * Get paginated list of user's referrals
     */
    async listReferrals(req, res) {
        try {
            const userId = req.user.id;
            const {
                status,
                limit = 20,
                offset = 0
            } = req.query;

            let query = this.supabase
                .from('referrals')
                .select('*, profiles:referred_user_id(name, email)', { count: 'exact' })
                .eq('referrer_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (status) {
                query = query.eq('status', status);
            }

            const { data: referrals, error, count } = await query;

            if (error) {
                throw error;
            }

            return res.status(200).json({
                success: true,
                data: referrals,
                pagination: {
                    total: count,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: (offset + limit) < count
                }
            });

        } catch (error) {
            logger.error('Error listing referrals', {
                userId: req.user?.id,
                error: error.message
            });

            return res.status(500).json({
                success: false,
                error: 'Failed to list referrals',
                message: error.message
            });
        }
    }

    /**
     * GET /api/v1/referrals/leaderboard
     * Get top referrers leaderboard
     */
    async getLeaderboard(req, res) {
        try {
            const { period = 'month', limit = 10 } = req.query;

            // Get top referrers by successful_referrals count
            const { data: topReferrers, error } = await this.supabase
                .from('profiles')
                .select('id, name, successful_referrals, premium_days_earned')
                .gt('successful_referrals', 0)
                .order('successful_referrals', { ascending: false })
                .limit(parseInt(limit));

            if (error) {
                throw error;
            }

            // Anonymize for privacy (only show first name + initial)
            const leaderboard = topReferrers.map((user, index) => ({
                position: index + 1,
                name: this.anonymizeName(user.name),
                successfulReferrals: user.successful_referrals,
                daysEarned: user.premium_days_earned,
                isCurrentUser: user.id === req.user?.id
            }));

            // Find current user's position
            let userPosition = null;
            if (req.user) {
                const { data: userData } = await this.supabase
                    .from('profiles')
                    .select('successful_referrals')
                    .eq('id', req.user.id)
                    .single();

                if (userData && userData.successful_referrals > 0) {
                    const { count } = await this.supabase
                        .from('profiles')
                        .select('id', { count: 'exact', head: true })
                        .gt('successful_referrals', userData.successful_referrals);

                    userPosition = (count || 0) + 1;
                }
            }

            return res.status(200).json({
                success: true,
                data: {
                    leaderboard,
                    userPosition,
                    totalUsers: topReferrers.length
                }
            });

        } catch (error) {
            logger.error('Error getting leaderboard', {
                error: error.message
            });

            return res.status(500).json({
                success: false,
                error: 'Failed to get leaderboard',
                message: error.message
            });
        }
    }

    /**
     * POST /api/v1/referrals/regenerate-code
     * Regenerate user's referral code (max once per month)
     */
    async regenerateCode(req, res) {
        try {
            const userId = req.user.id;

            // Check if user has a code and when it was created
            const { data: existingCode, error: fetchError } = await this.supabase
                .from('referral_codes')
                .select('created_at')
                .eq('user_id', userId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            if (existingCode) {
                // Check if created less than 30 days ago
                const createdAt = new Date(existingCode.created_at);
                const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

                if (daysSinceCreation < 30) {
                    return res.status(429).json({
                        success: false,
                        error: 'You can only regenerate your code once per month',
                        daysRemaining: Math.ceil(30 - daysSinceCreation)
                    });
                }

                // Delete old code
                await this.supabase
                    .from('referral_codes')
                    .delete()
                    .eq('user_id', userId);
            }

            // Generate new code
            const userName = req.user.user_metadata?.name || req.user.email;
            const result = await this.referralService.generateReferralCode(userId, userName);

            return res.status(200).json({
                success: true,
                data: {
                    referralCode: result.referralCode,
                    shortLink: result.shortLink,
                    message: 'Código regenerado com sucesso!'
                }
            });

        } catch (error) {
            logger.error('Error regenerating referral code', {
                userId: req.user?.id,
                error: error.message
            });

            return res.status(500).json({
                success: false,
                error: 'Failed to regenerate referral code',
                message: error.message
            });
        }
    }

    // ===== HELPER METHODS =====

    /**
     * Anonymize name for leaderboard (privacy)
     * Example: "João Silva" -> "João S."
     */
    anonymizeName(fullName) {
        if (!fullName) return 'Usuário';

        const parts = fullName.split(' ');
        if (parts.length === 1) {
            return parts[0];
        }

        return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    }
}

module.exports = ReferralController;
