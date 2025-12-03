import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { optimizedGet, optimizedDel } from '../../utils/optimizedApi';
import { del } from '../../utils/api';
import { queryKeys } from '../../lib/queryClient';
import formatDate from '../../utils/formatDate';
import { formatCurrency, formatSimpleCurrency, getAmountColor } from '../../utils/currency';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Icon } from '../../utils/iconMapping.jsx';
import { useSearchDebounce } from '../../hooks/useDebounce';
import { monitorApiCall } from '../../utils/performanceMonitor';
import { TransactionSkeleton, Dropdown } from '../ui';
import { useCategories } from '../../hooks/useQueries';
import { useSmartUpgradePrompt } from '../premium/SmartUpgradePrompt';
import { useAuth } from '../../context/useAuth';

/**
 * Calcula tamanho da fonte baseado no comprimento do valor
 */
const getResponsiveFontSize = (value) => {
    const formattedValue = Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalLength = formattedValue.length + 4; // +4 para "R$ " ou "-R$ "
    
    if (totalLength <= 10) return 'text-lg sm:text-2xl';
    if (totalLength <= 15) return 'text-base sm:text-xl';
    if (totalLength <= 20) return 'text-sm sm:text-lg';
    return 'text-xs sm:text-base';
};

/**
 * Enhanced transaction list with advanced filtering, search, and bulk operations
 */
const ImprovedTransactionList = React.memo(({ transactionType = 'all' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { subscriptionTier } = useAuth();
    const { showPrompt } = useSmartUpgradePrompt();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Dropdown state
    const [isAddNewDropdownOpen, setIsAddNewDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // Filter and search states
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useSearchDebounce(searchQuery, 300);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [amountRange, setAmountRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    
    // UI states
    const [selectedTransactions, setSelectedTransactions] = useState(new Set());
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    // React Query for server state management
    const { 
        data: transactionsData = [], 
        isLoading: queryLoading, 
        error: queryError
    } = useQuery({
        queryKey: ['transactions', 'list', transactionType],
        queryFn: async () => {
            const startTime = performance.now();
            try {
                const response = await optimizedGet('/transactions');
                const endTime = performance.now();
                
                monitorApiCall('transactions-list', startTime, endTime, true);
                
                let transactionData = Array.isArray(response.data) ? response.data : [];
                
                // Filter by transaction type if specified
                if (transactionType === 'expenses') {
                    transactionData = transactionData.filter(t => t.typeId === 1);
                } else if (transactionType === 'income') {
                    transactionData = transactionData.filter(t => t.typeId === 2);
                } else if (transactionType === 'savings') {
                    transactionData = transactionData.filter(t => t.typeId === 3);
                }
                // If transactionType is 'all' or not specified, show all transactions including type 3
                
                return transactionData;
            } catch (err) {
                const endTime = performance.now();
                monitorApiCall('transactions-list', startTime, endTime, false);
                throw err;
            }
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch categories
    const { data: categoriesData = [] } = useCategories();

    // Prepare category options for dropdown
    const categoryOptions = useMemo(() => {
        const options = [{ value: '', label: t('transactions.all_categories') }];
        const uniqueCategories = [...new Set(categoriesData.map(cat => cat.name))];
        uniqueCategories.forEach(cat => {
            options.push({ value: cat, label: cat });
        });
        return options;
    }, [categoriesData, t]);

    // Update local state when query data changes
    useEffect(() => {
        setTransactions(transactionsData);
        setLoading(queryLoading);
        setError(queryError?.message || null);
    }, [transactionsData, queryLoading, queryError]);

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsAddNewDropdownOpen(false);
            }
        };

        if (isAddNewDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAddNewDropdownOpen]);

    // Transaction Limit Prompts - Show upgrade prompts at 10 and 50 transactions
    useEffect(() => {
        const checkTransactionLimits = async () => {
            // Only check for free tier users
            if (subscriptionTier !== 'free' || transactions.length === 0) return;

            // Get transactions from current month
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const currentMonthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
            });

            const monthlyCount = currentMonthTransactions.length;

            // Show prompt at 10 transactions (transaction_limit)
            if (monthlyCount >= 10 && monthlyCount < 50) {
                const hasSeenTransactionLimit = localStorage.getItem('monity_transaction_limit_prompted');
                if (!hasSeenTransactionLimit) {
                    await showPrompt('transaction_limit', {
                        transaction_count: monthlyCount,
                        source: 'transaction_list'
                    });
                    localStorage.setItem('monity_transaction_limit_prompted', 'true');
                }
            }

            // Show prompt at 50 transactions (high_transaction_volume)
            if (monthlyCount >= 50) {
                const hasSeenHighVolume = localStorage.getItem('monity_high_volume_prompted');
                if (!hasSeenHighVolume) {
                    await showPrompt('high_transaction_volume', {
                        total_transactions: monthlyCount,
                        source: 'transaction_list'
                    });
                    localStorage.setItem('monity_high_volume_prompted', 'true');
                }
            }
        };

        checkTransactionLimits();
    }, [transactions, subscriptionTier, showPrompt]);

    // Memoized filtering and search with debounced search
    const filteredAndSortedTransactions = useMemo(() => {
        let filtered = [...transactions];

        // Text search (using debounced query)
        if (debouncedSearchQuery) {
            const searchLower = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter(transaction =>
                transaction.description?.toLowerCase().includes(searchLower) ||
                transaction.category?.toLowerCase().includes(searchLower)
            );
        }

        // Category filter
        if (categoryFilter) {
            filtered = filtered.filter(transaction =>
                transaction.category === categoryFilter
            );
        }

        // Date range filter
        if (dateRange.start) {
            filtered = filtered.filter(transaction =>
                new Date(transaction.date) >= new Date(dateRange.start)
            );
        }
        if (dateRange.end) {
            filtered = filtered.filter(transaction =>
                new Date(transaction.date) <= new Date(dateRange.end)
            );
        }

        // Amount range filter
        if (amountRange.min) {
            filtered = filtered.filter(transaction =>
                parseFloat(transaction.amount) >= parseFloat(amountRange.min)
            );
        }
        if (amountRange.max) {
            filtered = filtered.filter(transaction =>
                parseFloat(transaction.amount) <= parseFloat(amountRange.max)
            );
        }

        // Optimized sorting
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'amount':
                    aValue = parseFloat(a.amount);
                    bValue = parseFloat(b.amount);
                    break;
                case 'category':
                    aValue = a.category?.toLowerCase() || '';
                    bValue = b.category?.toLowerCase() || '';
                    break;
                case 'description':
                    aValue = a.description?.toLowerCase() || '';
                    bValue = b.description?.toLowerCase() || '';
                    break;
                default: // date
                    aValue = new Date(a.date);
                    bValue = new Date(b.date);
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [transactions, debouncedSearchQuery, categoryFilter, dateRange, amountRange, sortBy, sortOrder]);

    const queryClient = useQueryClient();


    // Optimized delete mutation with React Query
    const _deleteTransactionMutation = useMutation({
        mutationFn: async (transactionId) => {
            const startTime = performance.now();
            try {
                await optimizedDel(`/transactions/${transactionId}`);
                const endTime = performance.now();
                monitorApiCall('delete-transaction', startTime, endTime, true);
            } catch (error) {
                const endTime = performance.now();
                monitorApiCall('delete-transaction', startTime, endTime, false);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate and refetch transactions
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
        onError: (error) => {
            console.error('Delete transaction error:', error);
        }
    });

    // Bulk operations
    const handleSelectAll = () => {
        if (selectedTransactions.size === filteredAndSortedTransactions.length) {
            setSelectedTransactions(new Set());
        } else {
            setSelectedTransactions(new Set(filteredAndSortedTransactions.map(t => t.id)));
        }
    };

    const handleSelectTransaction = (id) => {
        const newSelected = new Set(selectedTransactions);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedTransactions(newSelected);
    };

    const handleBulkDelete = async () => {
        if (selectedTransactions.size === 0) return;
        
        if (!window.confirm(t('transactions.confirm_bulk_delete', { count: selectedTransactions.size }))) return;

        try {
            await Promise.all(
                Array.from(selectedTransactions).map(id => del(`/transactions/${id}`))
            );
            
            setTransactions(prev => prev.filter(t => !selectedTransactions.has(t.id)));
            setSelectedTransactions(new Set());
            
            // Invalidate queries to refresh all related data
            await queryClient.invalidateQueries({ queryKey: ['transactions'] });
            await queryClient.invalidateQueries({ queryKey: ['balance'] });
            await queryClient.invalidateQueries({ queryKey: ['savings'] });
            await queryClient.invalidateQueries({ queryKey: ['budgets'] });
            await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        } catch (error) {
            console.error('Bulk delete failed:', error);
            alert(t('transactions.bulk_delete_failed'));
        }
    };

    // Helper function to check if a transaction is an allocation
    const isAllocationTransaction = (transaction) => {
        // Check if metadata has operation: 'allocate' or category is 'Savings Goal'
        if (transaction.metadata) {
            const metadata = typeof transaction.metadata === 'string' 
                ? JSON.parse(transaction.metadata) 
                : transaction.metadata;
            if (metadata?.operation === 'allocate') {
                return true;
            }
        }
        // Check if category indicates it's an allocation (positive amounts)
        if (transaction.category === 'Savings Goal' && parseFloat(transaction.amount) > 0) {
            return true;
        }
        return false;
    };

    // Helper function to check if a transaction is a withdrawal
    const isWithdrawalTransaction = (transaction) => {
        if (transaction.metadata) {
            const metadata = typeof transaction.metadata === 'string' 
                ? JSON.parse(transaction.metadata) 
                : transaction.metadata;
            if (metadata?.operation === 'withdraw') {
                return true;
            }
        }
        // Withdrawals have negative amounts
        if (transaction.category === 'Savings Goal' && parseFloat(transaction.amount) < 0) {
            return true;
        }
        return false;
    };

    // Helper function to check if a transaction is an investment transaction
    const isInvestmentTransaction = (transaction) => {
        // Check metadata for investment operations
        if (transaction.metadata) {
            const metadata = typeof transaction.metadata === 'string' 
                ? JSON.parse(transaction.metadata) 
                : transaction.metadata;
            if (metadata?.savings_behavior === 'investment' || metadata?.savings_behavior === 'divestment') {
                return true;
            }
        }
        // Check category names
        if (transaction.category === 'Make Investments' || transaction.category === 'Withdraw Investments') {
            return true;
        }
        return false;
    };

    // Calculate totals
    const totals = filteredAndSortedTransactions.reduce((acc, transaction) => {
        const amount = parseFloat(transaction.amount);
        if (transaction.typeId === 1) { // Expense
            acc.expenses += amount;
        } else if (transaction.typeId === 2) { // Income
            acc.income += amount;
        } else if (transaction.typeId === 3) { // Savings
            // Handle allocations and withdrawals separately
            if (isAllocationTransaction(transaction)) {
                // Allocations decrease available balance
                acc.allocations += amount;
            } else if (isWithdrawalTransaction(transaction)) {
                // Withdrawals increase available balance (negative amount)
                acc.withdrawals += amount;
            } else if (isInvestmentTransaction(transaction)) {
                // Both making and withdrawing investments reduce savings total
                acc.investments += Math.abs(amount);
            } else {
                // Regular savings deposits
                acc.savings += amount;
            }
        }
        return acc;
    }, { income: 0, expenses: 0, savings: 0, allocations: 0, withdrawals: 0, investments: 0 });

    // Net balance = income - expenses - allocations - withdrawals + savings
    // Withdrawals are negative amounts, so subtracting them adds the money back (matches backend logic: balance -= transaction.amount)
    // Allocations are positive and should be subtracted
    const balance = totals.income - totals.expenses - totals.allocations - totals.withdrawals + totals.savings;

    // Calculate total savings: regular savings + allocations - withdrawals
    const totalSavings = totals.savings + totals.allocations - totals.withdrawals - totals.investments;

    // Transaction card component - Responsive for different screen sizes
    const TransactionCard = ({ transaction, isSelected, onSelect }) => (
        <div className={`bg-[#1F1E1D] border border-[#262626] rounded-lg p-3 sm:p-4 hover:border-[#56a69f] transition-all duration-200 dynamic-list-item w-full max-w-full min-w-0 flex-shrink-0 ${isSelected ? 'ring-2 ring-[#56a69f]' : ''}`}>
            <div className="flex items-start sm:items-center justify-between gap-3 w-full max-w-full min-w-0">
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div className="relative cursor-pointer flex-shrink-0" onClick={() => onSelect(transaction.id)}>
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onSelect(transaction.id)}
                            className="sr-only"
                        />
                        <div className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
                            isSelected 
                                ? 'bg-[#56a69f] border-[#56a69f]' 
                                : 'border-gray-400 hover:border-[#56a69f] bg-transparent'
                        }`}>
                            {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        transaction.typeId === 1 ? 'bg-[#D97757]/20' :
                        transaction.typeId === 2 ? 'bg-[#56a69f]/20' :
                        'bg-[#A69F8E]/20'
                    }`}>
                        {transaction.typeId === 1 ? (
                            <ArrowUp className="w-5 h-5 text-[#D97757]" />
                        ) : transaction.typeId === 2 ? (
                            <ArrowDown className="w-5 h-5 text-[#56a69f]" />
                        ) : (
                            <ArrowDown className="w-5 h-5 text-[#A69F8E]" />
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-left">
                        <h4 className="text-white font-medium text-sm sm:text-base truncate text-left">{transaction.description}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#C2C0B6] text-left">
                            <span className="truncate">{transaction.category}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{formatDate(transaction.date)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className="text-right">
                        <div className={`font-bold text-base sm:text-lg ${getAmountColor(transaction.typeId)}`}>
                            {formatCurrency(transaction.amount, transaction.typeId)}
                        </div>
                    </div>
                    
                    <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-[#C2C0B6] hover:text-red-400 transition-colors p-1"
                        title={t('transactions.delete')}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );

    const handleDelete = async (transactionId) => {
        if (!window.confirm(t('transactions.confirm_delete'))) return;

        try {
            await del(`/transactions/${transactionId}`);
            setTransactions(prev => prev.filter(t => t.id !== transactionId));
        } catch (error) {
            console.error('Delete failed:', error);
            alert(t('transactions.delete_failed'));
        }
    };

    // Dropdown handlers
    const handleAddNewClick = () => {
        setIsAddNewDropdownOpen(!isAddNewDropdownOpen);
    };

    const handleAddIncome = () => {
        setIsAddNewDropdownOpen(false);
        navigate('/add-income');
    };

    const handleAddExpense = () => {
        setIsAddNewDropdownOpen(false);
        navigate('/add-expense');
    };


    if (loading) {
        return (
            <div className="flex flex-col space-y-4 sm:space-y-6 w-full max-w-full min-w-0">
                {/* Header skeleton - Mobile responsive */}
                <div className="bg-[#1F1E1D] rounded-xl p-4 sm:p-6 border border-[#262626]">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="text-center p-3 sm:p-4 bg-[#1a1a1a] rounded-lg">
                                <div className="h-6 sm:h-8 bg-[#262626]/50 rounded animate-pulse mb-2"></div>
                                <div className="h-3 sm:h-4 bg-[#262626]/30 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Search and filters skeleton - Mobile responsive */}
                <div className="bg-[#1F1E1D] rounded-xl p-4 sm:p-6 border border-[#262626]">
                    <div className="space-y-4">
                        <div className="h-12 bg-[#262626]/50 rounded-lg animate-pulse"></div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1 h-10 bg-[#262626]/50 rounded-lg animate-pulse"></div>
                            <div className="h-10 w-12 bg-[#262626]/50 rounded-lg animate-pulse"></div>
                            <div className="h-10 w-20 bg-[#262626]/50 rounded-lg animate-pulse"></div>
                    </div>
                    </div>
                </div>
                
                {/* Transactions skeleton */}
                <TransactionSkeleton count={8} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400">{t('transactions.error')}: {error}</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">{t('transactionsPage.title')}</h1>
            </div>
            <div className="flex flex-col space-y-4 sm:space-y-6 w-full max-w-full min-w-0">
            {/* Header with stats - Responsive for different screen sizes */}
            <div className="bg-[#1F1E1D] rounded-xl p-4 sm:p-6 border border-[#262626] w-full max-w-full min-w-0 flex-shrink-0">
                <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 w-full max-w-full min-w-0">
                    <div className="text-center p-3 sm:p-4 bg-[#1a1a1a] rounded-lg flex-1 min-w-[120px]">
                        <div className="text-lg sm:text-2xl font-bold text-white">{filteredAndSortedTransactions.length}</div>
                        <div className="text-[#C2C0B6] text-xs sm:text-sm">{t('transactions.total_transactions')}</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-[#1a1a1a] rounded-lg flex-1 min-w-[120px]">
                        <div className={`${getResponsiveFontSize(totals.income)} font-bold text-[#56a69f] whitespace-nowrap overflow-hidden`}>
                            R$ {totals.income.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[#C2C0B6] text-xs sm:text-sm">{t('transactions.total_income')}</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-[#1a1a1a] rounded-lg flex-1 min-w-[120px]">
                        <div className={`${getResponsiveFontSize(totals.expenses)} font-bold text-[#D97757] whitespace-nowrap overflow-hidden`}>
                            {formatSimpleCurrency(totals.expenses, true)}
                        </div>
                        <div className="text-[#C2C0B6] text-xs sm:text-sm">{t('transactions.total_expenses')}</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-[#1a1a1a] rounded-lg flex-1 min-w-[120px]">
                        <div className={`${getResponsiveFontSize(totalSavings)} font-bold whitespace-nowrap overflow-hidden ${totalSavings >= 0 ? 'text-[#A69F8E]' : 'text-orange-400'}`}>
                            {totalSavings >= 0 ? 'R$ ' : '-R$ '}{Math.abs(totalSavings).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[#C2C0B6] text-xs sm:text-sm">{t('transactions.total_savings')}</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-[#1a1a1a] rounded-lg flex-1 min-w-[120px]">
                        <div className={`${getResponsiveFontSize(balance)} font-bold whitespace-nowrap overflow-hidden ${balance >= 0 ? 'text-[#4A8F88]' : 'text-[#CD6040]'}`}>
                            {balance >= 0 ? 'R$ ' : '-R$ '}{Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[#C2C0B6] text-xs sm:text-sm">{t('transactions.net_balance')}</div>
                    </div>
                </div>
            </div>

            {/* Search and filters - Responsive for different screen sizes */}
            <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-4 w-full max-w-full min-w-0 flex-shrink-0">
                <div className="space-y-4">
                    {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('transactions.search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 bg-[#30302E] border-0 rounded-xl px-4 pl-10 text-[#C2C0B6] placeholder-[#C2C0B6] text-base font-medium focus:outline-none min-w-0 max-w-full"
                            />
                            <svg className="w-5 h-5 text-[#C2C0B6] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                    </div>

                    {/* Quick filters - Responsive for different screen sizes */}
                    <div className="flex flex-col md:flex-row gap-2 min-w-0 w-full max-w-full">
                        <div className="flex gap-2 flex-1 min-w-0 w-full max-w-full">
                        <Dropdown
                            value={sortBy}
                            onChange={setSortBy}
                            options={[
                                { value: 'date', label: t('transactions.sort_by_date') },
                                { value: 'amount', label: t('transactions.sort_by_amount') },
                                { value: 'category', label: t('transactions.sort_by_category') },
                                { value: 'description', label: t('transactions.sort_by_description') }
                            ]}
                            placeholder={t('transactions.sort_by_date')}
                                className="flex-1 md:w-40 min-w-0 max-w-full"
                        />

                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="bg-[#262626] border border-[#262626] rounded-lg px-3 py-2 text-white hover:border-[#56a69f] transition-colors min-w-[48px] flex-shrink-0"
                                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                        </div>

                        <button
                            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                            className="bg-[#262626] border border-[#262626] rounded-lg px-3 py-2 text-white hover:border-[#56a69f] transition-colors flex items-center justify-center gap-2 w-full md:w-auto flex-shrink-0"
                        >
                            <Icon name="Filter" size="sm" />
                            <span>{t('transactions.filters')}</span>
                        </button>
                    </div>
                </div>

                {/* Advanced filters panel - Mobile responsive */}
                {isFilterPanelOpen && (
                    <div className="mt-4 pt-4 border-t border-[#262626]">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[#C2C0B6] text-sm mb-2">{t('transactions.filter_category')}</label>
                                <Dropdown
                                    value={categoryFilter}
                                    onChange={setCategoryFilter}
                                    options={categoryOptions}
                                    placeholder={t('transactions.any_category')}
                                    className="w-full"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[#C2C0B6] text-sm mb-2">{t('transactions.date_range')}</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[#C2C0B6] text-xs mb-1">Initial Date</label>
                                        <input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                            className="w-full bg-[#30302E] border-0 rounded-lg px-3 py-2 text-[#C2C0B6] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#C2C0B6] text-xs mb-1">Final Date</label>
                                        <input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                            className="w-full bg-[#30302E] border-0 rounded-lg px-3 py-2 text-[#C2C0B6] focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[#C2C0B6] text-sm mb-2">{t('transactions.amount_range')}</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder={t('transactions.min_amount')}
                                        value={amountRange.min}
                                        onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                                        className="w-full bg-[#30302E] border-0 rounded-lg px-3 py-2 text-[#C2C0B6] placeholder-[#C2C0B6] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <input
                                        type="number"
                                        placeholder={t('transactions.max_amount')}
                                        value={amountRange.max}
                                        onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                                        className="w-full bg-[#30302E] border-0 rounded-lg px-3 py-2 text-[#C2C0B6] placeholder-[#C2C0B6] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk actions - Responsive for different screen sizes */}
            {selectedTransactions.size > 0 && (
                <div className="bg-[#56a69f]/10 border border-[#56a69f]/20 rounded-xl p-4 w-full max-w-full min-w-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full max-w-full min-w-0">
                        <span className="text-[#56a69f] font-medium">
                            {t('transactions.selected_count', { count: selectedTransactions.size })}
                        </span>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setSelectedTransactions(new Set())}
                                className="flex-1 sm:flex-none px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                            >
                                {t('transactions.clear_selection')}
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                {t('transactions.delete_selected')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction list */}
            <div className="flex flex-col space-y-4 dynamic-list w-full max-w-full min-w-0 flex-1">
                {/* Select All and Add New - Responsive for different screen sizes */}
                {filteredAndSortedTransactions.length > 0 && (
                    <div className="flex items-center justify-between gap-3 mb-4 min-w-0 w-full max-w-full flex-shrink-0">
                        <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={selectedTransactions.size === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0}
                                    onChange={handleSelectAll}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
                                    selectedTransactions.size === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0
                                        ? 'bg-[#56a69f] border-[#56a69f]' 
                                        : 'border-gray-400 hover:border-[#56a69f] bg-transparent'
                                }`}>
                                    {selectedTransactions.size === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0 && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-white text-sm whitespace-nowrap">{t('transactions.select_all')}</span>
                        </label>

                        {/* Add New Dropdown - Always visible */}
                        <div className="relative flex-shrink-0" ref={dropdownRef}>
                        <button
                            onClick={handleAddNewClick}
                            className="bg-[#56a69f] text-[#1F1E1D] px-3 py-2 rounded-lg font-medium hover:bg-[#4a8f88] transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                        >
                            <span>+ {t('transactions.add_new')}</span>
                            <svg 
                                className={`w-4 h-4 transition-transform ${isAddNewDropdownOpen ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        {isAddNewDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-[#1F1E1D] border border-[#262626] rounded-lg shadow-lg z-50">
                                <div className="py-2">
                                    <button
                                        onClick={handleAddIncome}
                                        className="w-full text-left px-4 py-3 hover:bg-[#56a69f]/20 transition-colors flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#56a69f] flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-[#1F1E1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-[#56a69f]">Income</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleAddExpense}
                                        className="w-full text-left px-4 py-3 hover:bg-[#D97757]/20 transition-colors flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#D97757] flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-[#1F1E1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-[#D97757]">Expense</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                )}

                {filteredAndSortedTransactions.length === 0 ? (
                    <div className="p-6 sm:p-12 text-center w-full max-w-full min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{t('transactions.no_transactions')}</h3>
                        <p className="text-[#C2C0B6] mb-6 text-sm sm:text-base">{t('transactions.no_transactions_desc')}</p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Link
                                to="/add-income"
                                className="px-3 py-2 rounded-lg font-medium hover:bg-[#56a69f]/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#56a69f] flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-[#1F1E1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <span className="text-[#56a69f] text-sm sm:text-base">Income</span>
                            </Link>
                            <Link
                                to="/add-expense"
                                className="px-3 py-2 rounded-lg font-medium hover:bg-[#D97757]/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#D97757] flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-[#1F1E1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <span className="text-[#D97757] text-sm sm:text-base">Expense</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    filteredAndSortedTransactions.map((transaction) => (
                        <TransactionCard
                            key={transaction.id}
                            transaction={transaction}
                            isSelected={selectedTransactions.has(transaction.id)}
                            onSelect={handleSelectTransaction}
                        />
                    ))
                )}
            </div>
            </div>
        </div>
    );
});

export default ImprovedTransactionList;