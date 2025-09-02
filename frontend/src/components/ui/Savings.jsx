import { useState, useEffect } from 'react';
import Spinner from './Spinner';
import { get } from '../../utils/api';
import { useTranslation } from 'react-i18next';

function Savings() {
    const { t } = useTranslation();
    const [totalSavings, setTotalSavings] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSavings = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await get('/transactions');

                if (!Array.isArray(response)) {
                    setTotalSavings(0);
                    return;
                }

                const savingsTransactions = response.filter(t => t.typeId === 3);
                
                const total = savingsTransactions.reduce((acc, transaction) => {
                    const amount = parseFloat(transaction.amount);
                    
                    // NEW: Try metadata first for future-proof categorization (safe access)
                    const savingsBehavior = transaction.metadata?.savings_behavior;
                    
                    // Handle investment transactions (moving money to/from investments)
                    if (savingsBehavior === 'investment' || transaction.category === "Make Investments") {
                        return acc - amount; // Subtract when moving to investments
                    } else if (savingsBehavior === 'divestment' || transaction.category === "Withdraw Investments") {
                        return acc + amount; // Add when withdrawing from investments
                    }
                    
                    // Default: regular savings transaction (positive contribution)
                    return acc + amount;
                }, 0);

                setTotalSavings(total);

            } catch(err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSavings();
    }, []);

    // Handle loading and error states
    if (loading) {
        return <Spinner message={t('savings.loading')} />;
    }
    if (error) {
        return <p className="text-red-500">{t('savings.error')}: {error}</p>;
    }

    return (
        <h2 className="text-4xl font-bold mb-4">${totalSavings.toFixed(2)}</h2>
    );
}

export default Savings;