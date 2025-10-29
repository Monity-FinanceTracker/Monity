import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getCategories, addTransaction, post } from '../../utils/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Button, CloseButton } from '../ui';
import { FaPlus, FaArrowTrendDown, FaArrowTrendUp, FaChevronUp, FaChevronDown } from 'react-icons/fa6';
import { FaMoneyBillWave, FaCalendarAlt, FaListUl, FaStickyNote } from 'react-icons/fa';
import { categoryIconOptions } from '../../utils/iconMapping.jsx';

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
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        typeId: currentConfig.typeId,
        color: '#01C38D',
        icon: 'Package'
    });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showCategoryError, setShowCategoryError] = useState(false);
    const [shakeForm, setShakeForm] = useState(false);

    const colorOptions = [
        '#01C38D', '#EF4444', '#3B82F6', '#F59E0B', 
        '#8B5CF6', '#EC4899', '#10B981', '#F97316',
        '#6366F1', '#84CC16', '#06B6D4', '#EAB308'
    ];

    const iconOptions = categoryIconOptions;

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
        
        // Verifica se não há categorias do tipo correto disponíveis
        if (filteredCategories.length === 0) {
            setShakeForm(true);
            setShowCategoryError(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }

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

    const handleAddCategory = async (e) => {
        e.preventDefault();
        
        try {
            const { data } = await post('/categories', newCategory);
            setCategories(prev => [...prev, data]);
            setNewCategory({ 
                name: '', 
                typeId: currentConfig.typeId, 
                color: '#01C38D', 
                icon: 'Package' 
            });
            setShowAddCategoryModal(false);
            setShowCategoryError(false);
            toast.success(t('categories.add_success'));
            
            // Auto-select the newly created category
            setTransaction(prev => ({ ...prev, categoryName: data.name }));
        } catch (error) {
            toast.error(error.response?.data?.message || t('categories.add_error'));
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
                <div className={`bg-[#171717] p-6 md:p-8 rounded-2xl shadow-2xl border border-[#242532]/50 backdrop-blur-sm transition-all ${shakeForm ? 'animate-shake' : ''}`}>
                    <style>{`
                        @keyframes shake {
                            0%, 100% { transform: translateX(0); }
                            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                            20%, 40%, 60%, 80% { transform: translateX(10px); }
                        }
                        .animate-shake {
                            animation: shake 0.5s;
                        }
                        @keyframes fadeIn {
                            from {
                                opacity: 0;
                                transform: translateY(-10px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        .animate-fadeIn {
                            animation: fadeIn 0.3s ease-out;
                        }
                    `}</style>

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
                            <FaListUl className="absolute top-1/2 left-4 -translate-y-1/2 text-white z-10" />
                            <select
                                className={`w-full bg-[#232323] border ${showCategoryError ? 'border-red-500' : 'border-[#262626]'} text-white rounded-xl p-4 pl-12 pr-12 ${currentConfig.focusRing} focus:border-transparent transition-all duration-200 appearance-none cursor-pointer font-sans text-sm font-medium`}
                                style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                                value={transaction.categoryName}
                                onChange={e => {
                                    setTransaction(prev => ({ ...prev, categoryName: e.target.value }));
                                    setShowCategoryError(false);
                                }}
                            >
                                <option 
                                    value="" 
                                    className="bg-[#232323] text-white font-medium"
                                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: '500', backgroundColor: '#232323', color: 'white' }}
                                >
                                    {filteredCategories.length === 0 
                                        ? t('addTransaction.no_categories_available')
                                        : t(`${currentConfig.translationKey}.select_category`)
                                    }
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

                        {/* Error Alert - No Categories */}
                        {showCategoryError && (
                            <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-4 animate-fadeIn">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-red-400 font-semibold mb-1">
                                            {t('addTransaction.no_category_alert_title')}
                                        </h3>
                                        <p className="text-red-300 text-sm mb-3">
                                            {t('addTransaction.no_category_alert_message')}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddCategoryModal(true)}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm flex items-center gap-2"
                                        >
                                            <FaPlus className="text-xs" />
                                            {t('addTransaction.create_category_now')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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

            {/* Add Category Modal */}
            {showAddCategoryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-[#171717] rounded-lg border border-[#262626] w-full max-w-md sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] p-4 sm:p-6 my-2 sm:my-4 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">{t('categories.add_new')}</h2>
                            <CloseButton onClick={() => setShowAddCategoryModal(false)} />
                        </div>

                        <form onSubmit={handleAddCategory} className="space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    {t('categories.name')}
                                </label>
                                <input
                                    type="text"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-[#232323] border border-[#262626] text-white rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                                    placeholder={t('categories.name_placeholder')}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    {t('categories.type')}
                                </label>
                                <div className="relative" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                    <select
                                        value={newCategory.typeId}
                                        onChange={(e) => {
                                            setNewCategory(prev => ({ ...prev, typeId: parseInt(e.target.value) }));
                                            setIsDropdownOpen(false);
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        onBlur={() => {
                                            setTimeout(() => setIsDropdownOpen(false), 150);
                                        }}
                                        className="w-full bg-[#232323] border border-[#262626] text-white rounded-lg p-2 sm:p-3 pr-8 sm:pr-10 focus:outline-none focus:ring-0 focus:border-[#262626] transition-all cursor-pointer"
                                        style={{ 
                                            background: '#232323',
                                            color: 'white',
                                            appearance: 'none',
                                            WebkitAppearance: 'none',
                                            MozAppearance: 'none'
                                        }}
                                    >
                                        <option value={1}>{t('categories.expense')}</option>
                                        <option value={2}>{t('categories.income')}</option>
                                    </select>
                                    <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg 
                                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    {t('categories.icon')}
                                </label>
                                <div className="grid grid-cols-5 gap-1 sm:gap-2">
                                    {iconOptions.map((iconOption) => {
                                        const IconComponent = iconOption.icon;
                                        return (
                                            <button
                                                key={iconOption.name}
                                                type="button"
                                                onClick={() => setNewCategory(prev => ({ ...prev, icon: iconOption.name }))}
                                                className={`p-2 sm:p-3 rounded-lg border transition-all flex items-center justify-center ${
                                                    newCategory.icon === iconOption.name 
                                                        ? 'border-[#01C38D] bg-[#01C38D]/20 text-[#01C38D]' 
                                                        : 'border-[#262626] hover:border-[#01C38D]/50 text-gray-400 hover:text-white'
                                                }`}
                                                title={iconOption.label}
                                            >
                                                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    {t('categories.color')}
                                </label>
                                <div className="grid grid-cols-6 gap-1 sm:gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg border-2 transition-all ${
                                                newCategory.color === color 
                                                    ? 'border-white' 
                                                    : 'border-transparent hover:border-gray-400'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddCategoryModal(false)}
                                    className="flex-1 bg-gray-600 text-white py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                                >
                                    {t('categories.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#01C38D] text-white py-2 sm:py-3 rounded-lg hover:bg-[#00b37e] transition-colors text-sm sm:text-base"
                                >
                                    {t('categories.add')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddTransaction;

