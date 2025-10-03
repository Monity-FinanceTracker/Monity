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
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa6';

function CardWrapper({ children, title, accent }) {
    return (
        <div className="flex-1 min-w-[250px] p-6 rounded-2xl shadow-lg border border-[#262626] bg-[#171717] flex flex-col items-center justify-center">
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
            <h3 className="text-xl font-bold mb-4 text-[#01C38D]">{t('budgets.set_new_budget')}</h3>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSetBudget} className="flex flex-col gap-4 mb-6">
                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="p-3 rounded bg-[#171717] text-white w-full"
                    required
                >
                    <option value="">{t('budgets.select_category')}</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <div className="relative">
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder={t('budgets.amount_placeholder')}
                        className="p-3 pr-10 rounded bg-[#171717] text-white w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        required
                    />
                    {/* Custom spinner arrows */}
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col gap-0.5">
                        <button
                            type="button"
                            onClick={() => setAmount(((parseFloat(amount) || 0) + 0.01).toFixed(2))}
                            className="w-4 h-3 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                            style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0 }}
                        >
                            <FaChevronUp className="w-3 h-3 text-gray-400 stroke-2" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setAmount(Math.max(0, (parseFloat(amount) || 0) - 0.01).toFixed(2))}
                            className="w-4 h-3 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                            style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0 }}
                        >
                            <FaChevronDown className="w-3 h-3 text-gray-400 stroke-2" />
                        </button>
                    </div>
                </div>
                <input 
                    type="month" 
                    value={month} 
                    onChange={(e) => setMonth(e.target.value)}
                    className="p-3 rounded bg-[#171717] text-white w-full"
                    required
                />
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="p-3 rounded bg-[#01C38D] text-white font-bold hover:bg-[#01A071] transition-colors w-full"
                >
                    {isLoading ? t('budgets.saving') : t('budgets.set_budget_button')}
                </button>
            </form>

            <h3 className="text-xl font-bold mb-4 text-[#01C38D]">{t('budgets.your_budgets')}</h3>
            {isLoading && budgets.length === 0 ? (
                 <div className="w-full h-40 flex justify-center items-center">
                    <div className="w-12 h-12 rounded-full border-4 border-[#242532] border-t-[#01C38D] animate-spin"></div>
                </div>
            ) : (
                <ul className="space-y-2">
                    {budgets.map(budget => (
                        <li key={budget.id} className="flex justify-between items-center p-3 bg-[#171717] rounded-lg">
                            <div>
                                <span className="font-bold">{budget.categories.name}</span>
                                <span className="text-sm text-gray-400 block">{new Date(budget.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="font-bold text-[#01C38D]">${parseFloat(budget.amount).toFixed(2)}</span>
                                <button onClick={() => handleDeleteBudget(budget.id)} className="text-red-500 hover:text-red-700">
                                    X
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
        } catch (err) {
            setError('Failed to fetch recurring transactions');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleProcess = async () => {
        setIsLoading(true);
        try {
            await processRecurringTransactions();
            alert(t('recurring.processing_complete'));
            fetchData(); // Refresh data
        } catch (err) {
            setError(t('recurring.processing_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isEditing) {
                await updateRecurringTransaction(isEditing, form);
            } else {
                await addRecurringTransaction(form);
            }
            resetForm();
            fetchData();
        } catch (err) {
            setError(t('recurring.save_error'));
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
    };
    
    const handleDelete = async (id) => {
        setIsLoading(true);
        try {
            await deleteRecurringTransaction(id);
            fetchData();
        } catch (err) {
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
                <div className="w-12 h-12 rounded-full border-4 border-[#242532] border-t-[#01C38D] animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <button onClick={handleProcess} disabled={isLoading} className="mb-4 p-2 rounded bg-blue-500 text-white w-full">
                {isLoading ? t('recurring.processing') : t('recurring.process_now')}
            </button>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input type="text" name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder={t('recurring.description_placeholder')} className="p-3 rounded bg-[#232323] text-white w-full" required />
                <div className="relative">
                    <input type="number" name="amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder={t('recurring.amount_placeholder')} className="p-3 pr-10 rounded bg-[#232323] text-white w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" required />
                    {/* Custom spinner arrows */}
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col gap-0.5">
                        <button
                            type="button"
                            onClick={() => setForm({...form, amount: ((parseFloat(form.amount) || 0) + 0.01).toFixed(2)})}
                            className="w-4 h-3 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                            style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0 }}
                        >
                            <FaChevronUp className="w-3 h-3 text-gray-400 stroke-2" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm({...form, amount: Math.max(0, (parseFloat(form.amount) || 0) - 0.01).toFixed(2)})}
                            className="w-4 h-3 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                            style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0 }}
                        >
                            <FaChevronDown className="w-3 h-3 text-gray-400 stroke-2" />
                        </button>
                    </div>
                </div>
                <select name="typeId" value={form.typeId} onChange={e => setForm({...form, typeId: e.target.value})} className="p-3 rounded bg-[#232323] text-white w-full" required>
                    <option value="">{t('recurring.select_type')}</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select name="categoryId" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="p-3 rounded bg-[#232323] text-white w-full" required>
                    <option value="">{t('recurring.select_category')}</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select name="frequency" value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="p-3 rounded bg-[#232323] text-white w-full" required>
                    <option value="daily">{t('recurring.daily')}</option>
                    <option value="weekly">{t('recurring.weekly')}</option>
                    <option value="monthly">{t('recurring.monthly')}</option>
                    <option value="yearly">{t('recurring.yearly')}</option>
                </select>
                <input type="date" name="startDate" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="p-3 rounded bg-[#232323] text-white w-full" required />
                <input type="date" name="endDate" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="p-3 rounded bg-[#232323] text-white w-full" />
                <button type="submit" disabled={isLoading} className="p-3 rounded bg-green-500 text-white">
                    {isEditing ? t('recurring.update_button') : t('recurring.add_button')}
                </button>
                {isEditing && <button onClick={resetForm} className="p-3 rounded bg-gray-500 text-white">{t('recurring.cancel_button')}</button>}
            </form>
            
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}

function BudgetsAndRecurring() {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <CardWrapper title={t('budgets.card_title')} accent="text-[#01C38D]">
                <Budget />
            </CardWrapper>
            <CardWrapper title={t('recurring.card_title')} accent="text-[#01C38D]">
                <RecurringTransactions />
            </CardWrapper>
        </div>
    );
}

export default BudgetsAndRecurring; 