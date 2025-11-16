import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../ui/notificationContext';
import { del } from '../../utils/api';
import { useCategories, useAddCategory } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import { EmptyCategories, LoadingState } from '../ui/EmptyStates';
import { Plus, Search, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Dropdown, CloseButton } from '../ui';

/**
 * Enhanced Categories Component with modern UI and improved functionality
 */
const EnhancedCategories = () => {
    const { t } = useTranslation();
    const { success, error: notifyError } = useNotifications();
    const queryClient = useQueryClient();
    
    // Use React Query hook for categories - automatically refetches when invalidated
    const { data: categories = [], isLoading: loading, error } = useCategories();
    const addCategoryMutation = useAddCategory();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        typeId: 1
    });
    
    const categoryTypes = [
        { id: 'all', label: t('categories.all'), value: 'all' },
        { id: 1, label: t('categories.expense'), value: 'expense' },
        { id: 2, label: t('categories.income'), value: 'income' }
    ];

    // Handle query errors
    useEffect(() => {
        if (error) {
            console.error('Error fetching categories:', error);
            notifyError(t('categories.fetch_error'));
        }
    }, [error, notifyError, t]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        
        try {
            await addCategoryMutation.mutateAsync(newCategory);
            setNewCategory({ name: '', typeId: 1 });
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
            // Invalidate categories query to refetch with updated data
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
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

    return (
        <div className="flex-1 p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">{t('categories.title')}</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-[#56A69f] !text-[#1F1E1D] px-6 py-3 rounded-lg hover:bg-[#4A8F88] transition-colors font-medium"
                >
                    {t('categories.add_new')}
                </button>
            </div>

            {loading ? (
                <LoadingState message={t('categories.loading')} />
            ) : (
                <>
                    {/* Search and Filter Bar */}
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={t('categories.search_placeholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-12 bg-[#1F1E1D] border border-[#262626] text-white rounded-xl pl-10 pr-4 text-base font-medium focus:ring-2 focus:ring-[#56A69f] focus:border-transparent transition-all"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <div className="sm:w-64">
                                <Dropdown
                                    value={selectedType}
                                    onChange={(value) => setSelectedType(value === 'all' ? 'all' : parseInt(value))}
                                    options={categoryTypes.map(type => ({
                                        value: type.id,
                                        label: type.label
                                    }))}
                                    placeholder={t('categories.all')}
                                />
                            </div>
                        </div>
                    </div>

            {/* Categories Grid */}
            {filteredCategories.length === 0 ? (
                searchQuery ? (
                    <div className="bg-[#171717] rounded-lg border border-[#262626] p-12 text-center">
                        <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-white text-lg font-medium mb-2">{t('categories.no_results')}</h3>
                        <p className="text-gray-400">{t('categories.no_results_desc')}</p>
                    </div>
                ) : (
                    <EmptyCategories />
                )
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map((category) => {
                        const isExpense = category.typeId === 1;
                        const ArrowIcon = isExpense ? ArrowUp : ArrowDown;
                        const iconColor = isExpense ? '#FAF9F5' : '#56A69f';
                        const bgClass = isExpense ? 'bg-[#FAF9F5]/20' : 'bg-[#56A69f]/20';
                        
                        return (
                            <div
                                key={category.id}
                                className="bg-[#171717] rounded-lg border border-[#262626] p-4 hover:border-[#56A69f]/30 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${bgClass}`}
                                        >
                                            <ArrowIcon className="w-5 h-5" style={{ color: iconColor }} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-white font-medium">{category.name}</h3>
                                            <span className="text-xs px-2 py-1 rounded-full bg-[#242532] text-gray-300">
                                                {getTypeLabel(category.typeId)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title={t('categories.delete')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-gray-400 text-sm">
                                    {t('categories.transaction_count', { count: category.transactionCount || 0 })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
                </>
            )}

            {/* Add Category Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-[#171717] rounded-lg border border-[#262626] w-full max-w-md sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] p-4 sm:p-6 my-2 sm:my-4 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">{t('categories.add_new')}</h2>
                            <CloseButton onClick={() => setShowAddForm(false)} />
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
                                    className="w-full bg-[#232323] border border-[#262626] text-white rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-[#56A69f] focus:border-transparent transition-all"
                                    placeholder={t('categories.name_placeholder')}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    {t('categories.type')}
                                </label>
                                <Dropdown
                                    value={newCategory.typeId}
                                    onChange={(value) => setNewCategory(prev => ({ ...prev, typeId: parseInt(value) }))}
                                    options={categoryTypes.slice(1).map(type => ({
                                        value: type.id,
                                        label: type.label
                                    }))}
                                    placeholder={t('categories.type')}
                                    bgColor="#232323"
                                    menuBgColor="#232323"
                                />
                            </div>

                            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 bg-gray-600 text-white py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                                >
                                    {t('categories.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#56A69f] text-white py-2 sm:py-3 rounded-lg hover:bg-[#4A8F88] transition-colors text-sm sm:text-base"
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