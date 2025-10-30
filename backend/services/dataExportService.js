const { logger } = require('../utils/logger');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../config');

class DataExportService {
    constructor(supabase) {
        this.supabase = supabase;
    }

    /**
     * Export all user data to a specified format.
     * @param {string} userId - The ID of the user.
     * @param {string} format - The export format ('csv', 'pdf', 'json').
     * @returns {Promise<string|Buffer>} - The exported data as string or buffer.
     */
    async exportAllUserData(userId, format = 'json') {
        try {
            logger.info(`Exporting all data for user ${userId} in format ${format}`);

            // Fetch all user data from different tables using supabaseAdmin to bypass RLS
            const [
                profileResult,
                transactionsResult,
                budgetsResult,
                categoriesResult,
                savingsGoalsResult,
                groupsResult,
                aiChatsResult,
                scheduledTransactionsResult
            ] = await Promise.all([
                supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
                supabaseAdmin.from('transactions').select('*').eq('user_id', userId),
                supabaseAdmin.from('budgets').select('*').eq('user_id', userId),
                supabaseAdmin.from('categories').select('*').eq('user_id', userId),
                supabaseAdmin.from('savings_goals').select('*').eq('user_id', userId),
                supabaseAdmin.from('groups').select('*').eq('user_id', userId),
                supabaseAdmin.from('ai_chats').select('*').eq('user_id', userId),
                supabaseAdmin.from('scheduled_transactions').select('*').eq('user_id', userId)
            ]);

            // Check for errors
            if (profileResult.error) throw new Error(`Profile fetch error: ${profileResult.error.message}`);

            // Decrypt all data
            const { decryptObject } = require('../middleware/encryption');

            const userData = {
                profile: profileResult.data ? decryptObject('profiles', profileResult.data) : null,
                transactions: transactionsResult.data ? decryptObject('transactions', transactionsResult.data) : [],
                budgets: budgetsResult.data ? decryptObject('budgets', budgetsResult.data) : [],
                categories: categoriesResult.data ? decryptObject('categories', categoriesResult.data) : [],
                savingsGoals: savingsGoalsResult.data ? decryptObject('savings_goals', savingsGoalsResult.data) : [],
                groups: groupsResult.data ? decryptObject('groups', groupsResult.data) : [],
                aiChats: aiChatsResult.data ? decryptObject('ai_chats', aiChatsResult.data) : [],
                scheduledTransactions: scheduledTransactionsResult.data ? decryptObject('scheduled_transactions', scheduledTransactionsResult.data) : [],
                exportDate: new Date().toISOString()
            };

            switch (format.toLowerCase()) {
                case 'csv':
                    return this.generateCsvFromAllData(userData);
                case 'pdf':
                    return this.generatePdfFromAllData(userData, userId);
                case 'json':
                default:
                    return this.generateJson(userData);
            }
        } catch (error) {
            logger.error(`Failed to export all user data for user ${userId}`, {
                error: error.message,
                format
            });
            throw error;
        }
    }

    /**
     * Export user transactions to a specified format.
     * @param {string} userId - The ID of the user.
     * @param {string} format - The export format ('csv', 'pdf', 'json').
     * @param {Object} options - Filtering options (e.g., date range).
     * @returns {Promise<string|Buffer>} - The file path or buffer of the exported data.
     */
    async exportTransactions(userId, format, options = {}) {
        try {
            let query = this.supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId);

            if (options.startDate) {
                query = query.gte('date', options.startDate);
            }
            if (options.endDate) {
                query = query.lte('date', options.endDate);
            }

            const { data: transactionsData, error } = await query;
            if (error) throw error;
            if (!transactionsData || transactionsData.length === 0) {
                throw new Error('No transactions found for the given criteria.');
            }

            // Decrypt the transactions data
            const { decryptObject } = require('../middleware/encryption');
            const transactions = decryptObject('transactions', transactionsData);

            switch (format) {
                case 'csv':
                    return this.generateCsv(transactions);
                case 'pdf':
                    return this.generatePdf(transactions, userId);
                case 'json':
                    return this.generateJson(transactions);
                default:
                    throw new Error('Unsupported format');
            }
        } catch (error) {
            logger.error(`Failed to export transactions for user ${userId}`, {
                error: error.message,
                format
            });
            throw error;
        }
    }

    /**
     * Generate a CSV string from data.
     * @param {Array<Object>} data - The data to convert.
     * @returns {string} - The CSV data as a string.
     */
    generateCsv(data) {
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(data);
        logger.info('CSV data generated successfully');
        return csv;
    }

    /**
     * Generate a JSON string from data.
     * @param {Array<Object>} data - The data to convert.
     * @returns {string} - The JSON data as a string.
     */
    generateJson(data) {
        logger.info('JSON data generated successfully');
        return JSON.stringify(data, null, 2);
    }

    /**
     * Generate a PDF document from transaction data.
     * @param {Array<Object>} transactions - The transaction data.
     * @param {string} userId - The user ID for the report header.
     * @returns {Promise<Buffer>} - A buffer containing the PDF data.
     */
    generatePdf(transactions, userId) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                logger.info(`PDF generated successfully for user ${userId}`);
                resolve(pdfData);
            });
            doc.on('error', (err) => {
                reject(err);
            });

            // Add header
            doc.fontSize(20).text('Transaction Report', { align: 'center' });
            doc.fontSize(12).text(`User ID: ${userId}`, { align: 'center' });
            doc.moveDown();

            // Add table headers
            const tableTop = doc.y;
            const itemX = 50;
            const descriptionX = 150;
            const amountX = 350;
            const dateX = 450;

            doc.fontSize(10)
                .text('Category', itemX, tableTop, { bold: true })
                .text('Description', descriptionX, tableTop, { bold: true })
                .text('Amount', amountX, tableTop, { bold: true })
                .text('Date', dateX, tableTop, { bold: true });

            // Draw header line
            doc.moveTo(itemX, doc.y + 5).lineTo(dateX + 100, doc.y + 5).stroke();
            doc.y += 10;

            // Add table rows
            transactions.forEach(tx => {
                doc.fontSize(10)
                    .text(tx.category || 'N/A', itemX, doc.y)
                    .text(tx.description, descriptionX, doc.y)
                    .text(`$${tx.amount.toFixed(2)}`, amountX, doc.y)
                    .text(new Date(tx.date).toLocaleDateString(), dateX, doc.y);
                doc.moveDown(0.5);
            });

            doc.end();
        });
    }

    /**
     * Generate CSV files from all user data (creates a ZIP-like structure represented as string).
     * @param {Object} userData - The complete user data object.
     * @returns {string} - CSV data containing all information.
     */
    generateCsvFromAllData(userData) {
        const sections = [];

        // Profile section
        if (userData.profile) {
            sections.push('=== PROFILE ===');
            sections.push(this.generateCsv([userData.profile]));
            sections.push('');
        }

        // Transactions section
        if (userData.transactions && userData.transactions.length > 0) {
            sections.push('=== TRANSACTIONS ===');
            sections.push(this.generateCsv(userData.transactions));
            sections.push('');
        }

        // Budgets section
        if (userData.budgets && userData.budgets.length > 0) {
            sections.push('=== BUDGETS ===');
            sections.push(this.generateCsv(userData.budgets));
            sections.push('');
        }

        // Categories section
        if (userData.categories && userData.categories.length > 0) {
            sections.push('=== CATEGORIES ===');
            sections.push(this.generateCsv(userData.categories));
            sections.push('');
        }

        // Savings Goals section
        if (userData.savingsGoals && userData.savingsGoals.length > 0) {
            sections.push('=== SAVINGS GOALS ===');
            sections.push(this.generateCsv(userData.savingsGoals));
            sections.push('');
        }

        // Groups section
        if (userData.groups && userData.groups.length > 0) {
            sections.push('=== GROUPS ===');
            sections.push(this.generateCsv(userData.groups));
            sections.push('');
        }

        // Scheduled Transactions section
        if (userData.scheduledTransactions && userData.scheduledTransactions.length > 0) {
            sections.push('=== SCHEDULED TRANSACTIONS ===');
            sections.push(this.generateCsv(userData.scheduledTransactions));
            sections.push('');
        }

        logger.info('CSV data generated successfully for all user data');
        return sections.join('\n');
    }

    /**
     * Generate a comprehensive PDF from all user data.
     * @param {Object} userData - The complete user data object.
     * @param {string} userId - The user ID.
     * @returns {Promise<Buffer>} - A buffer containing the PDF data.
     */
    generatePdfFromAllData(userData, userId) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                logger.info(`Comprehensive PDF generated successfully for user ${userId}`);
                resolve(pdfData);
            });
            doc.on('error', (err) => {
                reject(err);
            });

            // Add header
            doc.fontSize(24).text('Complete Data Export', { align: 'center' });
            doc.fontSize(12).text(`User ID: ${userId}`, { align: 'center' });
            doc.fontSize(10).text(`Export Date: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);

            // Profile section
            if (userData.profile) {
                doc.fontSize(16).text('Profile Information', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(10)
                    .text(`Name: ${userData.profile.name || 'N/A'}`)
                    .text(`Email: ${userData.profile.email || 'N/A'}`)
                    .text(`Subscription: ${userData.profile.subscription_tier || 'free'}`);
                doc.moveDown(1.5);
            }

            // Summary statistics
            doc.fontSize(16).text('Data Summary', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10)
                .text(`Transactions: ${userData.transactions?.length || 0}`)
                .text(`Budgets: ${userData.budgets?.length || 0}`)
                .text(`Categories: ${userData.categories?.length || 0}`)
                .text(`Savings Goals: ${userData.savingsGoals?.length || 0}`)
                .text(`Groups: ${userData.groups?.length || 0}`)
                .text(`AI Chats: ${userData.aiChats?.length || 0}`)
                .text(`Scheduled Transactions: ${userData.scheduledTransactions?.length || 0}`);
            doc.moveDown(1.5);

            // Recent transactions (limit to 20)
            if (userData.transactions && userData.transactions.length > 0) {
                doc.addPage();
                doc.fontSize(16).text('Recent Transactions', { underline: true });
                doc.moveDown(0.5);

                const recentTransactions = userData.transactions.slice(0, 20);
                recentTransactions.forEach(tx => {
                    doc.fontSize(9)
                        .text(`${new Date(tx.date).toLocaleDateString()} - ${tx.description || 'No description'}: $${tx.amount.toFixed(2)}`);
                    doc.moveDown(0.3);
                });

                if (userData.transactions.length > 20) {
                    doc.fontSize(8).text(`... and ${userData.transactions.length - 20} more transactions`, { italics: true });
                }
            }

            // Note about full data
            doc.moveDown(2);
            doc.fontSize(8).text('Note: For complete data including all records, please use JSON export format.', {
                align: 'center',
                italics: true
            });

            doc.end();
        });
    }
}

module.exports = DataExportService;
