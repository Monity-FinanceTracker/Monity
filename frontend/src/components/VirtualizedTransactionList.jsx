import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { useTranslation } from 'react-i18next';
import { get, del } from '../utils/api';
import formatDate from '../utils/formatDate';
import Spinner from './Spinner';

/**
 * Virtualized Transaction List Component
 * Efficiently handles large datasets with infinite scrolling and virtualization
 */
const VirtualizedTransactionList = React.memo(({ 
    transactionType = 'all',
    pageSize = 50,
    height = 600,
    itemHeight = 80 
}) => {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState([]);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({});
    
    const listRef = useRef();
    const loaderRef = useRef();
    
    // Current page for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Calculate total items to display
    const itemCount = hasNextPage ? transactions.length + 1 : transactions.length;

    // Check if an item is loaded
    const isItemLoaded = useCallback((index) => {
        return index < transactions.length;
    }, [transactions.length]);

    // Load more items
    const loadMoreItems = useCallback(async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage,
                pageSize,
                ...(searchQuery && { search: searchQuery }),
                ...(transactionType !== 'all' && { typeId: getTypeId(transactionType) }),
                ...filters
            });

            const response = await get(`/transactions?${queryParams}`);
            
            if (response.data) {
                const newTransactions = currentPage === 1 ? response.data : [...transactions, ...response.data];
                setTransactions(newTransactions);
                setTotalItems(response.pagination?.totalItems || 0);
                setHasNextPage(response.pagination?.hasMore || false);
                setCurrentPage(prev => prev + 1);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error loading transactions:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, searchQuery, transactionType, filters, isLoading, transactions]);

    // Initial load
    useEffect(() => {
        setTransactions([]);
        setCurrentPage(1);
        setHasNextPage(true);
        loadMoreItems();
    }, [searchQuery, transactionType, filters]);

    // Reset search and filters
    const handleSearchChange = useCallback((value) => {
        setSearchQuery(value);
        setTransactions([]);
        setCurrentPage(1);
        setHasNextPage(true);
    }, []);

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
        setTransactions([]);
        setCurrentPage(1);
        setHasNextPage(true);
    }, []);

    // Delete transaction
    const handleDelete = useCallback(async (transactionId) => {
        if (!window.confirm(t('transactions.confirm_delete'))) return;

        try {
            await del(`/transactions/${transactionId}`);
            setTransactions(prev => prev.filter(t => t.id !== transactionId));
            setTotalItems(prev => prev - 1);
        } catch (err) {
            console.error('Error deleting transaction:', err);
            alert(t('transactions.delete_error'));
        }
    }, [t]);

    // Helper function to get type ID
    const getTypeId = (type) => {
        switch (type) {
            case 'expense': return 1;
            case 'income': return 2;
            case 'savings': return 3;
            default: return null;
        }
    };

    // Memoized transaction row component
    const TransactionRow = React.memo(({ index, style }) => {
        const transaction = transactions[index];
        
        // Loading placeholder
        if (!transaction) {
            return (
                <div style={style} className="flex items-center justify-center p-4">
                    <div className="animate-pulse flex space-x-4 w-full">
                        <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        </div>
                        <div className="h-6 bg-gray-300 rounded w-20"></div>
                    </div>
                </div>
            );
        }

        const getTypeColor = (typeId) => {
            switch (typeId) {
                case 1: return 'text-red-400'; // Expense
                case 2: return 'text-green-400'; // Income
                case 3: return 'text-blue-400'; // Savings
                default: return 'text-gray-400';
            }
        };

        const getTypeIcon = (typeId) => {
            switch (typeId) {
                case 1: return '💸'; // Expense
                case 2: return '💰'; // Income
                case 3: return '🏦'; // Savings
                default: return '📄';
            }
        };

        return (
            <div style={style} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span className="text-2xl">{getTypeIcon(transaction.typeId)}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                                {transaction.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>{transaction.category}</span>
                                <span>{formatDate(transaction.date)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`font-bold text-lg ${getTypeColor(transaction.typeId)}`}>
                            {transaction.typeId === 1 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                        </span>
                        <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                            aria-label={t('transactions.delete')}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 012 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v3a1 1 0 11-2 0V9z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    });

    TransactionRow.displayName = 'TransactionRow';

    // Search and filter controls
    const SearchControls = React.memo(() => (
        <div className="mb-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder={t('transactions.search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={transactionType}
                        onChange={(e) => handleFilterChange({ ...filters, type: e.target.value })}
                        className="bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">{t('transactions.all_types')}</option>
                        <option value="expense">{t('transactions.expenses')}</option>
                        <option value="income">{t('transactions.income')}</option>
                        <option value="savings">{t('transactions.savings')}</option>
                    </select>
                </div>
            </div>
            
            {/* Stats display */}
            <div className="flex justify-between items-center text-sm text-gray-400">
                <span>
                    {transactions.length} of {totalItems} {t('transactions.items')}
                    {searchQuery && ` • ${t('transactions.filtered')}`}
                </span>
                {isLoading && (
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                        <span>{t('transactions.loading_more')}</span>
                    </div>
                )}
            </div>
        </div>
    ));

    SearchControls.displayName = 'SearchControls';

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-400 mb-4">{t('transactions.error')}: {error}</p>
                <button
                    onClick={() => {
                        setError(null);
                        setTransactions([]);
                        setCurrentPage(1);
                        loadMoreItems();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    {t('transactions.retry')}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
                {t('transactions.title')} 
                <span className="text-sm font-normal text-gray-400 ml-2">
                    ({totalItems} {t('transactions.total')})
                </span>
            </h2>
            
            <SearchControls />

            {transactions.length === 0 && !isLoading ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-gray-400 text-lg">
                        {searchQuery ? t('transactions.no_results') : t('transactions.no_transactions')}
                    </p>
                </div>
            ) : (
                <div className="border border-gray-700 rounded-lg overflow-hidden">
                    <InfiniteLoader
                        ref={loaderRef}
                        isItemLoaded={isItemLoaded}
                        itemCount={itemCount}
                        loadMoreItems={loadMoreItems}
                        threshold={5} // Load more when 5 items from the end
                    >
                        {({ onItemsRendered, ref }) => (
                            <List
                                ref={(list) => {
                                    ref(list);
                                    listRef.current = list;
                                }}
                                height={height}
                                itemCount={itemCount}
                                itemSize={itemHeight}
                                onItemsRendered={onItemsRendered}
                                overscanCount={5} // Render 5 extra items for smooth scrolling
                                className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                            >
                                {TransactionRow}
                            </List>
                        )}
                    </InfiniteLoader>
                </div>
            )}
        </div>
    );
});

VirtualizedTransactionList.displayName = 'VirtualizedTransactionList';

export default VirtualizedTransactionList; 