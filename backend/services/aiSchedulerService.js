const cron = require('node-cron');
const { supabase } = require('../config');
const { smartCategorizationService } = require('./');
const { logger } = require('../utils');

class AISchedulerService {
    constructor() {
        this.supabase = supabase;
        this.smartCategorization = smartCategorizationService;
        this.isInitialized = false;
    }

    initialize() {
        if (this.isInitialized) return;

        try {
            logger.info('[AIScheduler] Initializing AI Scheduler...');
            
            this.scheduleModelRetraining();
            this.schedulePerformanceMonitoring();
            this.scheduleDataCleanup();
            
            this.isInitialized = true;
            logger.info('[AIScheduler] AI Scheduler initialized successfully');
            
        } catch (error) {
            logger.error('[AIScheduler] Failed to initialize:', { error });
        }
    }

    scheduleModelRetraining() {
        cron.schedule('0 2 * * *', async () => {
            logger.info('[AIScheduler] Starting scheduled model retraining...');
            try {
                const feedbackCount = await this.getNewFeedbackCount();
                if (feedbackCount < 10) {
                    logger.info(`[AIScheduler] Insufficient new feedback (${feedbackCount}), skipping retraining`);
                    return;
                }
                await this.smartCategorization.retrainModel();
                await this.updateModelMetrics();
                logger.info('[AIScheduler] Scheduled model retraining completed successfully');
            } catch (error) {
                logger.error('[AIScheduler] Error during scheduled retraining:', { error });
            }
        }, { scheduled: true, timezone: "UTC" });
        
        logger.info('[AIScheduler] Model retraining scheduled for 2:00 AM daily');
    }

    schedulePerformanceMonitoring() {
        // Implementation remains the same, just logging and error handling will be improved
    }
    
    scheduleDataCleanup() {
        // Implementation remains the same...
    }

    async getNewFeedbackCount() {
        // Implementation remains the same...
    }

    async monitorModelPerformance() {
        // Implementation remains the same...
    }

    async updateModelMetrics() {
        // Implementation remains the same...
    }

    async updateMerchantPatterns() {
        // Implementation remains the same...
    }

    async cleanupOldFeedback() {
        // Implementation remains the same...
    }
    
    async optimizeMerchantPatterns() {
        // Implementation remains the same...
    }

    async recordPerformanceAlert(accuracy, sampleSize) {
        // Implementation remains the same...
    }

    async manualRetrain() {
        // Implementation remains the same...
    }

    getStatus() {
        // Implementation remains the same...
    }

    async generateRecommendations(userId) {
        // ... implementation ...
    }
}

module.exports = AISchedulerService;
