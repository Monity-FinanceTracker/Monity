const { logger } = require('../utils/logger');
// Assume email and push notification clients exist, e.g., nodemailer, firebase-admin
// const emailClient = require('../config/email'); 
// const pushClient = require('../config/push');

class NotificationService {
    constructor(supabase, dependencies = {}) {
        this.supabase = supabase;
        // In a real app, you would inject actual clients
        this.emailClient = dependencies.emailClient || console;
        this.pushClient = dependencies.pushClient || console;
    }

    /**
     * Send a notification through multiple channels based on user preferences.
     * @param {string} userId - The ID of the user.
     * @param {string} type - The type of notification (e.g., 'financial_alert').
     * @param {Object} data - The data for the notification template.
     * @returns {Promise<void>}
     */
    async send(userId, type, data) {
        try {
            const { data: preferences, error } = await this.supabase
                .from('user_notification_preferences')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            if (!preferences) {
                logger.warn(`No notification preferences found for user ${userId}`);
                return;
            }

            const message = this.renderTemplate(type, data);

            if (preferences.email_enabled) {
                await this.sendEmail(userId, message.subject, message.body);
            }
            if (preferences.push_enabled) {
                await this.sendPush(userId, message.subject, message.body);
            }
            if (preferences.in_app_enabled) {
                await this.sendInApp(userId, type, message);
            }

            logger.info(`Notification of type ${type} sent to user ${userId}`);

        } catch (error) {
            logger.error(`Failed to send notification to user ${userId}`, {
                error: error.message,
                type
            });
            throw error;
        }
    }

    /**
     * Send an email notification.
     * @param {string} userId - The user's ID to get their email address.
     * @param {string} subject - The email subject.
     * @param {string} body - The email body (can be HTML).
     */
    async sendEmail(userId, subject, body) {
        // In a real implementation, you'd fetch the user's email
        // const { data: user, error } = await this.supabase.from('users').select('email').eq('id', userId).single();
        // if (error || !user) throw new Error('User not found for email');
        // await this.emailClient.send({ to: user.email, subject, html: body });
        this.emailClient.log(`Email sent to user ${userId}: ${subject}`);
    }

    /**
     * Send a push notification.
     * @param {string} userId - The user's ID to get their device tokens.
     * @param {string} title - The push notification title.
     * @param {string} body - The push notification body.
     */
    async sendPush(userId, title, body) {
        // In a real implementation, you'd fetch user's fcm_tokens
        // const { data: tokens, error } = await this.supabase.from('fcm_tokens').select('token').eq('user_id', userId);
        // if (error || !tokens) return;
        // await this.pushClient.sendMulticast({ tokens: tokens.map(t => t.token), notification: { title, body } });
        this.pushClient.log(`Push notification sent to user ${userId}: ${title}`);
    }
    
    /**
     * Create an in-app notification in the database.
     * @param {string} userId - The user's ID.
     * @param {string} type - The notification type.
     * @param {Object} message - The notification message content.
     */
    async sendInApp(userId, type, message) {
        const { error } = await this.supabase.from('notifications').insert({
            user_id: userId,
            type: type,
            title: message.subject,
            message: message.body,
            is_read: false
        });
        if (error) throw error;
    }

    /**
     * Renders a notification message from a template.
     * @param {string} type - The template type.
     * @param {Object} data - The data to populate the template.
     * @returns {{subject: string, body: string}}
     */
    renderTemplate(type, data) {
        // This would typically use a more sophisticated templating engine
        switch (type) {
            case 'welcome':
                return {
                    subject: 'Welcome to Monity!',
                    body: `Hi ${data.name}, welcome to your new financial journey!`
                };
            case 'financial_alert':
                return {
                    subject: 'Financial Alert',
                    body: data.message
                };
            case 'goal_achieved':
                return {
                    subject: `Congratulations! You've reached your goal: ${data.goalName}`,
                    body: `You've successfully saved ${data.amount} for your goal!`
                };
            default:
                return {
                    subject: 'Notification',
                    body: 'You have a new notification.'
                };
        }
    }
}

module.exports = NotificationService;
