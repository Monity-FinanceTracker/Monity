import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

// Modal component using correct hardcoded colors
const Modal = ({ children, onClose }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center px-4">
            <div className="bg-[#171717] border border-[#262626] p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-sm relative w-full max-w-md">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-white transition-colors p-2 bg-transparent border-none outline-none"
                    style={{ background: 'transparent', border: 'none', outline: 'none' }}
                >
                    <X className="w-5 h-5 text-white" />
                </button>
                {children}
            </div>
        </div>
    );
};


const SavingsGoals = () => {
    const { t } = useTranslation();
    const { user, subscriptionTier } = useAuth();
    
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

    const fetchGoalsAndBalance = async () => {
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
    };

    useEffect(() => {
        fetchGoalsAndBalance();
    }, []);

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
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('savings_goals.title')}</h2>
                <div className="flex items-center gap-4">
                    {isLimited && (
                        <Link
                            to="/subscription"
                            className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                            {t('savings_goals.upgrade_to_add')}
                        </Link>
                    )}
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className={`bg-[#01C38D] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#01a87a] transition-colors ${isLimited ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLimited}
                    >
                        {t('savings_goals.add_new_goal')}
                    </button>
                </div>
            </div>

            {isModalOpen && !isLimited && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#01C38D]/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#01C38D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white">{t('savings_goals.add_new_goal_modal_title')}</h3>
                    </div>
                    
                    <form onSubmit={handleAddGoal} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="goal_name" className="block text-white font-medium text-sm uppercase tracking-wide">
                                {t('savings_goals.goal_name')}
                            </label>
                            <input
                                type="text"
                                id="goal_name"
                                name="goal_name"
                                value={newGoal.goal_name}
                                onChange={handleInputChange}
                                placeholder={t('savings_goals.goal_name_placeholder')}
                                className="w-full bg-[#232323] border border-[#262626] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label htmlFor="target_amount" className="block text-white font-medium text-sm uppercase tracking-wide">
                                {t('savings_goals.target_amount')}
                            </label>
                            <input
                                type="number"
                                id="target_amount"
                                name="target_amount"
                                value={newGoal.target_amount}
                                onChange={handleInputChange}
                                placeholder={t('savings_goals.target_amount_placeholder')}
                                className="w-full bg-[#232323] border border-[#262626] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all duration-200 placeholder-gray-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label htmlFor="target_date" className="block text-white font-medium text-sm uppercase tracking-wide">
                                {t('savings_goals.target_date')}
                            </label>
                            <input
                                type="text"
                                id="target_date"
                                name="target_date"
                                value={newGoal.target_date}
                                onChange={handleInputChange}
                                placeholder="mm/dd/yyyy"
                                className="w-full bg-[#232323] border border-[#262626] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label htmlFor="current_amount" className="block text-white font-medium text-sm uppercase tracking-wide">
                                {t('savings_goals.initial_saved_amount')} <span className="text-gray-400 text-xs">(Optional)</span>
                            </label>
                            <input
                                type="number"
                                id="current_amount"
                                name="current_amount"
                                value={newGoal.current_amount}
                                onChange={handleInputChange}
                                placeholder={t('savings_goals.initial_saved_amount_placeholder')}
                                className="w-full bg-[#232323] border border-[#262626] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all duration-200 placeholder-gray-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                        </div>
                        
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 bg-[#232323] hover:bg-[#262626] text-white font-semibold py-4 rounded-xl transition-all duration-200 border border-[#262626]"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-[#01C38D] to-[#00A876] text-white font-semibold py-4 rounded-xl hover:from-[#00A876] hover:to-[#01C38D] transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                            >
                                {t('savings_goals.create_goal')}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {goals.length === 0 ? (
                <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">{t('savings_goals.no_goals_yet')}</p>
                    <p className="text-gray-500 dark:text-gray-400">{t('savings_goals.no_goals_yet_description')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => {
                        const progress = (goal.current_amount / goal.target_amount) * 100;
                        return (
                            <div key={goal.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{goal.goal_name}</h4>
                                    <button onClick={() => handleDeleteGoal(goal.id)} className="text-white transition-colors">
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('savings_goals.target_date_label')} {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : t('common.not_set')}</p>
                                
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                                    <div className="bg-[#01C38D] h-4 rounded-full" style={{ width: `${progress > 100 ? 100 : progress}%` }}></div>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-300">
                                    <span>${parseFloat(goal.current_amount).toLocaleString()}</span>
                                    <span>${parseFloat(goal.target_amount).toLocaleString()}</span>
                                </div>
                                <div className="mt-4 flex space-x-4">
                                    <button onClick={() => handleAddMoneyClick(goal.id)} className="text-[#01C38D] hover:underline font-semibold">
                                        {addingMoney[goal.id]?.isAdding ? t('common.cancel') : t('savings_goals.allocate_funds')}
                                    </button>
                                    {parseFloat(goal.current_amount) > 0 && (
                                        <button onClick={() => handleWithdrawMoneyClick(goal.id)} className="text-orange-500 hover:underline font-semibold">
                                            {withdrawingMoney[goal.id]?.isWithdrawing ? t('common.cancel') : t('savings_goals.withdraw_funds')}
                                        </button>
                                    )}
                                </div>
                                {addingMoney[goal.id]?.isAdding && (
                                    <div className="mt-4 flex items-center">
                                        <input
                                            type="number"
                                            value={addingMoney[goal.id].amount}
                                            onChange={(e) => handleAmountChange(e, goal.id)}
                                            placeholder={t('savings_goals.amount_placeholder')}
                                            className="p-2 border border-[#262626] rounded bg-[#232323] text-white w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                        />
                                        <button
                                            onClick={() => {
                                                const amountToAdd = parseFloat(addingMoney[goal.id].amount);
                                                if (amountToAdd > balance) {
                                                    setError(t('savings_goals.insufficient_balance_error'));
                                                    return;
                                                }
                                                setError(null);
                                                handleAllocateMoney(goal.id, amountToAdd);
                                            }}
                                            className="bg-blue-500 text-white p-2 rounded ml-2"
                                            disabled={parseFloat(addingMoney[goal.id]?.amount || 0) > balance || !addingMoney[goal.id]?.amount}
                                        >
                                            {t('common.save')}
                                        </button>
                                    </div>
                                )}
                                {withdrawingMoney[goal.id]?.isWithdrawing && (
                                    <div className="mt-4 flex items-center">
                                        <input
                                            type="number"
                                            value={withdrawingMoney[goal.id].amount}
                                            onChange={(e) => handleWithdrawAmountChange(e, goal.id)}
                                            placeholder={t('savings_goals.withdraw_amount_placeholder')}
                                            max={goal.current_amount}
                                            className="p-2 border border-[#262626] rounded bg-[#232323] text-white w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
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
                                            className="bg-orange-500 text-white p-2 rounded ml-2"
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