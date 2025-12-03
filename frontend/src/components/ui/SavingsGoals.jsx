import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/useAuth';
import { Link } from 'react-router-dom';
import CloseButton from './CloseButton';
import { formatSimpleCurrency } from '../../utils/currency';
import { useSmartUpgradePrompt } from '../premium/SmartUpgradePrompt';
import { FiStar, FiLock, FiTarget } from 'react-icons/fi';
import PremiumUpgradeCard from '../groups/PremiumUpgradeCard';

const SavingsGoals = () => {
    const { t } = useTranslation();
    const { subscriptionTier } = useAuth();
    const { showPrompt } = useSmartUpgradePrompt();
    const location = useLocation();
    
    // Add CSS to fix date input styling
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            input[type="date"]::-webkit-calendar-picker-indicator {
                filter: invert(1);
                cursor: pointer;
            }
            input[type="date"]::-webkit-datetime-edit-text {
                color: white;
            }
            input[type="date"]::-webkit-datetime-edit-month-field {
                color: white;
            }
            input[type="date"]::-webkit-datetime-edit-day-field {
                color: white;
            }
            input[type="date"]::-webkit-datetime-edit-year-field {
                color: white;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState({
        goal_name: '',
        target_amount: '',
        target_date: '',
        current_amount: ''
    });
    const [addingMoney, setAddingMoney] = useState({});
    const [withdrawingMoney, setWithdrawingMoney] = useState({});
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isLimited = subscriptionTier === 'free' && goals.length >= 2;

    const shouldShowPremiumCard = useMemo(
        () => subscriptionTier === 'free' && goals.length >= 2,
        [subscriptionTier, goals.length]
    );

    const fetchGoalsAndBalance = useCallback(async () => {
        try {
            const [goalsResponse, balanceResponse] = await Promise.all([
                api.get('/savings-goals'),
                api.get('/balance/all')
            ]);
            setGoals(goalsResponse.data);
            setBalance(balanceResponse.data.balance || 0);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, []);

    useEffect(() => {
        fetchGoalsAndBalance();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Open modal automatically if navigated from BalanceCard
    useEffect(() => {
        if (location.state?.openModal && !isLimited) {
            setIsModalOpen(true);
        }
    }, [location.state, isLimited]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGoal(prevState => ({ ...prevState, [name]: value }));
    };

    const handleAddGoal = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/savings-goals', newGoal);
            setGoals(prevGoals => [...prevGoals, response.data]);
            setNewGoal({
                goal_name: '',
                target_amount: '',
                target_date: '',
                current_amount: ''
            });
            setIsModalOpen(false);
            fetchGoalsAndBalance(); // Refetch data
        } catch (error) {
            console.error('Error adding savings goal:', error);
        }
    };

    const handleDeleteGoal = async (goalId) => {
        try {
            await api.delete(`/savings-goals/${goalId}`);
            fetchGoalsAndBalance(); // Refetch data
        } catch (error) {
            console.error('Error deleting savings goal:', error);
        }
    };

    const handleAllocateMoney = async (goalId, amount) => {
        try {
            await api.post(`/savings-goals/${goalId}/allocate`, { amount });
            fetchGoalsAndBalance(); // Refetch data
            setAddingMoney(prev => ({ ...prev, [goalId]: { isAdding: false, amount: '' } }));
        } catch (error) {
            console.error('Error allocating money:', error);
        }
    };

    const handleWithdrawMoney = async (goalId, amount) => {
        try {
            await api.post(`/savings-goals/${goalId}/withdraw`, { amount });
            fetchGoalsAndBalance(); // Refetch data
            setWithdrawingMoney(prev => ({ ...prev, [goalId]: { isWithdrawing: false, amount: '' } }));
        } catch (error) {
            console.error('Error withdrawing money:', error);
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            }
        }
    };

    const handleAddMoneyClick = (goalId) => {
        setAddingMoney(prev => ({
            ...prev,
            [goalId]: { isAdding: !prev[goalId]?.isAdding, amount: '' }
        }));
        // Close withdraw if open
        setWithdrawingMoney(prev => ({ ...prev, [goalId]: { isWithdrawing: false, amount: '' } }));
    };

    const handleWithdrawMoneyClick = (goalId) => {
        setWithdrawingMoney(prev => ({
            ...prev,
            [goalId]: { isWithdrawing: !prev[goalId]?.isWithdrawing, amount: '' }
        }));
        // Close add if open
        setAddingMoney(prev => ({ ...prev, [goalId]: { isAdding: false, amount: '' } }));
    };

    const handleAmountChange = (e, goalId) => {
        const { value } = e.target;
        setAddingMoney(prev => ({
            ...prev,
            [goalId]: { ...prev[goalId], amount: value }
        }));
    };

    const handleWithdrawAmountChange = (e, goalId) => {
        const { value } = e.target;
        setWithdrawingMoney(prev => ({
            ...prev,
            [goalId]: { ...prev[goalId], amount: value }
        }));
    };

    return (
        <div className="flex-1 p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">{t('savings_goals.title')}</h1>
                    {goals.length > 0 && subscriptionTier === 'free' && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#262626] border border-[#262626] rounded-lg">
                            <span className="text-[#C2C0B6] text-sm">
                                {goals.length}/2
                            </span>
                            <span className="text-[#8B8A85] text-xs">
                                {t('savings_goals.goals_label')}
                            </span>
                        </div>
                    )}
                    {goals.length > 0 && subscriptionTier === 'premium' && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#56a69f]/10 border border-[#56a69f]/20 rounded-lg">
                            <FiStar className="w-3.5 h-3.5 text-[#56a69f]" />
                            <span className="text-[#56a69f] text-xs font-medium">
                                {t('savings_goals.unlimited')}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => {
                            if (isLimited) {
                                showPrompt('savings_goal_limit');
                            } else {
                                setIsModalOpen(true);
                            }
                        }}
                        className="bg-[#56a69f] !text-[#1F1E1D] px-6 py-3 rounded-lg hover:bg-[#4A8F88] transition-colors font-medium flex items-center gap-2"
                    >
                        {isLimited && <FiLock className="w-4 h-4" />}
                        {t('savings_goals.add_new_goal')}
                    </button>
                </div>
            </div>

            {/* Premium Upgrade Card */}
            {shouldShowPremiumCard && (
                <div className="mb-6">
                    <PremiumUpgradeCard 
                        titleKey="savings_goals.premium_unlimited_goals"
                        buttonKey="savings_goals.upgrade_to_premium"
                        icon={FiTarget}
                    />
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1F1E1D] rounded-lg border border-[#262626] w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">{t('savings_goals.add_new_goal_modal_title')}</h2>
                            <CloseButton onClick={() => setIsModalOpen(false)} />
                        </div>
                    
                    <form onSubmit={handleAddGoal} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="goal_name" className="block text-gray-300 text-sm font-medium mb-2">
                                {t('savings_goals.goal_name')}
                            </label>
                            <input
                                type="text"
                                id="goal_name"
                                name="goal_name"
                                value={newGoal.goal_name}
                                onChange={handleInputChange}
                                placeholder={t('savings_goals.goal_name_placeholder')}
                                className="w-full bg-[#1F1E1D] border border-[#262626] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#56a69f] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label htmlFor="target_amount" className="block text-gray-300 text-sm font-medium mb-2">
                                {t('savings_goals.target_amount')}
                            </label>
                            <input
                                type="number"
                                id="target_amount"
                                name="target_amount"
                                value={newGoal.target_amount}
                                onChange={handleInputChange}
                                placeholder={t('savings_goals.target_amount_placeholder')}
                                className="w-full bg-[#1F1E1D] border border-[#262626] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#56a69f] focus:border-transparent transition-all duration-200 placeholder-gray-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label htmlFor="target_date" className="block text-gray-300 text-sm font-medium mb-2">
                                {t('savings_goals.target_date')}
                            </label>
                            <input
                                type="text"
                                id="target_date"
                                name="target_date"
                                value={newGoal.target_date}
                                onChange={handleInputChange}
                                placeholder="mm/dd/yyyy"
                                className="w-full bg-[#1F1E1D] border border-[#262626] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#56a69f] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label htmlFor="current_amount" className="block text-gray-300 text-sm font-medium mb-2">
                                {t('savings_goals.initial_saved_amount')} <span className="text-[#C2C0B6] text-xs">(Optional)</span>
                            </label>
                            <input
                                type="number"
                                id="current_amount"
                                name="current_amount"
                                value={newGoal.current_amount}
                                onChange={handleInputChange}
                                placeholder={t('savings_goals.initial_saved_amount_placeholder')}
                                className="w-full bg-[#1F1E1D] border border-[#262626] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#56a69f] focus:border-transparent transition-all duration-200 placeholder-gray-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                        </div>
                        
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 text-white hover:text-[#56a69f] font-semibold py-4 rounded-xl transition-colors duration-200"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-[#56a69f] text-white font-semibold py-4 rounded-xl hover:bg-[#00b37e] transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                            >
                                {t('savings_goals.create_goal')}
                            </button>
                        </div>
                    </form>
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {goals.length === 0 ? (
                <div className="text-center py-16 px-4 border-2 border-dashed border-[#262626] rounded-xl bg-[#1F1E1D]">
                    <div className="mb-6">
                        <svg className="w-16 h-16 text-[#56a69f] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                    <p className="text-[#C2C0B6] text-lg mb-2">{t('savings_goals.no_goals_yet')}</p>
                    <p className="text-gray-500">{t('savings_goals.no_goals_yet_description')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => {
                        const progress = (goal.current_amount / goal.target_amount) * 100;
                        return (
                            <div key={goal.id} className="bg-[#1F1E1D] border border-[#262626] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#262626]/80">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-xl font-bold text-white">{goal.goal_name}</h4>
                                    <CloseButton onClick={() => handleDeleteGoal(goal.id)} />
                                </div>
                                <p className="text-sm text-[#C2C0B6] mb-4 text-left">{t('savings_goals.target_date_label')} {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : t('common.not_set')}</p>
                                
                                <div className="w-full bg-[#232323] rounded-full h-4 mb-2">
                                    <div className="bg-[#56a69f] h-4 rounded-full transition-all duration-300" style={{ width: `${progress > 100 ? 100 : progress}%` }}></div>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-white">
                                    <span>{formatSimpleCurrency(goal.current_amount)}</span>
                                    <span>{formatSimpleCurrency(goal.target_amount)}</span>
                                </div>
                                <div className="mt-4 flex space-x-4">
                                    <button onClick={() => handleAddMoneyClick(goal.id)} className="bg-[#56a69f] hover:bg-[#4a8f88] !text-[#1F1E1D] font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md">
                                        {addingMoney[goal.id]?.isAdding ? t('common.cancel') : t('savings_goals.allocate_funds')}
                                    </button>
                                    {parseFloat(goal.current_amount) > 0 && (
                                        <button onClick={() => handleWithdrawMoneyClick(goal.id)} className="text-white hover:text-[#56a69f] font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
                                            {withdrawingMoney[goal.id]?.isWithdrawing ? t('common.cancel') : t('savings_goals.withdraw_funds')}
                                        </button>
                                    )}
                                </div>
                                {addingMoney[goal.id]?.isAdding && (
                                    <div className="mt-4 flex items-center">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={addingMoney[goal.id].amount}
                                            onChange={(e) => handleAmountChange(e, goal.id)}
                                            placeholder={t('savings_goals.amount_placeholder')}
                                            className="flex-1 bg-[#1F1E1D] border border-[#262626] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#56a69f] focus:border-transparent transition-all duration-200 placeholder-gray-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                        />
                                        <button
                                            onClick={() => {
                                                const amountToAdd = parseFloat(addingMoney[goal.id].amount);
                                                if (isNaN(amountToAdd) || amountToAdd <= 0) {
                                                    setError('Please enter a valid amount');
                                                    return;
                                                }
                                                if (amountToAdd > balance) {
                                                    setError(t('savings_goals.insufficient_balance_error'));
                                                    return;
                                                }
                                                setError(null);
                                                handleAllocateMoney(goal.id, amountToAdd);
                                            }}
                                            className="bg-[#56a69f] hover:bg-[#4a8f88] text-white font-semibold px-4 py-3 rounded-lg ml-2 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={
                                                !addingMoney[goal.id]?.amount || 
                                                addingMoney[goal.id]?.amount.trim() === '' ||
                                                isNaN(parseFloat(addingMoney[goal.id]?.amount || 0)) ||
                                                parseFloat(addingMoney[goal.id]?.amount || 0) < 0.01 ||
                                                parseFloat(addingMoney[goal.id]?.amount || 0) > balance 
                                            }
                                        >
                                            {t('common.save')}
                                        </button>
                                    </div>
                                )}
                                {withdrawingMoney[goal.id]?.isWithdrawing && (
                                    <div className="mt-4 flex items-center">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={withdrawingMoney[goal.id].amount}
                                            onChange={(e) => handleWithdrawAmountChange(e, goal.id)}
                                            placeholder={t('savings_goals.withdraw_amount_placeholder')}
                                            max={goal.current_amount}
                                            className="flex-1 bg-[#1F1E1D] border border-[#262626] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#56a69f] focus:border-transparent transition-all duration-200 placeholder-gray-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                        />
                                        <button
                                            onClick={() => {
                                                const amountToWithdraw = parseFloat(withdrawingMoney[goal.id].amount);
                                                if (amountToWithdraw > parseFloat(goal.current_amount)) {
                                                    setError(t('savings_goals.insufficient_saved_amount_error'));
                                                    return;
                                                }
                                                setError(null);
                                                handleWithdrawMoney(goal.id, amountToWithdraw);
                                            }}
                                            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-3 rounded-lg ml-2 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!withdrawingMoney[goal.id]?.amount || parseFloat(withdrawingMoney[goal.id]?.amount || 0) > parseFloat(goal.current_amount)}
                                        >
                                            {t('savings_goals.withdraw')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default SavingsGoals; 