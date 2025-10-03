/**
 * Currency formatting utilities
 */

/**
 * Formats a monetary amount with proper sign handling
 * @param {number} amount - The amount to format
 * @param {number} typeId - Transaction type (1 for expense, 2 for income)
 * @param {boolean} showSign - Whether to show + or - sign (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, typeId, showSign = true) => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
        return '$0.00';
    }
    
    // For expenses (typeId === 1), amount should be negative
    // For income (typeId === 2), amount should be positive
    const isExpense = typeId === 1;
    const isNegative = numAmount < 0;
    
    // Determine the sign to display
    let sign = '';
    if (showSign) {
        if (isExpense) {
            sign = '-';
        } else {
            sign = '+';
        }
    }
    
    // Always use absolute value for display
    const displayAmount = Math.abs(numAmount);
    
    return `${sign}$${displayAmount.toFixed(2)}`;
};

/**
 * Formats a simple currency amount without transaction type logic
 * @param {number} amount - The amount to format
 * @param {boolean} showSign - Whether to show sign (default: false)
 * @returns {string} Formatted currency string
 */
export const formatSimpleCurrency = (amount, showSign = false) => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
        return '$0.00';
    }
    
    const sign = showSign && numAmount < 0 ? '-' : '';
    const displayAmount = Math.abs(numAmount);
    
    return `${sign}$${displayAmount.toFixed(2)}`;
};

/**
 * Gets the appropriate color class for a transaction amount
 * @param {number} typeId - Transaction type (1 for expense, 2 for income)
 * @returns {string} CSS class for the amount color
 */
export const getAmountColor = (typeId) => {
    return typeId === 1 ? 'text-red-400' : 'text-green-400';
};
