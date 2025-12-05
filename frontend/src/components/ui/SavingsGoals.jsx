import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/useAuth';
import { Link } from 'react-router-dom';
import CloseButton from './CloseButton';
import { formatSimpleCurrency } from '../../utils/currency';
import formatDate from '../../utils/formatDate';
import { useSmartUpgradePrompt } from '../premium/SmartUpgradePrompt';
import { FiStar, FiLock, FiTarget } from 'react-icons/fi';
import PremiumUpgradeCard from '../groups/PremiumUpgradeCard';
import { useSavingsGoals, useAddSavingsGoal, useUpdateSavingsGoal, useBalance } from '../../hooks/useQueries';

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
    // React Query hooks
    const { data: goals = [] } = useSavingsGoals();
    const { data: balanceData } = useBalance();
    const balance = balanceData?.balance || 0;
    const addGoalMutation = useAddSavingsGoal();

    // Local UI state
    const [newGoal, setNewGoal] = useState({
        goal_name: '',
        target_amount: '',
        target_date: '',
        current_amount: ''
    });
    const [addingMoney, setAddingMoney] = useState({});
    const [withdrawingMoney, setWithdrawingMoney] = useState({});
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Edit state
    const [editingGoal, setEditingGoal] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        target_amount: '',
        target_date: ''
    });

    const updateGoalMutation = useUpdateSavingsGoal();

    // Helper function to convert DD/MM/YYYY to YYYY-MM-DD
    const convertToApiFormat = (dateString) => {
        if (!dateString) return null;
        // Check if it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
            return dateString;
        }
        // Convert from DD/MM/YYYY to YYYY-MM-DD
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            // Handle 2-digit years
            const fullYear = year.length === 2 ? `20${year}` : year;
            return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return dateString;
    };

    const isLimited = subscriptionTier === 'free' && goals.length >= 2;

    const shouldShowPremiumCard = useMemo(
        () => subscriptionTier === 'free' && goals.length >= 2,
        [subscriptionTier, goals.length]
    );

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
            const goalData = {
                ...newGoal,
                target_date: newGoal.target_date ? convertToApiFormat(newGoal.target_date) : null
            };
            await addGoalMutation.mutateAsync(goalData);
            setNewGoal({
                goal_name: '',
                target_amount: '',
                target_date: '',
                current_amount: ''
            });
            setIsModalOpen(false);
            // No need to call fetchGoalsAndBalance - React Query auto-refreshes
        } catch (error) {
            console.error('Error adding savings goal:', error);
            setError(error.response?.data?.message || t('savings_goals.add_error'));
        }
    };

    const handleDeleteGoal = async (goalId) => {
        try {
            await api.delete(`/savings-goals/${goalId}`);
            // React Query will auto-refresh via cache invalidation
        } catch (error) {
            console.error('Error deleting savings goal:', error);
            setError(error.response?.data?.message || t('savings_goals.delete_error'));
        }
    };

    const handleAllocateMoney = async (goalId, amount) => {
        try {
            await api.post(`/savings-goals/${goalId}/allocate`, { amount });
            // React Query will auto-refresh via cache invalidation
            setAddingMoney(prev => ({ ...prev, [goalId]: { isAdding: false, amount: '' } }));
        } catch (error) {
            console.error('Error allocating money:', error);
        }
    };

    const handleWithdrawMoney = async (goalId, amount) => {
        try {
            await api.post(`/savings-goals/${goalId}/withdraw`, { amount });
            // React Query will auto-refresh via cache invalidation
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

    const handleEditClick = (goal) => {
        setEditingGoal(goal);
        setEditForm({
            target_amount: goal.target_amount || '',
            target_date: goal.target_date ? formatDate(goal.target_date) : ''
        });
        setShowEditModal(true);
    };

    const handleUpdateGoal = async (e) => {
        e.preventDefault();

        if (!editForm.target_amount) {
            setError(t('savings_goals.target_amount_required'));
            return;
        }

        try {
            await updateGoalMutation.mutateAsync({
                id: editingGoal.id,
                goalData: {
                    target_amount: parseFloat(editForm.target_amount),
                    target_date: convertToApiFormat(editForm.target_date) || null
                }
            });
            setShowEditModal(false);
            setEditingGoal(null);
            setError(null);
            // Success notification could be added here
        } catch (error) {
            console.error('Error updating savings goal:', error);
            setError(error.response?.data?.message || t('savings_goals.update_error'));
        }
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingGoal(null);
        setEditForm({ target_amount: '', target_date: '' });
        setError(null);
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
                                placeholder="DD/MM/YYYY"
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
                                    <div className="flex items-center gap-2">
                                        {/* Edit Button */}
                                        <button
                                            onClick={() => handleEditClick(goal)}
                                            className="text-[#C2C0B6] hover:text-[#56a69f] transition-colors p-1"
                                            title={t('savings_goals.edit')}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>

                                        {/* Existing Delete Button */}
                                        <CloseButton onClick={() => handleDeleteGoal(goal.id)} />
                                    </div>
                                </div>
                                <p className="text-sm text-[#C2C0B6] mb-4 text-left">{t('savings_goals.target_date_label')} {goal.target_date ? formatDate(goal.target_date) : t('common.not_set')}</p>
                                
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

            {/* Edit Goal Modal */}
            {showEditModal && editingGoal && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-2 sm:p-4 pt-8 sm:pt-12 overflow-y-auto">
                    <div className="bg-[#1F1E1D] rounded-lg border border-[#262626] w-full max-w-md p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">{t('savings_goals.edit_goal')}</h2>
                                <p className="text-sm text-[#C2C0B6] mt-1">{t('savings_goals.edit_goal_description')}</p>
                            </div>
                            <CloseButton onClick={handleCancelEdit} />
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleUpdateGoal} className="space-y-4 sm:space-y-6">
                            {/* Read-only: Goal Name */}
                            <div className="space-y-2">
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    {t('savings_goals.goal_name')}
                                </label>
                                <div className="w-full bg-[#232323] border border-[#262626] text-[#8B8A85] rounded-xl p-4">
                                    {editingGoal.goal_name}
                                </div>
                                <p className="text-xs text-[#8B8A85]">{t('savings_goals.goal_name_readonly')}</p>
                            </div>

                            {/* Editable: Target Amount */}
                            <div className="space-y-2">
                                <label htmlFor="edit_target_amount" className="block text-gray-300 text-sm font-medium mb-2">
                                    {t('savings_goals.target_amount')} <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="edit_target_amount"
                                    value={editForm.target_amount}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, target_amount: e.target.value }))}
                                    placeholder={t('savings_goals.target_amount_placeholder')}
                                    className="w-full bg-[#1F1E1D] border border-[#262626] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#56a69f] focus:border-transparent transition-all duration-200 placeholder-gray-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    required
                                />
                            </div>

                            {/* Editable: Target Date */}
                            <div className="space-y-2">
                                <label htmlFor="edit_target_date" className="block text-gray-300 text-sm font-medium mb-2">
                                    {t('savings_goals.target_date')}
                                </label>
                                <input
                                    type="text"
                                    id="edit_target_date"
                                    value={editForm.target_date}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, target_date: e.target.value }))}
                                    placeholder="DD/MM/YYYY"
                                    className="w-full bg-[#1F1E1D] border border-[#262626] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#56a69f] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                />
                            </div>

                            {/* Read-only: Current Amount */}
                            <div className="space-y-2">
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    {t('savings_goals.current_amount')}
                                </label>
                                <div className="w-full bg-[#232323] border border-[#262626] text-[#8B8A85] rounded-xl p-4">
                                    {formatSimpleCurrency(editingGoal.current_amount)}
                                </div>
                                <p className="text-xs text-[#8B8A85]">{t('savings_goals.current_amount_readonly')}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="flex-1 text-white hover:text-[#56a69f] font-semibold py-4 rounded-xl transition-colors duration-200"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateGoalMutation.isPending}
                                    className="flex-1 bg-[#56a69f] text-white font-semibold py-4 rounded-xl hover:bg-[#00b37e] transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {updateGoalMutation.isPending ? t('common.saving') : t('savings_goals.update_goal')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavingsGoals; 