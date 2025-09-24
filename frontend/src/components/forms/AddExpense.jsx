import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getCategories, addTransaction } from '../../utils/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { FaPlus, FaArrowTrendDown } from 'react-icons/fa6';
import { FaDollarSign, FaCalendarAlt, FaListUl, FaStickyNote } from 'react-icons/fa';

const AddExpense = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [expense, setExpense] = useState({
        description: '',
        amount: '',
        date: '', // Initialize empty, set with useEffect to avoid hydration issues
        categoryId: '',
        typeId: 1 // 1 for expense
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Set default date after component mounts to avoid hydration issues
    useEffect(() => {
        setExpense(prev => ({
            ...prev,
            date: new Date().toISOString().slice(0, 10)
        }));
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getCategories();
                setCategories(fetchedCategories);
            } catch (err) {
                setError(t('addExpense.failed_load_categories'));
                toast.error(t('addExpense.failed_load_categories'));
            }
        };
        fetchCategories();
    }, [t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const expenseData = { 
            ...expense, 
            amount: parseFloat(expense.amount),
            category: expense.categoryId // Map categoryId to category for backend
        };
        delete expenseData.categoryId; // Remove categoryId as backend expects 'category'

        if (!expenseData.description || !expenseData.amount || !expenseData.category) {
            toast.error(t('addTransaction.fill_all_fields'));
            setLoading(false);
            return;
        }

        try {
            await addTransaction(expenseData);
            
            // Invalidate and refetch all transaction-related queries
            await queryClient.invalidateQueries({ queryKey: ['transactions'] });
            await queryClient.invalidateQueries({ queryKey: ['balance'] });
            await queryClient.invalidateQueries({ queryKey: ['savings'] });
            await queryClient.invalidateQueries({ queryKey: ['budgets'] });
            
            toast.success(t('addExpense.success'));
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || t('addExpense.failed'));
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#191E29] via-[#1a1f2e] to-[#23263a] p-4 md:p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl mb-4 shadow-lg">
                        <FaArrowTrendDown className="text-white text-2xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('addExpense.title')}</h1>
                    <p className="text-gray-400 text-lg">Track your spending with smart categorization</p>
                </div>

                {/* Add Expense Form */}
                <div className="bg-gradient-to-r from-[#23263a] to-[#2a2f45] p-6 md:p-8 rounded-2xl shadow-2xl border border-[#31344d]/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <FaPlus className="text-red-400 text-lg" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Add New Expense</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Description Input */}
                        <div className="space-y-2">
                            <label className="block text-white font-medium text-sm uppercase tracking-wide">
                                Description
                            </label>
                            <div className="relative">
                                <FaStickyNote className="absolute top-1/2 left-4 -translate-y-1/2 text-white" />
                                <input
                                    className="w-full bg-[#171717] border border-[#262626] text-white rounded-xl p-4 pl-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                    placeholder={t('addExpense.description')}
                                    value={expense.description}
                                    onChange={e => setExpense(prev => ({ ...prev, description: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <FaDollarSign className="absolute top-1/2 left-4 -translate-y-1/2 text-white" />
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-[#171717] border border-[#262626] text-white rounded-xl p-4 pl-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                    placeholder={t('addExpense.amount')}
                                    value={expense.amount}
                                    onChange={e => setExpense(prev => ({ ...prev, amount: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="relative">
                                <FaCalendarAlt className="absolute top-1/2 left-4 -translate-y-1/2 text-white" />
                                <input
                                    type="date"
                                    className="w-full bg-[#171717] border border-[#262626] text-white rounded-xl p-4 pl-12 pr-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-4 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4"
                                    value={expense.date}
                                    onChange={e => setExpense(prev => ({ ...prev, date: e.target.value }))}
                                    required
                                />
                                <FaCalendarAlt className="absolute top-1/2 right-4 -translate-y-1/2 text-white pointer-events-none" />
                            </div>
                        </div>
                        
                        <div className="relative">
                            <FaListUl className="absolute top-1/2 left-4 -translate-y-1/2 text-white" />
                            <select
                                className="w-full bg-[#171717] border border-[#262626] text-white rounded-xl p-4 pl-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 appearance-none"
                                value={expense.categoryId}
                                onChange={e => setExpense(prev => ({ ...prev, categoryId: e.target.value }))}
                                required
                            >
                                <option value="" className="bg-[#191E29] text-white">{t('addExpense.select_category')}</option>
                                {categories.filter(c => c.typeId === 1).map(category => (
                                    <option key={category.id} value={category.id} className="bg-[#191E29] text-white">
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="danger"
                            size="lg"
                            fullWidth
                            loading={loading}
                            disabled={loading}
                            leftIcon={!loading ? <FaPlus className="text-lg" /> : null}
                        >
                            {loading ? t('addExpense.adding') : t('addExpense.add_expense')}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddExpense;