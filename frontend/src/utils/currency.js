/**
 * Utilitários de formatação de moeda
 */

/**
 * Formata um valor monetário com tratamento adequado de sinal
 * @param {number} amount - O valor a ser formatado
 * @param {number} typeId - Tipo de transação (1 para despesa, 2 para receita, 3 para savings)
 * @param {boolean} showSign - Se deve mostrar o sinal + ou - (padrão: true)
 * @returns {string} String de moeda formatada
 */
export const formatCurrency = (amount, typeId, showSign = true) => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
        return 'R$ 0,00';
    }
    
    // Para despesas (typeId === 1), o valor deve ser negativo
    // Para receitas (typeId === 2), o valor deve ser positivo
    // Para savings (typeId === 3), o valor deve ser positivo
    const isExpense = typeId === 1;
    
    // Determina o sinal a ser exibido
    let sign = '';
    if (showSign) {
        if (isExpense) {
            sign = '-';
        } else {
            sign = '+';
        }
    }
    
    // Sempre usa o valor absoluto para exibição
    const displayAmount = Math.abs(numAmount);
    
    // Formato brasileiro: R$ 1.234,56
    const formatted = displayAmount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    return `${sign}R$ ${formatted}`;
};

/**
 * Formata um valor de moeda simples sem lógica de tipo de transação
 * @param {number} amount - O valor a ser formatado
 * @param {boolean} showSign - Se deve mostrar o sinal (padrão: false)
 * @returns {string} String de moeda formatada
 */
export const formatSimpleCurrency = (amount, showSign = false) => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
        return 'R$ 0,00';
    }
    
    const sign = showSign && numAmount < 0 ? '-' : '';
    const displayAmount = Math.abs(numAmount);
    
    // Formato brasileiro: R$ 1.234,56
    const formatted = displayAmount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    return `${sign}R$ ${formatted}`;
};

/**
 * Gets the appropriate color class for a transaction amount
 * @param {number} typeId - Transaction type (1 for expense, 2 for income, 3 for savings)
 * @returns {string} CSS class for the amount color
 */
export const getAmountColor = (typeId) => {
    if (typeId === 1) return 'text-[#D97757]';
    if (typeId === 2) return 'text-[#56a69f]';
    if (typeId === 3) return 'text-[#A69F8E]';
    return 'text-[#56a69f]'; // default
};
