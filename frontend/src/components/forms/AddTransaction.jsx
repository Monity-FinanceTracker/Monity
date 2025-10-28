import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getCategories, addTransaction } from '../../utils/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { FaPlus, FaArrowTrendDown, FaArrowTrendUp, FaChevronUp, FaChevronDown } from 'react-icons/fa6';
import { FaMoneyBillWave, FaCalendarAlt, FaListUl, FaStickyNote } from 'react-icons/fa';

/**
 * Componente unificado para adicionar receitas e despesas
 * @param {Object} props
 * @param {'expense' | 'income'} props.type - Tipo de transação (expense ou income)
 */
const AddTransaction = ({ type = 'expense' }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    
    // Configuração baseada no tipo
    const config = {
        expense: {
            typeId: 1,
            icon: FaArrowTrendDown,
            colorClass: 'red',
            gradient: 'from-red-500 to-red-600',
            bgColor: 'bg-red-500/20',
            textColor: 'text-red-400',
            focusRing: 'focus:ring-red-500',
            buttonVariant: 'danger',
            translationKey: 'addExpense'
        },
        income: {
            typeId: 2,
            icon: FaArrowTrendUp,
            colorClass: 'green',
            gradient: 'from-green-500 to-green-600',
            bgColor: 'bg-green-500/20',
            textColor: 'text-green-400',
            focusRing: 'focus:ring-green-500',
            buttonVariant: 'success',
            translationKey: 'addIncome'
        }
    };

    const currentConfig = config[type];
    const Icon = currentConfig.icon;

    const [transaction, setTransaction] = useState({
        description: '',
        amount: '',
        date: '', // Initialize empty, set with useEffect to avoid hydration issues
        categoryName: '',
        typeId: currentConfig.typeId
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Set default date after component mounts to avoid hydration issues
    useEffect(() => {
        setTransaction(prev => ({
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
                setError(t(`${currentConfig.translationKey}.failed_load_categories`));
                toast.error(t(`${currentConfig.translationKey}.failed_load_categories`));
            }
        };
        fetchCategories();
    }, [t, currentConfig.translationKey]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const transactionData = { 
            ...transaction, 
            amount: parseFloat(transaction.amount),
            category: transaction.categoryName
        };

        if (!transactionData.description || !transactionData.amount || !transactionData.category) {
            toast.error(t('addTransaction.fill_all_fields'));
            setLoading(false);
            return;
        }

        try {
            await addTransaction(transactionData);
            
            // Invalidate and refetch all transaction-related queries
            await queryClient.invalidateQueries({ queryKey: ['transactions'] });
            await queryClient.invalidateQueries({ queryKey: ['balance'] });
            await queryClient.invalidateQueries({ queryKey: ['savings'] });
            await queryClient.invalidateQueries({ queryKey: ['budgets'] });
            
            toast.success(t(`${currentConfig.translationKey}.success`));
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || t(`${currentConfig.translationKey}.failed`));
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    const filteredCategories = categories.filter(c => c.typeId === currentConfig.typeId);

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-4 md:p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${currentConfig.gradient} rounded-2xl mb-4 shadow-lg`}>
                        <Icon className="text-white text-2xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {t(`${currentConfig.translationKey}.title`)}
                    </h1>
                    <p className="text-gray-400 text-lg">
                        {t(`${currentConfig.translationKey}.subtitle`)}
                    </p>
                </div>

                {/* Add Transaction Form */}
                <div className="bg-[#171717] p-6 md:p-8 rounded-2xl shadow-2xl border border-[#242532]/50 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className={`w-10 h-10 ${currentConfig.bgColor} rounded-lg flex items-center justify-center`}>
                            <FaPlus className={`${currentConfig.textColor} text-lg`} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {t(`${currentConfig.translationKey}.form_title`)}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Description Input */}
                        <div className="space-y-2">
                            <label className="block text-white font-medium text-sm uppercase tracking-wide">
                                {t(`${currentConfig.translationKey}.description_label`)}
                            </label>
                            <div className="relative">
                                <FaStickyNote className="absolute top-1/2 left-4 -translate-y-1/2 text-white" />
                                <input
                                    className={`w-full bg-[#232323] border border-[#262626] text-white rounded-xl p-4 pl-12 ${currentConfig.focusRing} focus:border-transparent transition-all duration-200 placeholder-gray-500`}
                                    placeholder={t(`${currentConfig.translationKey}.description`)}
                                    value={transaction.description}
                                    onChange={e => setTransaction(prev => ({ ...prev, description: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <FaMoneyBillWave className="absolute top-1/2 left-4 -translate-y-1/2 text-white" />
                                <input
                                    type="number"
                                    step="0.01"
                                    className={`w-full bg-[#232323] border border-[#262626] text-white rounded-xl p-4 pl-12 pr-12 ${currentConfig.focusRing} focus:border-transparent transition-all duration-200 placeholder-gray-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]`}
                                    placeholder={t(`${currentConfig.translationKey}.amount`)}
                                    value={transaction.amount}
                                    onChange={e => setTransaction(prev => ({ ...prev, amount: e.target.value }))}
                                    required
                                />
                                {/* Custom spinner arrows */}
                                <div className="absolute top-1/2 right-3 -translate-y-1/2 flex flex-col gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setTransaction(prev => ({ ...prev, amount: ((parseFloat(prev.amount) || 0) + 0.01).toFixed(2) }))}
                                        className="w-4 h-3 flex items-center justify-center text-white hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                                        style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0 }}
                                    >
                                        <FaChevronUp className="w-3 h-3 text-white stroke-2" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTransaction(prev => ({ ...prev, amount: Math.max(0, (parseFloat(prev.amount) || 0) - 0.01).toFixed(2) }))}
                                        className="w-4 h-3 flex items-center justify-center text-white hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                                        style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0 }}
                                    >
                                        <FaChevronDown className="w-3 h-3 text-white stroke-2" />
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <FaCalendarAlt className="absolute top-1/2 left-4 -translate-y-1/2 text-white" />
                                <input
                                    type="date"
                                    className={`w-full bg-[#232323] border border-[#262626] text-white rounded-xl p-4 pl-12 ${currentConfig.focusRing} focus:border-transparent transition-all duration-200 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-4 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4`}
                                    value={transaction.date}
                                    onChange={e => setTransaction(prev => ({ ...prev, date: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="relative">
                            <FaListUl className="absolute top-1/2 left-4 -translate-y-1/2 text-white" />
                            <select
                                className={`w-full bg-[#232323] border border-[#262626] text-white rounded-xl p-4 pl-12 pr-12 ${currentConfig.focusRing} focus:border-transparent transition-all duration-200 appearance-none cursor-pointer font-sans text-sm font-medium`}
                                style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                                value={transaction.categoryName}
                                onChange={e => setTransaction(prev => ({ ...prev, categoryName: e.target.value }))}
                                required
                            >
                                <option 
                                    value="" 
                                    className="bg-[#232323] text-white font-medium"
                                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: '500', backgroundColor: '#232323', color: 'white' }}
                                >
                                    {t(`${currentConfig.translationKey}.select_category`)}
                                </option>
                                {filteredCategories.map(category => (
                                    <option 
                                        key={category.id} 
                                        value={category.name} 
                                        className="bg-[#232323] text-white font-medium"
                                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: '500', backgroundColor: '#232323', color: 'white' }}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant={currentConfig.buttonVariant}
                            size="lg"
                            fullWidth
                            loading={loading}
                            disabled={loading}
                            leftIcon={!loading ? <FaPlus className="text-lg" /> : null}
                            style={{ justifyContent: 'center' }}
                        >
                            {loading 
                                ? t(`${currentConfig.translationKey}.adding`) 
                                : t(`${currentConfig.translationKey}.add_${type}`)
                            }
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTransaction;

