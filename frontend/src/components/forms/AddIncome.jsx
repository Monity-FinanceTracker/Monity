import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getCategories, addTransaction } from '../../utils/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { FaPlus, FaArrowTrendUp } from 'react-icons/fa6';
import { FaDollarSign, FaCalendarAlt, FaListUl, FaStickyNote } from 'react-icons/fa';

const AddIncome = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [income, setIncome] = useState({
        description: '',
        amount: '',
        date: '', // Initialize empty, set with useEffect to avoid hydration issues
        categoryId: '',
        typeId: 2 // 2 for income
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Set default date after component mounts to avoid hydration issues
    useEffect(() => {
        setIncome(prev => ({
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
                setError(t('addIncome.failed_load_categories'));
                toast.error(t('addIncome.failed_load_categories'));
            }
        };
        fetchCategories();
    }, [t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const incomeData = { 
            ...income, 
            amount: parseFloat(income.amount),
            category: income.categoryId // Map categoryId to category for backend
        };
        delete incomeData.categoryId; // Remove categoryId as backend expects 'category'

        if (!incomeData.description || !incomeData.amount || !incomeData.category) {
            toast.error(t('addTransaction.fill_all_fields'));
            setLoading(false);
            return;
        }

        try {
            await addTransaction(incomeData);
            
            // Invalidate and refetch all transaction-related queries
            await queryClient.invalidateQueries({ queryKey: ['transactions'] });
            await queryClient.invalidateQueries({ queryKey: ['balance'] });
            await queryClient.invalidateQueries({ queryKey: ['savings'] });
            await queryClient.invalidateQueries({ queryKey: ['budgets'] });
            
            toast.success(t('addIncome.success'));
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || t('addIncome.failed'));
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    const incomeCategories = categories.filter(c => c.typeId === 2);

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6 bg-[#1f2937] text-white rounded-2xl shadow-lg">
            <header className="mb-6 text-center">
                 <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('addIncome.title')}</h1>
                 <p className="text-gray-400">{t('addIncome.subtitle')}</p>
            </header>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="relative">
                     <FaStickyNote className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                     <input
                         type="text"
                         className="w-full bg-[#191E29] border border-[#31344d]/50 text-white rounded-xl p-4 pl-12 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                         placeholder={t('addIncome.description')}
                         value={income.description}
                         onChange={e => setIncome(prev => ({ ...prev, description: e.target.value }))}
                         required
                     />
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <FaDollarSign className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="number"
                            step="0.01"
                            className="w-full bg-[#191E29] border border-[#31344d]/50 text-white rounded-xl p-4 pl-12 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                            placeholder={t('addIncome.amount')}
                            value={income.amount}
                            onChange={e => setIncome(prev => ({ ...prev, amount: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="relative">
                        <FaCalendarAlt className="absolute top-1/2 left-4 -translate-y-1/2 text-white" />
                        <input
                            type="date"
                            className="w-full bg-[#191E29] border border-[#31344d]/50 text-white rounded-xl p-4 pl-12 pr-12 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-4 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4"
                            value={income.date}
                            onChange={e => setIncome(prev => ({ ...prev, date: e.target.value }))}
                            required
                        />
                        <FaCalendarAlt className="absolute top-1/2 right-4 -translate-y-1/2 text-white pointer-events-none" />
                    </div>
                </div>
                <div className="relative">
                    <FaListUl className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                    <select
                        className="w-full bg-[#191E29] border border-[#31344d]/50 text-white rounded-xl p-4 pl-12 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none"
                        value={income.categoryId}
                        onChange={e => setIncome(prev => ({ ...prev, categoryId: e.target.value }))}
                        required
                    >
                        <option value="" className="text-gray-400">{t('addIncome.select_category')}</option>
                        {incomeCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end pt-4">
                    <Button 
                        type="submit" 
                        variant="primary" 
                        size="lg"
                        loading={loading}
                        disabled={loading}
                        leftIcon={!loading ? <FaPlus /> : null}
                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 focus:ring-green-600/20"
                    >
                        {loading ? t('addIncome.adding') : t('addIncome.add_income')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddIncome;
