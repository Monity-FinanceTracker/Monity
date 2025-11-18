import { useState, useEffect } from 'react';
import { post, get, remove } from '../../utils/api';
import { FaPlus, FaTrash, FaTag } from 'react-icons/fa6';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function AddCategory() {
    const { t } = useTranslation();
    const [categoryName, setCategoryName] = useState('');
    const [categoryType, setCategoryType] = useState('expense');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await get('/categories');
                setCategories(data);
            } catch {
                setError(t('addCategory.fetchError'));
            }
        };
        fetchCategories();
    }, [t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let categoryId;
        if(categoryType === 'expense'){
            categoryId = 1
        } else if(categoryType === 'income'){
            categoryId = 2
        }
        try {
            await post('/categories', { name: categoryName, typeId: categoryId });
            setSuccess(t('addCategory.addSuccess'));
            setCategoryName('');
            setError('');
            setCategoryType('expense');
            // Refresh categories list
            const { data } = await get('/categories');
            setCategories(data);
        } catch {
            setError(t('addCategory.addError'));
            setSuccess('');
        }
    };

    const handleDelete = async (id) => {
        try {
            await remove(`/categories/${id}`);
            setSuccess(t('addCategory.deleteSuccess'));
            // Refresh categories list
            const { data } = await get('/categories');
            setCategories(data);
        } catch {
            setError(t('addCategory.deleteError'));
            setSuccess('');
        }
    };

    return (
        <div className="min-h-screen bg-[#262624] p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#56a69f] to-[#00A876] rounded-2xl mb-4 shadow-lg">
                        <FaTag className="text-white text-2xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('addCategory.title')}</h1>
                    <p className="text-gray-400 text-lg">Organize your finances with custom categories</p>
                </div>

                {/* Add Category Form */}
                <div className="bg-gradient-to-r from-[#23263a] to-[#2a2f45] p-6 md:p-8 rounded-2xl shadow-2xl border border-[#262626]/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#56a69f]/20 rounded-lg flex items-center justify-center">
                            <FaPlus className="text-[#56a69f] text-lg" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Create New Category</h2>
                    </div>
                    
                    {/* Alert Messages */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="categoryName" className="block text-white font-medium text-sm uppercase tracking-wide">
                                    {t('addCategory.categoryNameLabel')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="categoryName"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        className="w-full bg-[#1F1E1D] border border-[#262626]/50 text-white rounded-xl p-4 pl-12 focus:ring-2 focus:ring-[#56a69f] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                        placeholder="e.g., Groceries, Salary, etc."
                                        required
                                    />
                                    <FaTag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="categoryType" className="block text-white font-medium text-sm uppercase tracking-wide">
                                    {t('addCategory.categoryTypeLabel')}
                                </label>
                                <div className="relative">
                                    <select
                                        id="categoryType"
                                        value={categoryType}
                                        onChange={(e) => setCategoryType(e.target.value)}
                                        className="w-full bg-[#1F1E1D] border border-[#262626] rounded-lg px-4 py-2.5 pr-10 text-white focus:ring-0 focus:ring-transparent appearance-none cursor-pointer"
                                    >
                                        <option 
                                            value="expense"
                                            style={{
                                                minWidth: '250px',
                                                width: 'max-content',
                                                padding: '8px 12px',
                                                backgroundColor: '#1F1E1D',
                                                color: 'white'
                                            }}
                                        >
                                            {t('addCategory.expenseOption')}
                                        </option>
                                        <option 
                                            value="income"
                                            style={{
                                                minWidth: '250px',
                                                width: 'max-content',
                                                padding: '8px 12px',
                                                backgroundColor: '#1F1E1D',
                                                color: 'white'
                                            }}
                                        >
                                            {t('addCategory.incomeOption')}
                                        </option>
                                    </select>
                                    {categoryType === 'expense' ? (
                                        <ArrowUp className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#FAF9F5]" />
                                    ) : (
                                        <ArrowDown className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#56a69f]" />
                                    )}
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg 
                                            className="w-4 h-4 text-gray-400" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                            style={{ transform: 'none' }}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#56a69f] to-[#00A876] text-white font-semibold py-4 rounded-xl hover:from-[#00A876] hover:to-[#56a69f] transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                        >
                            <FaPlus className="text-lg" />
                            {t('addCategory.addButton')}
                        </button>
                    </form>
                </div>

                {/* Categories List */}
                <div className="bg-gradient-to-r from-[#23263a] to-[#2a2f45] p-6 md:p-8 rounded-2xl shadow-2xl border border-[#262626]/50 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#56a69f]/20 rounded-lg flex items-center justify-center">
                            <FaTag className="text-[#56a69f]" />
                        </div>
                        {t('addCategory.yourCategories')}
                    </h3>
                    
                    {categories.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FaTag className="text-gray-500 text-2xl" />
                            </div>
                            <p className="text-gray-400 text-lg">No categories yet</p>
                            <p className="text-gray-500 text-sm">Create your first category above</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {categories.map(category => (
                                <div key={category.id} className="bg-[#1F1E1D]/60 backdrop-blur-sm border border-[#262626]/30 p-4 rounded-xl hover:bg-[#1F1E1D]/80 transition-all duration-200 group">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                category.typeId === 1 ? 'bg-[#FAF9F5]/20' : 'bg-[#56a69f]/20'
                                            }`}>
                                                {category.typeId === 1 ? (
                                                    <ArrowUp className="w-5 h-5 text-[#FAF9F5]" />
                                                ) : (
                                                    <ArrowDown className="w-5 h-5 text-[#56a69f]" />
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-white font-medium text-lg">{category.name}</span>
                                                <p className="text-gray-400 text-sm">
                                                    {category.typeId === 1 ? 'Expense Category' : 'Income Category'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            title="Delete category"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddCategory; 