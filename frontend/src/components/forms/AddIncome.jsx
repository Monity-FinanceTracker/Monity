import React from 'react';
import AddTransaction from './AddTransaction';

/**
 * Wrapper component para adicionar receitas
 * Usa o componente unificado AddTransaction com type='income'
 */
const AddIncome = () => {
    return <AddTransaction type="income" />;
};

export default AddIncome;
