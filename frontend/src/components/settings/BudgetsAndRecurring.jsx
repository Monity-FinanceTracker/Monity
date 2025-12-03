import { useState, useEffect, useCallback } from 'react';
import {
    getBudgets,
    upsertBudget,
    deleteBudget,
    getCategories,
    getRecurringTransactions,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    processRecurringTransactions,
    getTransactionTypes
} from '../../utils/api';
import { useAuth } from '../../context/useAuth';
import { useTranslation } from 'react-i18next';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa6';
import { useUpdateRecurringTransaction } from '../../hooks/useQueries';

function CardWrapper({ children, title, accent }) {
    return (
        <div className="flex-1 min-w-[250px] p-6 rounded-2xl shadow-lg border border-[#262626] bg-[#1F1E1D] flex flex-col items-center justify-center">
            <h2 className={`text-2xl font-bold mb-4 ${accent}`}>{title}</h2>
            <div className="w-full flex justify-center items-center">
                {children}
            </div>
        </div>
    );
}

function Budget() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current month
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBudgetsAndCategories = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const [budgetsData, categoriesData] = await Promise.all([
                getBudgets(),
                getCategories()
            ]);
            setBudgets(budgetsData);
            // Filter for expense categories, assuming typeId for Expense is 1
            setCategories(categoriesData.filter(c => c.typeId === 1)); 
        } catch (err) {
            setError('Failed to fetch budgets and categories');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBudgetsAndCategories();
    }, [fetchBudgetsAndCategories]);

    const handleSetBudget = async (e) => {
        e.preventDefault();
        if (!selectedCategory || !amount || !month) {
            setError(t('budgets.fill_all_fields'));
            return;
        }
        setIsLoading(true);
        try {
            // Format month to be just YYYY-MM-01 for consistency
            const budgetDate = new Date(month + '-01').toISOString().split('T')[0];
            
            // Find the category name for display purposes
            const selectedCategoryObj = categories.find(cat => cat.id === selectedCategory);
            const categoryName = selectedCategoryObj?.name || 'Unknown Category';
            
            await upsertBudget({ 
                categoryId: selectedCategory, 
                amount: parseFloat(amount), 
                month: budgetDate,
                name: `${categoryName} Budget - ${month}`
            });
            setAmount('');
            setSelectedCategory('');
            fetchBudgetsAndCategories(); // Refresh list
        } catch (err) {
            setError(t('budgets.set_budget_error'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBudget = async (budgetId) => {
        setIsLoading(true);
        try {
            await deleteBudget(budgetId);
            fetchBudgetsAndCategories(); // Refresh list
        } catch (err) {
            setError(t('budgets.delete_budget_error'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return <p>{t('budgets.login_prompt')}</p>;
    }

    return (
        <div className="w-full">
            <h3 className="text-xl font-bold mb-4 text-[#56a69f]">{t('budgets.set_new_budget')}</h3>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSetBudget} className="flex flex-col gap-4 mb-6">
                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="p-3 rounded bg-[#1F1E1D] text-white w-full"
                    required
                >
                    <option 
                        value=""
                        style={{
                            minWidth: '250px',
                            width: 'max-content',
                            padding: '8px 12px',
                            backgroundColor: '#1F1E1D',
                            color: 'white'
                        }}
                    >
                        {t('budgets.select_category')}
                    </option>
                    {categories.map(cat => (
                        <option 
                            key={cat.id} 
                            value={cat.id}
                            style={{
                                minWidth: '250px',
                                width: 'max-content',
                                padding: '8px 12px',
                                backgroundColor: '#1F1E1D',
                                color: 'white'
                            }}
                        >
                            {cat.name}
                        </option>
                    ))}
                </select>
                <div className="relative">
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder={t('budgets.amount_placeholder')}
                        className="p-3 pr-10 rounded bg-[#1F1E1D] text-white w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        required
                    />
                    {/* Custom spinner arrows */}
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col gap-0.5">
                        <button
                            type="button"
                            onClick={() => setAmount(((parseFloat(amount) || 0) + 0.01).toFixed(2))}
                            className="w-4 h-3 flex items-center justify-center text-[#C2C0B6] hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                            style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0 }}
                        >
                            <FaChevronUp className="w-3 h-3 text-[#C2C0B6] stroke-2" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setAmount(Math.max(0, (parseFloat(amount) || 0) - 0.01).toFixed(2))}
                            className="w-4 h-3 flex items-center justify-center text-[#C2C0B6] hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                            style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0 }}
                        >
                            <FaChevronDown className="w-3 h-3 text-[#C2C0B6] stroke-2" />
                        </button>
                    </div>
                </div>
                <input 
                    type="month" 
                    value={month} 
                    onChange={(e) => setMonth(e.target.value)}
                    className="p-3 rounded bg-[#1F1E1D] text-white w-full"
                    required
                />
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="p-3 rounded bg-[#56a69f] text-white font-bold hover:bg-[#4a8f88] transition-colors w-full"
                >
                    {isLoading ? t('budgets.saving') : t('budgets.set_budget_button')}
                </button>
            </form>

            <h3 className="text-xl font-bold mb-4 text-[#56a69f]">{t('budgets.your_budgets')}</h3>
            {isLoading && budgets.length === 0 ? (
                 <div className="w-full h-40 flex justify-center items-center">
                    <div className="w-12 h-12 rounded-full border-4 border-[#242532] border-t-[#56a69f] animate-spin"></div>
                </div>
            ) : (
                <ul className="space-y-2">
                    {budgets.map(budget => (
                        <li key={budget.id} className="flex justify-between items-center p-3 bg-[#1F1E1D] rounded-lg">
                            <div>
                                <span className="font-bold">{budget.categories.name}</span>
                                <span className="text-sm text-[#C2C0B6] block">{new Date(budget.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="font-bold text-[#56a69f]">R$ {parseFloat(budget.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <button 
                                    onClick={() => handleDeleteBudget(budget.id)} 
                                    className="p-2 text-[#C2C0B6] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="Delete budget"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function RecurringTransactions() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [recurring, setRecurring] = useState([]);
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);
    const [form, setForm] = useState({
        description: '',
        amount: '',
        typeId: '',
        categoryId: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
    });
    const [isEditing, setIsEditing] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateRecurringMutation = useUpdateRecurringTransaction();

    const fetchData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [recData, catData, typeData] = await Promise.all([
                getRecurringTransactions(),
                getCategories(),
                getTransactionTypes()
            ]);
            setRecurring(recData);
            setCategories(catData);
            setTypes(typeData);
        } catch {
            setError('Failed to fetch recurring transactions');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleProcess = async () => {
        // Prevent multiple clicks
        if (isLoading) return;

        setIsLoading(true);
        setError(null); // Clear any previous errors

        try {
            const result = await processRecurringTransactions();

            // Show success message
            if (result?.success) {
                const message = result.processed > 0
                    ? t('recurring.processing_complete_count', { count: result.processed })
                    : t('recurring.processing_complete');
                alert(message);
            } else {
                alert(t('recurring.processing_complete'));
            }

            // Refresh data to show newly created transactions
            fetchData();
        } catch (error) {
            console.error('Failed to process recurring transactions:', error);
            const errorMessage = error.response?.data?.error || error.message || t('recurring.processing_error');
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isEditing) {
                await updateRecurringMutation.mutateAsync({
                    id: isEditing,
                    transactionData: form
                });
                alert(t('recurring.update_success'));
            } else {
                await addRecurringTransaction(form);
                alert(t('recurring.add_success'));
            }
            resetForm();
            fetchData();
        } catch (err) {
            setError(isEditing ? t('recurring.update_error') : t('recurring.save_error'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item) => {
        setIsEditing(item.id);
        setForm({
            ...item,
            startDate: new Date(item.startDate).toISOString().split('T')[0],
            endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const _handleDelete = async (id) => {
        setIsLoading(true);
        try {
            await deleteRecurringTransaction(id);
            fetchData();
        } catch {
            setError(t('recurring.delete_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setIsEditing(null);
        setForm({
            description: '',
            amount: '',
            typeId: '',
            categoryId: '',
            frequency: 'monthly',
            startDate: new Date().toISOString().split('T')[0],
            endDate: ''
        });
    };

    if (isLoading && recurring.length === 0) {
        return (
            <div className="w-full h-40 flex justify-center items-center">
                <div className="w-12 h-12 rounded-full border-4 border-[#242532] border-t-[#56a69f] animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <button onClick={handleProcess} disabled={isLoading} className="mb-4 p-2 rounded bg-blue-500 text-white w-full">
                {isLoading ? t('recurring.processing') : t('recurring.process_now')}
            </button>

            {isEditing && (
                <div className="mb-4 p-3 bg-[#56a69f]/10 border border-[#56a69f]/20 rounded-lg">
                    <p className="text-[#56a69f] text-sm">
                        {t('recurring.editing_transaction')}
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input type="text" name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder={t('recurring.description_placeholder')} className="p-3 rounded bg-[#1F1E1D] text-white w-full" required />
                <div className="relative">
                    <input type="number" name="amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder={t('recurring.amount_placeholder')} className="p-3 pr-10 rounded bg-[#1F1E1D] text-white w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" required />
                    {/* Custom spinner arrows */}
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col gap-0.5">
                        <button
                            type="button"
                            onClick={() => setForm({...form, amount: ((parseFloat(form.amount) || 0) + 0.01).toFixed(2)})}
                            className="w-4 h-3 flex items-center justify-center text-[#C2C0B6] hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                            style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0 }}
                        >
                            <FaChevronUp className="w-3 h-3 text-[#C2C0B6] stroke-2" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm({...form, amount: Math.max(0, (parseFloat(form.amount) || 0) - 0.01).toFixed(2)})}
                            className="w-4 h-3 flex items-center justify-center text-[#C2C0B6] hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                            style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0 }}
                        >
                            <FaChevronDown className="w-3 h-3 text-[#C2C0B6] stroke-2" />
                        </button>
                    </div>
                </div>
                <select name="typeId" value={form.typeId} onChange={e => setForm({...form, typeId: e.target.value})} className="p-3 rounded bg-[#1F1E1D] text-white w-full" required>
                    <option 
                        value=""
                        style={{
                            minWidth: '250px',
                            width: 'max-content',
                            padding: '8px 12px',
                            backgroundColor: '#1F1E1D',
                            color: 'white'
                        }}
                    >
                        {t('recurring.select_type')}
                    </option>
                    {types.map(t => (
                        <option 
                            key={t.id} 
                            value={t.id}
                            style={{
                                minWidth: '250px',
                                width: 'max-content',
                                padding: '8px 12px',
                                backgroundColor: '#1F1E1D',
                                color: 'white'
                            }}
                        >
                            {t.name}
                        </option>
                    ))}
                </select>
                <select name="categoryId" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="p-3 rounded bg-[#1F1E1D] text-white w-full" required>
                    <option 
                        value=""
                        style={{
                            minWidth: '250px',
                            width: 'max-content',
                            padding: '8px 12px',
                            backgroundColor: '#1F1E1D',
                            color: 'white'
                        }}
                    >
                        {t('recurring.select_category')}
                    </option>
                    {categories.map(c => (
                        <option 
                            key={c.id} 
                            value={c.id}
                            style={{
                                minWidth: '250px',
                                width: 'max-content',
                                padding: '8px 12px',
                                backgroundColor: '#1F1E1D',
                                color: 'white'
                            }}
                        >
                            {c.name}
                        </option>
                    ))}
                </select>
                <select name="frequency" value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="p-3 rounded bg-[#1F1E1D] text-white w-full" required>
                    <option 
                        value="daily"
                        style={{
                            minWidth: '250px',
                            width: 'max-content',
                            padding: '8px 12px',
                            backgroundColor: '#1F1E1D',
                            color: 'white'
                        }}
                    >
                        {t('recurring.daily')}
                    </option>
                    <option 
                        value="weekly"
                        style={{
                            minWidth: '250px',
                            width: 'max-content',
                            padding: '8px 12px',
                            backgroundColor: '#1F1E1D',
                            color: 'white'
                        }}
                    >
                        {t('recurring.weekly')}
                    </option>
                    <option 
                        value="monthly"
                        style={{
                            minWidth: '250px',
                            width: 'max-content',
                            padding: '8px 12px',
                            backgroundColor: '#1F1E1D',
                            color: 'white'
                        }}
                    >
                        {t('recurring.monthly')}
                    </option>
                    <option 
                        value="yearly"
                        style={{
                            minWidth: '250px',
                            width: 'max-content',
                            padding: '8px 12px',
                            backgroundColor: '#1F1E1D',
                            color: 'white'
                        }}
                    >
                        {t('recurring.yearly')}
                    </option>
                </select>
                <input type="date" name="startDate" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="p-3 rounded bg-[#1F1E1D] text-white w-full" required />
                <input type="date" name="endDate" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="p-3 rounded bg-[#1F1E1D] text-white w-full" />
                <button type="submit" disabled={isLoading} className="p-3 rounded bg-green-500 text-white">
                    {isEditing ? t('recurring.update_button') : t('recurring.add_button')}
                </button>
                {isEditing && <button onClick={resetForm} className="p-3 rounded bg-gray-500 text-white">{t('recurring.cancel_button')}</button>}
            </form>

            {error && <p className="text-red-500">{error}</p>}

            {/* Recurring Transactions List */}
            <div className="mt-6">
                <h3 className="text-lg font-bold mb-3 text-[#56a69f]">Your Recurring Transactions</h3>
                {recurring.length === 0 ? (
                    <p className="text-[#C2C0B6] text-sm">No recurring transactions yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {recurring.map(item => (
                            <li key={item.id} className="flex justify-between items-center p-3 bg-[#1F1E1D] rounded-lg">
                                <div>
                                    <span className="font-bold text-white">{item.description}</span>
                                    <span className="text-sm text-[#C2C0B6] block">
                                        {item.frequency} - R$ {parseFloat(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-2 text-[#C2C0B6] hover:text-[#56a69f] hover:bg-[#56a69f]/10 rounded-lg transition-colors"
                                        title={t('recurring.edit')}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => _handleDelete(item.id)}
                                        className="p-2 text-[#C2C0B6] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title={t('recurring.delete')}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function BudgetsAndRecurring() {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <CardWrapper title={t('budgets.card_title')} accent="text-[#56a69f]">
                <Budget />
            </CardWrapper>
            <CardWrapper title={t('recurring.card_title')} accent="text-[#56a69f]">
                <RecurringTransactions />
            </CardWrapper>
        </div>
    );
}

export default BudgetsAndRecurring; 