const axios = require('axios');
const { logger } = require('../utils/logger');

class AIChatService {
    constructor(supabase) {
        this.supabase = supabase;
        this.apiKey = process.env.GEMINI_API_KEY;
        this.model = 'gemini-2.5-flash';
    }

    /**
     * Get user's financial context for AI assistant
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Financial context data
     */
    async getUserFinancialContext(userId) {
        try {
            // Get recent transactions
            const { data: transactions } = await this.supabase
                .from('transactions')
                .select('description, amount, category, typeId, createdAt')
                .eq('userId', userId)
                .order('createdAt', { ascending: false })
                .limit(50);

            // Get budgets
            const { data: budgets } = await this.supabase
                .from('budgets')
                .select('category, amount, period')
                .eq('userId', userId);

            // Get savings goals
            const { data: goals } = await this.supabase
                .from('savings_goals')
                .select('name, target_amount, current_amount, deadline')
                .eq('userId', userId);

            // Calculate spending summary
            const spendingSummary = this.calculateSpendingSummary(transactions);

            // Get user profile
            const { data: profile } = await this.supabase
                .from('profiles')
                .select('name, subscription_tier')
                .eq('id', userId)
                .single();

            return {
                profile: profile || {},
                recentTransactions: transactions || [],
                budgets: budgets || [],
                savingsGoals: goals || [],
                spendingSummary
            };
        } catch (error) {
            logger.error('Error fetching user financial context', { userId, error: error.message });
            return {
                profile: {},
                recentTransactions: [],
                budgets: [],
                savingsGoals: [],
                spendingSummary: {}
            };
        }
    }

    /**
     * Calculate spending summary from transactions
     * @param {Array} transactions - Array of transactions
     * @returns {Object} Spending summary
     */
    calculateSpendingSummary(transactions) {
        if (!transactions || transactions.length === 0) {
            return {
                totalExpenses: 0,
                totalIncome: 0,
                totalSavings: 0,
                topCategories: []
            };
        }

        const summary = {
            totalExpenses: 0,
            totalIncome: 0,
            totalSavings: 0,
            categoryTotals: {}
        };

        transactions.forEach(transaction => {
            const amount = parseFloat(transaction.amount) || 0;

            // typeId: 1 = Expense, 2 = Income, 3 = Savings
            if (transaction.typeId === 1) {
                summary.totalExpenses += amount;
            } else if (transaction.typeId === 2) {
                summary.totalIncome += amount;
            } else if (transaction.typeId === 3) {
                summary.totalSavings += amount;
            }

            // Track by category
            if (transaction.category) {
                if (!summary.categoryTotals[transaction.category]) {
                    summary.categoryTotals[transaction.category] = 0;
                }
                summary.categoryTotals[transaction.category] += amount;
            }
        });

        // Get top categories
        summary.topCategories = Object.entries(summary.categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, amount]) => ({ category, amount }));

        delete summary.categoryTotals;
        return summary;
    }

    /**
     * Build system prompt with user's financial context
     * @param {Object} context - Financial context
     * @returns {string} System prompt
     */
    buildSystemPrompt(context) {
        const { profile, spendingSummary, budgets, savingsGoals } = context;

        let prompt = `You are Monity's AI Financial Assistant, a helpful and knowledgeable advisor for personal finance management. You help users understand their spending, manage budgets, reach savings goals, and make better financial decisions.

User Profile:
- Name: ${profile.name || 'User'}
- Subscription: ${profile.subscription_tier || 'free'}

Financial Overview:
- Total Expenses: $${spendingSummary.totalExpenses?.toFixed(2) || '0.00'}
- Total Income: $${spendingSummary.totalIncome?.toFixed(2) || '0.00'}
- Total Savings: $${spendingSummary.totalSavings?.toFixed(2) || '0.00'}
- Net Balance: $${((spendingSummary.totalIncome || 0) - (spendingSummary.totalExpenses || 0)).toFixed(2)}
`;

        if (spendingSummary.topCategories && spendingSummary.topCategories.length > 0) {
            prompt += `\nTop Spending Categories:\n`;
            spendingSummary.topCategories.forEach(({ category, amount }) => {
                prompt += `- ${category}: $${amount.toFixed(2)}\n`;
            });
        }

        if (budgets && budgets.length > 0) {
            prompt += `\nActive Budgets:\n`;
            budgets.forEach(budget => {
                prompt += `- ${budget.category}: $${budget.amount} per ${budget.period}\n`;
            });
        }

        if (savingsGoals && savingsGoals.length > 0) {
            prompt += `\nSavings Goals:\n`;
            savingsGoals.forEach(goal => {
                const progress = ((goal.current_amount / goal.target_amount) * 100).toFixed(1);
                prompt += `- ${goal.name}: $${goal.current_amount}/$${goal.target_amount} (${progress}%)\n`;
            });
        }

        prompt += `\nYour role:
- Provide personalized financial advice based on the user's data
- Help users understand their spending patterns
- Suggest ways to optimize budgets and reach savings goals
- Answer questions about their transactions and financial health
- Be encouraging and supportive while being honest about financial realities
- Keep responses concise and actionable (2-3 paragraphs maximum)
- Use specific numbers from their data when relevant
- Never give specific investment advice or recommend specific stocks/cryptocurrencies
- Always remind users to consult a professional financial advisor for major decisions

Remember: This is real financial data. Be helpful, accurate, and responsible with your advice.`;

        return prompt;
    }

    /**
     * Send a message to the AI and get a response
     * @param {string} userId - User ID
     * @param {string} userMessage - User's message
     * @param {Array} conversationHistory - Previous messages
     * @returns {Promise<Object>} AI response with token usage
     */
    async chat(userId, userMessage, conversationHistory = []) {
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY not configured. Please add it to your .env file.');
        }

        if (!userId || typeof userId !== 'string') {
            throw new Error('Invalid userId provided to chat service');
        }

        if (!userMessage || typeof userMessage !== 'string') {
            throw new Error('Invalid userMessage provided to chat service');
        }

        try {
            // Get user's financial context
            const context = await this.getUserFinancialContext(userId);

            // Build system prompt
            const systemPrompt = this.buildSystemPrompt(context);

            // Prepare conversation history for Gemini
            const contents = [];

            // Add conversation history
            for (const msg of conversationHistory) {
                contents.push({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                });
            }

            // Add current user message
            contents.push({
                role: 'user',
                parts: [{ text: userMessage }]
            });

            // Call Gemini API
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    contents: contents,
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024,
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const assistantMessage = response.data.candidates[0].content.parts[0].text;
            const tokensUsed = response.data.usageMetadata?.totalTokenCount || 0;

            return {
                message: assistantMessage,
                tokensUsed,
                model: this.model
            };
        } catch (error) {
            logger.error('Error calling AI chat API', {
                userId,
                error: error.message,
                response: error.response?.data
            });

            if (error.response?.status === 400) {
                throw new Error('Invalid API key or request. Please check your GEMINI_API_KEY.');
            } else if (error.response?.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else {
                throw new Error('Failed to get AI response. Please try again.');
            }
        }
    }

    /**
     * Generate a suggested first message based on user's financial data
     * @param {string} userId - User ID
     * @returns {Promise<string>} Suggested message
     */
    async getSuggestedFirstMessage(userId) {
        try {
            const context = await this.getUserFinancialContext(userId);
            const { spendingSummary, savingsGoals, budgets } = context;

            if (savingsGoals && savingsGoals.length > 0) {
                const goal = savingsGoals[0];
                const progress = ((goal.current_amount / goal.target_amount) * 100).toFixed(0);
                return `How can I reach my ${goal.name} goal faster? I'm at ${progress}% progress.`;
            }

            if (spendingSummary.topCategories && spendingSummary.topCategories.length > 0) {
                const topCategory = spendingSummary.topCategories[0];
                return `Why am I spending so much on ${topCategory.category}?`;
            }

            if (budgets && budgets.length > 0) {
                return `How am I doing with my budgets this month?`;
            }

            return `Can you give me an overview of my financial situation?`;
        } catch (error) {
            logger.error('Error generating suggested message', { userId, error: error.message });
            return `Can you help me understand my finances?`;
        }
    }
}

module.exports = AIChatService;
