const { logger } = require('../utils/logger');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * ReferralService
 * Handles all referral/invite reward system logic
 */
class ReferralService {
    constructor(supabase) {
        this.supabase = supabase;

        // Reward tier configuration
        this.rewardTiers = {
            tier_1: { minReferrals: 0, maxReferrals: 0, days: 14 },   // First referral
            tier_2: { minReferrals: 1, maxReferrals: 3, days: 7 },    // 2-4 referrals
            tier_3: { minReferrals: 4, maxReferrals: 8, days: 5 },    // 5-9 referrals
            tier_4: { minReferrals: 9, maxReferrals: Infinity, days: 3 } // 10+ referrals
        };

        this.lifetimeCapDays = 60; // Maximum days that can be earned EVER (lifetime cap)
        this.referralExpiryDays = 30; // Days until pending referral expires
    }

    /**
     * Generate a unique referral code for a user
     * Format: FIRSTNAME + 4 random digits (e.g., "JOAO2847")
     *
     * @param {string} userId - User ID
     * @param {string} userName - User's full name
     * @returns {Promise<Object>} - { referralCode, shortLink }
     */
    async generateReferralCode(userId, userName) {
        try {
            // Check if user already has a referral code
            const { data: existing, error: checkError } = await this.supabase
                .from('referral_codes')
                .select('referral_code, short_link')
                .eq('user_id', userId)
                .single();

            if (!checkError && existing) {
                logger.info('User already has referral code', { userId, code: existing.referral_code });
                return {
                    referralCode: existing.referral_code,
                    shortLink: existing.short_link
                };
            }

            // Extract and normalize first name
            const firstName = this.normalizeFirstName(userName);

            // Generate unique code
            let referralCode;
            let isUnique = false;
            let attempts = 0;
            const maxAttempts = 10;

            while (!isUnique && attempts < maxAttempts) {
                const randomDigits = this.generateRandomDigits(4);
                referralCode = `${firstName}${randomDigits}`.toUpperCase();

                // Check uniqueness
                const { data: existingCode } = await this.supabase
                    .from('referral_codes')
                    .select('id')
                    .eq('referral_code', referralCode)
                    .single();

                if (!existingCode) {
                    isUnique = true;
                }
                attempts++;
            }

            if (!isUnique) {
                throw new Error('Failed to generate unique referral code after multiple attempts');
            }

            // Generate short link code (6 characters, alphanumeric)
            const shortLink = this.generateShortLinkCode();

            // Insert into database
            const { data: newCode, error: insertError } = await this.supabase
                .from('referral_codes')
                .insert({
                    user_id: userId,
                    referral_code: referralCode,
                    short_link: shortLink,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (insertError) {
                logger.error('Failed to insert referral code', { userId, error: insertError.message });
                throw insertError;
            }

            logger.info('Referral code generated successfully', {
                userId,
                referralCode,
                shortLink
            });

            return {
                referralCode: newCode.referral_code,
                shortLink: newCode.short_link
            };

        } catch (error) {
            logger.error('Error generating referral code', {
                userId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Validate if a referral code exists and is active
     *
     * @param {string} referralCode - The referral code to validate
     * @returns {Promise<Object>} - { valid, referrerId, referrerName }
     */
    async validateReferralCode(referralCode) {
        try {
            if (!referralCode || referralCode.trim().length === 0) {
                return { valid: false };
            }

            const normalizedCode = referralCode.trim().toUpperCase();

            // Look up referral code
            const { data: codeData, error } = await this.supabase
                .from('referral_codes')
                .select(`
                    user_id,
                    is_active,
                    profiles:user_id (
                        name
                    )
                `)
                .eq('referral_code', normalizedCode)
                .single();

            if (error || !codeData) {
                return { valid: false };
            }

            if (!codeData.is_active) {
                return { valid: false, reason: 'Code is inactive' };
            }

            return {
                valid: true,
                referrerId: codeData.user_id,
                referrerName: codeData.profiles?.name || 'A friend'
            };

        } catch (error) {
            logger.error('Error validating referral code', {
                referralCode,
                error: error.message
            });
            return { valid: false };
        }
    }

    /**
     * Apply referral code during user signup
     * Creates a pending referral record
     *
     * @param {string} referredUserId - ID of new user being referred
     * @param {string} referralCode - Referral code used
     * @param {Object} metadata - Additional data (IP, device fingerprint, etc.)
     * @returns {Promise<Object>}
     */
    async applyReferralCode(referredUserId, referralCode, metadata = {}) {
        try {
            // Validate the referral code
            const validation = await this.validateReferralCode(referralCode);

            if (!validation.valid) {
                throw new Error('Invalid referral code');
            }

            const { referrerId } = validation;

            // Prevent self-referral
            if (referrerId === referredUserId) {
                logger.warn('User attempted to use their own referral code', { referredUserId });
                throw new Error('Cannot use your own referral code');
            }

            // Check if user was already referred
            const { data: existingReferral } = await this.supabase
                .from('referrals')
                .select('id')
                .eq('referred_user_id', referredUserId)
                .single();

            if (existingReferral) {
                logger.warn('User already has a referral record', { referredUserId });
                throw new Error('User has already been referred');
            }

            // Hash IP address for fraud prevention
            const signupIpHash = metadata.ipAddress ? this.hashIP(metadata.ipAddress) : null;

            // Create pending referral record
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + this.referralExpiryDays);

            const { data: referral, error: insertError } = await this.supabase
                .from('referrals')
                .insert({
                    referrer_id: referrerId,
                    referred_user_id: referredUserId,
                    referral_code: referralCode.toUpperCase(),
                    status: 'pending',
                    signup_completed_at: new Date().toISOString(),
                    expires_at: expiresAt.toISOString(),
                    signup_ip_hash: signupIpHash,
                    signup_device_fingerprint: metadata.deviceFingerprint || null,
                    referred_user_email_hash: metadata.emailHash || null
                })
                .select()
                .single();

            if (insertError) {
                logger.error('Failed to create referral record', {
                    referredUserId,
                    error: insertError.message
                });
                throw insertError;
            }

            // Update referral code usage stats
            await this.supabase
                .from('referral_codes')
                .update({
                    total_uses: this.supabase.sql`total_uses + 1`,
                    last_used_at: new Date().toISOString()
                })
                .eq('referral_code', referralCode.toUpperCase());

            // Update referred user profile
            await this.supabase
                .from('profiles')
                .update({
                    referred_by_code: referralCode.toUpperCase(),
                    referral_signup_date: new Date().toISOString(),
                    signup_ip_hash: signupIpHash,
                    signup_device_fingerprint: metadata.deviceFingerprint || null
                })
                .eq('id', referredUserId);

            // Update referrer's total_referrals counter
            await this.supabase
                .from('profiles')
                .update({
                    total_referrals: this.supabase.sql`total_referrals + 1`
                })
                .eq('id', referrerId);

            logger.info('Referral code applied successfully', {
                referredUserId,
                referrerId,
                referralCode,
                referralId: referral.id
            });

            return {
                success: true,
                referralId: referral.id,
                referrerId,
                status: 'pending'
            };

        } catch (error) {
            logger.error('Error applying referral code', {
                referredUserId,
                referralCode,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Qualify a referral when referred user adds their first transaction
     * This triggers the reward granting process
     *
     * @param {string} referredUserId - ID of user who added first transaction
     * @returns {Promise<Object>}
     */
    async qualifyReferral(referredUserId) {
        try {
            // Get pending referral for this user
            const { data: referral, error: fetchError } = await this.supabase
                .from('referrals')
                .select('*')
                .eq('referred_user_id', referredUserId)
                .eq('status', 'pending')
                .single();

            if (fetchError || !referral) {
                logger.debug('No pending referral found for user', { referredUserId });
                return { success: false, reason: 'No pending referral' };
            }

            // Check if referral has expired
            const now = new Date();
            const expiresAt = new Date(referral.expires_at);

            if (now > expiresAt) {
                logger.warn('Referral has expired', {
                    referredUserId,
                    referralId: referral.id,
                    expiresAt
                });

                // Mark as expired
                await this.supabase
                    .from('referrals')
                    .update({ status: 'expired', updated_at: new Date().toISOString() })
                    .eq('id', referral.id);

                return { success: false, reason: 'Referral expired' };
            }

            // Get referrer info
            const { data: referrer, error: referrerError } = await this.supabase
                .from('profiles')
                .select('id, name, subscription_tier, subscription_status, stripe_subscription_id, successful_referrals')
                .eq('id', referral.referrer_id)
                .single();

            if (referrerError) {
                logger.error('Failed to fetch referrer data', {
                    referrerId: referral.referrer_id,
                    error: referrerError.message
                });
                throw referrerError;
            }

            // Calculate reward tier based on referrer's successful referral count
            const rewardTier = this.calculateRewardTier(referrer.successful_referrals || 0);

            // Check lifetime cap (60 days maximum EVER)
            const hitCap = await this.checkLifetimeReferralCap(referrer.id);

            if (hitCap) {
                logger.warn('Referrer hit lifetime cap (60 days)', {
                    referrerId: referrer.id,
                    referralId: referral.id
                });

                // Still mark as qualified but don't grant reward yet
                await this.supabase
                    .from('referrals')
                    .update({
                        status: 'qualified',
                        first_transaction_at: new Date().toISOString(),
                        reward_tier: rewardTier.tier,
                        reward_days: rewardTier.days,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', referral.id);

                return {
                    success: false,
                    reason: 'Lifetime cap reached (60 days total)',
                    qualified: true
                };
            }

            // Mark referral as qualified
            await this.supabase
                .from('referrals')
                .update({
                    status: 'qualified',
                    first_transaction_at: new Date().toISOString(),
                    reward_granted_at: new Date().toISOString(),
                    reward_tier: rewardTier.tier,
                    reward_days: rewardTier.days,
                    updated_at: new Date().toISOString()
                })
                .eq('id', referral.id);

            // Grant reward based on subscription status
            let rewardResult;
            if (referrer.subscription_tier === 'premium' && referrer.subscription_status === 'active') {
                // Premium user - pause Stripe billing
                rewardResult = await this.grantRewardToPremiumUser(referrer, rewardTier.days, referral.id);
            } else {
                // Free user - activate earned premium
                rewardResult = await this.grantRewardToFreeUser(referrer, rewardTier.days, referral.id);
            }

            // Create reward record
            await this.supabase
                .from('referral_rewards')
                .insert({
                    referral_id: referral.id,
                    referrer_id: referrer.id,
                    referred_user_id: referredUserId,
                    reward_type: 'premium_days',
                    reward_amount: rewardTier.days,
                    reward_tier: rewardTier.tier,
                    status: rewardResult.success ? 'applied' : 'pending',
                    applied_at: rewardResult.success ? new Date().toISOString() : null
                });

            // Update referrer's successful_referrals counter
            await this.supabase
                .from('profiles')
                .update({
                    successful_referrals: this.supabase.sql`successful_referrals + 1`,
                    premium_days_earned: this.supabase.sql`premium_days_earned + ${rewardTier.days}`
                })
                .eq('id', referrer.id);

            // Update referral code successful_referrals counter
            await this.supabase
                .from('referral_codes')
                .update({
                    successful_referrals: this.supabase.sql`successful_referrals + 1`
                })
                .eq('referral_code', referral.referral_code);

            logger.info('Referral qualified and reward granted', {
                referralId: referral.id,
                referrerId: referrer.id,
                referredUserId,
                rewardTier: rewardTier.tier,
                rewardDays: rewardTier.days
            });

            return {
                success: true,
                referralId: referral.id,
                rewardTier: rewardTier.tier,
                rewardDays: rewardTier.days,
                rewardResult
            };

        } catch (error) {
            logger.error('Error qualifying referral', {
                referredUserId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Grant reward to FREE tier user
     * Activates earned premium for specified days
     *
     * @param {Object} referrer - Referrer user object
     * @param {number} days - Number of days to grant
     * @param {string} referralId - Referral ID
     * @returns {Promise<Object>}
     */
    async grantRewardToFreeUser(referrer, days, referralId) {
        try {
            // Calculate expiration date
            let expiresAt = new Date();

            // If user already has earned premium, extend it
            if (referrer.premium_earned_expires_at) {
                const currentExpiry = new Date(referrer.premium_earned_expires_at);
                if (currentExpiry > new Date()) {
                    expiresAt = currentExpiry;
                }
            }

            expiresAt.setDate(expiresAt.getDate() + days);

            // Update user profile
            const { error: updateError } = await this.supabase
                .from('profiles')
                .update({
                    premium_earned_expires_at: expiresAt.toISOString()
                })
                .eq('id', referrer.id);

            if (updateError) {
                logger.error('Failed to grant reward to free user', {
                    referrerId: referrer.id,
                    error: updateError.message
                });
                throw updateError;
            }

            logger.info('Reward granted to free user', {
                referrerId: referrer.id,
                days,
                expiresAt: expiresAt.toISOString()
            });

            return {
                success: true,
                type: 'premium_activation',
                expiresAt: expiresAt.toISOString()
            };

        } catch (error) {
            logger.error('Error granting reward to free user', {
                referrerId: referrer.id,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Grant reward to PREMIUM tier user
     * Pauses Stripe subscription billing for specified days
     *
     * @param {Object} referrer - Referrer user object
     * @param {number} days - Number of days to grant
     * @param {string} referralId - Referral ID
     * @returns {Promise<Object>}
     */
    async grantRewardToPremiumUser(referrer, days, referralId) {
        try {
            if (!referrer.stripe_subscription_id) {
                logger.error('Premium user has no Stripe subscription ID', {
                    referrerId: referrer.id
                });
                throw new Error('Premium user has no Stripe subscription');
            }

            // Calculate resume timestamp
            const daysInSeconds = days * 24 * 60 * 60;
            const now = Math.floor(Date.now() / 1000);
            let resumeAt = now + daysInSeconds;

            // Get current subscription from Stripe
            const subscription = await stripe.subscriptions.retrieve(referrer.stripe_subscription_id);

            // Check if subscription is already paused
            if (subscription.pause_collection && subscription.pause_collection.resumes_at) {
                // Extend the existing pause
                resumeAt = subscription.pause_collection.resumes_at + daysInSeconds;
                logger.info('Extending existing pause', {
                    referrerId: referrer.id,
                    currentResumeAt: subscription.pause_collection.resumes_at,
                    newResumeAt: resumeAt
                });
            }

            // Update Stripe subscription to pause billing
            await stripe.subscriptions.update(referrer.stripe_subscription_id, {
                pause_collection: {
                    behavior: 'void',
                    resumes_at: resumeAt
                }
            });

            // Update user profile
            await this.supabase
                .from('profiles')
                .update({
                    billing_paused_until: new Date(resumeAt * 1000).toISOString()
                })
                .eq('id', referrer.id);

            // Calculate savings (R$ saved)
            const dailyRate = 0.33; // R$9.90 / 30 days
            const savings = (days * dailyRate).toFixed(2);

            logger.info('Stripe billing paused for premium user', {
                referrerId: referrer.id,
                subscriptionId: referrer.stripe_subscription_id,
                days,
                resumeAt: new Date(resumeAt * 1000).toISOString(),
                savings: `R$${savings}`
            });

            return {
                success: true,
                type: 'billing_pause',
                resumeAt: new Date(resumeAt * 1000).toISOString(),
                savings: parseFloat(savings)
            };

        } catch (error) {
            logger.error('Error granting reward to premium user', {
                referrerId: referrer.id,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get referral statistics for a user
     *
     * @param {string} userId - User ID
     * @returns {Promise<Object>}
     */
    async getReferralStats(userId) {
        try {
            // Get user's referral code
            const { data: codeData } = await this.supabase
                .from('referral_codes')
                .select('*')
                .eq('user_id', userId)
                .single();

            // Get user profile for counters
            const { data: profile } = await this.supabase
                .from('profiles')
                .select('total_referrals, successful_referrals, premium_days_earned')
                .eq('id', userId)
                .single();

            // Get referral list
            const { data: referrals } = await this.supabase
                .from('referrals')
                .select('*, profiles:referred_user_id(name)')
                .eq('referrer_id', userId)
                .order('created_at', { ascending: false });

            // Count by status
            const statusCounts = {
                pending: 0,
                qualified: 0,
                expired: 0,
                cancelled: 0
            };

            if (referrals) {
                referrals.forEach(ref => {
                    statusCounts[ref.status] = (statusCounts[ref.status] || 0) + 1;
                });
            }

            // Calculate current tier and next tier
            const currentTier = this.calculateRewardTier(profile?.successful_referrals || 0);
            const nextTierInfo = this.getNextTierInfo(profile?.successful_referrals || 0);

            // Check lifetime cap remaining
            const lifetimeEarned = profile?.premium_days_earned || 0;
            const capRemaining = Math.max(0, this.lifetimeCapDays - lifetimeEarned);

            return {
                referralCode: codeData?.referral_code || null,
                shortLink: codeData?.short_link || null,
                totalReferrals: profile?.total_referrals || 0,
                successfulReferrals: profile?.successful_referrals || 0,
                pendingReferrals: statusCounts.pending,
                expiredReferrals: statusCounts.expired,
                totalDaysEarned: lifetimeEarned,
                currentTier: currentTier.tier,
                currentTierDays: currentTier.days,
                nextTier: nextTierInfo,
                lifetimeCapRemaining: capRemaining,
                lifetimeCapTotal: this.lifetimeCapDays,
                recentReferrals: referrals || []
            };

        } catch (error) {
            logger.error('Error getting referral stats', {
                userId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Calculate reward tier based on successful referral count
     *
     * @param {number} successfulCount - Number of successful referrals
     * @returns {Object} - { tier, days }
     */
    calculateRewardTier(successfulCount) {
        if (successfulCount === 0) {
            return { tier: 'tier_1', days: 14 };
        } else if (successfulCount <= 3) {
            return { tier: 'tier_2', days: 7 };
        } else if (successfulCount <= 8) {
            return { tier: 'tier_3', days: 5 };
        } else {
            return { tier: 'tier_4', days: 3 };
        }
    }

    /**
     * Get info about next reward tier
     *
     * @param {number} successfulCount - Current successful referral count
     * @returns {Object|null}
     */
    getNextTierInfo(successfulCount) {
        if (successfulCount < 1) {
            return { tier: 'tier_2', daysPerReferral: 7, referralsNeeded: 1 };
        } else if (successfulCount < 4) {
            return { tier: 'tier_3', daysPerReferral: 5, referralsNeeded: 4 - successfulCount };
        } else if (successfulCount < 9) {
            return { tier: 'tier_4', daysPerReferral: 3, referralsNeeded: 9 - successfulCount };
        } else {
            return null; // Already at max tier
        }
    }

    /**
     * Check if user has hit LIFETIME referral cap (60 days total, ever)
     *
     * @param {string} userId - User ID
     * @returns {Promise<boolean>}
     */
    async checkLifetimeReferralCap(userId) {
        try {
            // Get premium_days_earned from profile (cumulative lifetime total)
            const { data: profile, error } = await this.supabase
                .from('profiles')
                .select('premium_days_earned')
                .eq('id', userId)
                .single();

            if (error) {
                logger.error('Error checking lifetime cap', { userId, error: error.message });
                return false;
            }

            const lifetimeEarned = profile?.premium_days_earned || 0;
            return lifetimeEarned >= this.lifetimeCapDays;
        } catch (error) {
            logger.error('Error checking lifetime cap', { userId, error: error.message });
            return false;
        }
    }

    /**
     * Get total days earned this month
     *
     * @param {string} userId - User ID
     * @returns {Promise<number>}
     */
    async getMonthlyRewardsEarned(userId) {
        try {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { data, error } = await this.supabase
                .from('referral_rewards')
                .select('reward_amount')
                .eq('referrer_id', userId)
                .eq('status', 'applied')
                .gte('created_at', startOfMonth.toISOString());

            if (error) {
                logger.error('Error fetching monthly rewards', { userId, error: error.message });
                return 0;
            }

            const total = data.reduce((sum, reward) => sum + reward.reward_amount, 0);
            return total;

        } catch (error) {
            logger.error('Error calculating monthly rewards', { userId, error: error.message });
            return 0;
        }
    }

    // ===== HELPER METHODS =====

    /**
     * Normalize first name for referral code
     * Removes accents, special characters, keeps only letters
     *
     * @param {string} fullName - User's full name
     * @returns {string} - Normalized first name
     */
    normalizeFirstName(fullName) {
        if (!fullName) return 'USER';

        const firstName = fullName.split(' ')[0];

        // Remove accents
        const normalized = firstName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z]/g, '')
            .toUpperCase();

        // Limit to 8 characters
        return normalized.substring(0, 8) || 'USER';
    }

    /**
     * Generate random digits
     *
     * @param {number} length - Number of digits
     * @returns {string}
     */
    generateRandomDigits(length) {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }

    /**
     * Generate short link code (base62)
     *
     * @returns {string} - 6 character alphanumeric code
     */
    generateShortLinkCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Hash IP address using SHA-256
     *
     * @param {string} ipAddress - IP address
     * @returns {string} - Hashed IP
     */
    hashIP(ipAddress) {
        return crypto
            .createHash('sha256')
            .update(ipAddress)
            .digest('hex');
    }
}

module.exports = ReferralService;
