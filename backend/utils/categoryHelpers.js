const { logger } = require('./logger');

/**
 * Utility functions for creating internationalized categories
 */

/**
 * Create default savings categories based on user's locale
 * @param {string} locale - User's locale (e.g., 'en', 'pt', 'es')
 * @param {string} userId - User ID
 * @returns {Array} Array of category objects with localized names and metadata
 */
function createLocalizedSavingsCategories(locale = 'en', userId) {
    const translations = {
        en: {
            make_investments: 'Make Investments',
            withdraw_investments: 'Withdraw Investments',
            emergency_fund: 'Emergency Fund',
            retirement_savings: 'Retirement Savings'
        },
        pt: {
            make_investments: 'Fazer Investimentos',
            withdraw_investments: 'Retirar Investimentos',
            emergency_fund: 'Fundo de Emergência',
            retirement_savings: 'Poupança para Aposentadoria'
        },
        es: {
            make_investments: 'Hacer Inversiones',
            withdraw_investments: 'Retirar Inversiones',
            emergency_fund: 'Fondo de Emergencia',
            retirement_savings: 'Ahorro para Jubilación'
        },
        fr: {
            make_investments: 'Faire des Investissements',
            withdraw_investments: 'Retirer des Investissements',
            emergency_fund: 'Fonds d\'Urgence',
            retirement_savings: 'Épargne Retraite'
        }
    };

    const t = translations[locale] || translations.en;

    return [
        {
            name: t.make_investments,
            typeId: 3,
            userId: userId,
            color: '#3B82F6',
            icon: '📈',
            metadata: {
                savings_behavior: 'investment',
                description: 'Moving money from savings to investments',
                is_system_category: true,
                locale: locale,
                category_key: 'make_investments'
            }
        },
        {
            name: t.withdraw_investments,
            typeId: 3,
            userId: userId,
            color: '#EF4444',
            icon: '📉',
            metadata: {
                savings_behavior: 'divestment',
                description: 'Moving money from investments back to savings',
                is_system_category: true,
                locale: locale,
                category_key: 'withdraw_investments'
            }
        },
        {
            name: t.emergency_fund,
            typeId: 3,
            userId: userId,
            color: '#F59E0B',
            icon: '🚨',
            metadata: {
                savings_behavior: 'deposit',
                description: 'Emergency fund savings',
                is_system_category: true,
                locale: locale,
                category_key: 'emergency_fund',
                subcategory: 'emergency'
            }
        },
        {
            name: t.retirement_savings,
            typeId: 3,
            userId: userId,
            color: '#10B981',
            icon: '🏖️',
            metadata: {
                savings_behavior: 'deposit',
                description: 'Long-term retirement savings',
                is_system_category: true,
                locale: locale,
                category_key: 'retirement_savings',
                subcategory: 'retirement'
            }
        }
    ];
}

/**
 * Calculate savings amount based on transaction metadata
 * Backward compatible with old category names
 * @param {Object} transaction - Transaction object
 * @returns {number} Adjusted amount for savings calculation
 */
function calculateSavingsAmount(transaction) {
    const amount = parseFloat(transaction.amount);
    const savingsBehavior = transaction.metadata?.savings_behavior;
    
    // Handle investment transactions (backward compatible)
    if (savingsBehavior === 'investment' || transaction.category === "Make Investments") {
        return -amount; // Subtract when moving to investments
    } else if (savingsBehavior === 'divestment' || transaction.category === "Withdraw Investments") {
        return amount; // Add when withdrawing from investments
    }
    
    // Default: regular savings (positive contribution)
    return amount;
}

/**
 * Get savings behavior type from transaction
 * @param {Object} transaction - Transaction object
 * @returns {string} Savings behavior type
 */
function getSavingsBehavior(transaction) {
    const metadataBehavior = transaction.metadata?.savings_behavior;
    
    if (metadataBehavior) {
        return metadataBehavior;
    }
    
    // Backward compatibility
    if (transaction.category === "Make Investments") {
        return 'investment';
    } else if (transaction.category === "Withdraw Investments") {
        return 'divestment';
    }
    
    return 'deposit'; // Default
}

/**
 * Check if a category is a system-generated savings category
 * @param {Object} category - Category object
 * @returns {boolean} True if system category
 */
function isSystemSavingsCategory(category) {
    return category.metadata?.is_system_category === true;
}

module.exports = {
    createLocalizedSavingsCategories,
    calculateSavingsAmount,
    getSavingsBehavior,
    isSystemSavingsCategory
};
