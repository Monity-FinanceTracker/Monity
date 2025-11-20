import React, { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown } from "lucide-react";
import Spinner from "./Spinner";
import { useTranslation } from "react-i18next";
import { useBalance } from "../../hooks/useQueries";
import { useAuth } from "../../context/useAuth";

const BalanceCard = memo(function BalanceCard({ selectedRange }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: balance = 0, isLoading: loading, error } = useBalance(selectedRange, { enabled: !!user });

    // Calcula o tamanho da fonte baseado no comprimento do texto
    const fontSize = useMemo(() => {
        const formattedBalance = balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const totalLength = formattedBalance.length + 3; // +3 para "R$ "
        
        // Escala o tamanho da fonte baseado no comprimento (aumentado)
        if (totalLength <= 10) return 'text-6xl'; // Números pequenos
        if (totalLength <= 15) return 'text-5xl'; // Números médios
        if (totalLength <= 20) return 'text-4xl'; // Números grandes
        if (totalLength <= 25) return 'text-3xl';  // Números muito grandes
        return 'text-2xl'; // Números extremamente grandes
    }, [balance]);

    if (!user) {
        return (
            <p className="text-gray-400 text-lg mb-4">
                {t('balanceCard.loginToView', 'Faça login para ver seu saldo.')}
            </p>
        );
    }
    const handleAddIncome = () => {
        navigate('/add-income');
    };

    const handleAddExpense = () => {
        navigate('/add-expense');
    };

    const handleAddSavingsGoal = () => {
        navigate('/savings-goals', { state: { openModal: true } });
    };

    if (loading) {
        return <Spinner message={t('balanceCard.loading')} size="md" center={false} />;
    }
    if (error) {
        return <p className="text-red-500">{error?.message || t('balanceCard.fetchError')}</p>;
    }

    return (
        <div className="flex items-center gap-4">
            <h2 className={`${fontSize} font-bold text-white whitespace-nowrap overflow-hidden text-left`}>
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            
            {/* Quick action buttons */}
            <div className="flex items-center gap-2 ml-auto">
                {/* Income button */}
                <div className="relative group/tooltip">
                    <button
                        onClick={handleAddIncome}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#56a69f]/20 flex items-center justify-center hover:bg-[#56a69f]/30 transition-all duration-200 group"
                    >
                        <ArrowDown className="w-5 h-5 text-[#56a69f] group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1F1E1D] border border-[#56a69f]/30 text-[#56a69f] text-xs font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-50">
                        {t('transactions.add_income') || 'Add Income'}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#1F1E1D] border-r border-b border-[#56a69f]/30 rotate-45"></div>
                    </div>
                </div>
                
                {/* Savings Goal button */}
                <div className="relative group/tooltip">
                    <button
                        onClick={handleAddSavingsGoal}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#A69F8E]/20 flex items-center justify-center hover:bg-[#A69F8E]/30 transition-all duration-200 group"
                    >
                        <ArrowDown className="w-5 h-5 text-[#A69F8E] group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1F1E1D] border border-[#A69F8E]/30 text-[#A69F8E] text-xs font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-50">
                        {t('savings_goals.add_new_goal') || 'Add Savings Goal'}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#1F1E1D] border-r border-b border-[#A69F8E]/30 rotate-45"></div>
                    </div>
                </div>
                
                {/* Expense button */}
                <div className="relative group/tooltip">
                    <button
                        onClick={handleAddExpense}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#D97757]/20 flex items-center justify-center hover:bg-[#D97757]/20 transition-all duration-200 group"
                    >
                        <ArrowUp className="w-5 h-5 text-[#D97757] group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1F1E1D] border border-[#FAF9F5]/30 text-[#FAF9F5] text-xs font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-50">
                        {t('transactions.add_expense') || 'Add Expense'}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#1F1E1D] border-r border-b border-[#FAF9F5]/30 rotate-45"></div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default BalanceCard;