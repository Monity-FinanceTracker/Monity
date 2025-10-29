import React from 'react';
import AddTransaction from './AddTransaction';

/**
 * Wrapper component para adicionar despesas
 * Usa o componente unificado AddTransaction com type='expense'
 */
const AddExpense = () => {
    return <AddTransaction type="expense" />;
};

export default AddExpense;