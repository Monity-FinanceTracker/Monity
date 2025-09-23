import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../ui/NotificationSystem';
import { get, post, del } from '../../utils/api';
import { EmptyCategories, LoadingState } from '../ui/EmptyStates';
import { Plus, Search, X, Trash2 } from 'lucide-react';
import { iconMap, categoryIconOptions, getIcon } from '../../utils/iconMapping.jsx';

/**
 * Enhanced Categories Component with modern UI and improved functionality
 */
const EnhancedCategories = () => {
    const { t } = useTranslation();
    const { success, error: notifyError } = useNotifications();
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        typeId: 1,
        color: '#01C38D',
        icon: 'Package'
    });
    
    const categoryTypes = [
        { id: 'all', label: t('categories.all'), value: 'all' },
        { id: 1, label: t('categories.expense'), value: 'expense' },
        { id: 2, label: t('categories.income'), value: 'income' },
        { id: 3, label: t('categories.transfer'), value: 'transfer' }
    ];

    const colorOptions = [
        '#01C38D', '#EF4444', '#3B82F6', '#F59E0B', 
        '#8B5CF6', '#EC4899', '#10B981', '#F97316',
        '#6366F1', '#84CC16', '#06B6D4', '#EAB308'
    ];

    // Use centralized icon options
    const iconOptions = categoryIconOptions;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await get('/categories');
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            notifyError(t('categories.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        
        try {
            const { data } = await post('/categories', newCategory);
            setCategories(prev => [...prev, data]);
            setNewCategory({ name: '', typeId: 1, color: '#01C38D', icon: 'Package' });
            setShowAddForm(false);
            success(t('categories.add_success'));
        } catch (error) {
            notifyError(error.response?.data?.message || t('categories.add_error'));
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm(t('categories.delete_confirm'))) return;
        
        try {
            await del(`/categories/${id}`);
            setCategories(prev => prev.filter(cat => cat.id !== id));
            success(t('categories.delete_success'));
        } catch (error) {
            notifyError(error.response?.data?.message || t('categories.delete_error'));
        }
    };

    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || category.typeId === selectedType;
        return matchesSearch && matchesType;
    });

    const getTypeLabel = (typeId) => {
        const type = categoryTypes.find(t => t.id === typeId);
        return type ? type.label : '';
    };

    if (loading) {
        return <LoadingState message={t('categories.loading')} />;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t('categories.title')}</h1>
                    <p className="text-gray-400">{t('categories.subtitle')}</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 sm:mt-0 bg-[#01C38D] text-white px-6 py-3 rounded-lg hover:bg-[#00b37e] transition-colors flex items-center gap-2 font-medium"
                >
                    <Plus className="w-4 h-4" />
                    {t('categories.add_new')}
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-[#24293A] rounded-lg border border-[#31344d] p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('categories.search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#191E29] border border-[#31344d] text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className="w-full bg-[#191E29] border border-[#31344d] text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                        >
                            {categoryTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            {filteredCategories.length === 0 ? (
                searchQuery ? (
                    <div className="bg-[#24293A] rounded-lg border border-[#31344d] p-12 text-center">
                        <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-white text-lg font-medium mb-2">{t('categories.no_results')}</h3>
                        <p className="text-gray-400">{t('categories.no_results_desc')}</p>
                    </div>
                ) : (
                    <EmptyCategories />
                )
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map((category) => (
                        <div
                            key={category.id}
                            className="bg-[#24293A] rounded-lg border border-[#31344d] p-4 hover:border-[#01C38D]/30 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: category.color || '#01C38D' }}
                                    >
                                        {(() => {
                                            const IconComponent = getIcon(category.icon);
                                            return <IconComponent className="w-5 h-5 text-white" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">{category.name}</h3>
                                        <span className="text-xs px-2 py-1 rounded-full bg-[#31344d] text-gray-300">
                                            {getTypeLabel(category.typeId)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1"
                                    title={t('categories.delete')}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-gray-400 text-sm">
                                {t('categories.transaction_count', { count: category.transactionCount || 0 })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Category Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#24293A] rounded-lg border border-[#31344d] w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">{t('categories.add_new')}</h2>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    {t('categories.name')}
                                </label>
                                <input
                                    type="text"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-[#191E29] border border-[#31344d] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                                    placeholder={t('categories.name_placeholder')}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    {t('categories.type')}
                                </label>
                                <select
                                    value={newCategory.typeId}
                                    onChange={(e) => setNewCategory(prev => ({ ...prev, typeId: parseInt(e.target.value) }))}
                                    className="w-full bg-[#191E29] border border-[#31344d] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                                >
                                    {categoryTypes.slice(1).map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    {t('categories.icon')}
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {iconOptions.map((iconOption) => {
                                        const IconComponent = iconOption.icon;
                                        return (
                                            <button
                                                key={iconOption.name}
                                                type="button"
                                                onClick={() => setNewCategory(prev => ({ ...prev, icon: iconOption.name }))}
                                                className={`p-3 rounded-lg border transition-all flex items-center justify-center ${
                                                    newCategory.icon === iconOption.name 
                                                        ? 'border-[#01C38D] bg-[#01C38D]/20 text-[#01C38D]' 
                                                        : 'border-[#31344d] hover:border-[#01C38D]/50 text-gray-400 hover:text-white'
                                                }`}
                                                title={iconOption.label}
                                            >
                                                <IconComponent className="w-5 h-5" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    {t('categories.color')}
                                </label>
                                <div className="grid grid-cols-6 gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                                newCategory.color === color 
                                                    ? 'border-white' 
                                                    : 'border-transparent hover:border-gray-400'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    {t('categories.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#01C38D] text-white py-3 rounded-lg hover:bg-[#00b37e] transition-colors"
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

export default EnhancedCategories; 