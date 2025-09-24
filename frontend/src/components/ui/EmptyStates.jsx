import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    Home, Play, RotateCcw, MessageCircle, Search, Plus, 
    Upload, RefreshCw, Bot, BookOpen, TrendingUp, DollarSign 
} from 'lucide-react';
import { Icon } from '../../utils/iconMapping.jsx';

/**
 * Reusable empty state components for better UX when there's no data
 */

const EmptyStateBase = ({ 
    icon, 
    title, 
    description, 
    actions = [], 
    illustration,
    className = '' 
}) => {
    return (
        <div className={`text-center py-12 px-6 ${className}`}>
            {/* Illustration or Icon */}
            <div className="mb-6">
                {illustration ? (
                    <div className="w-32 h-32 mx-auto mb-4">
                        {illustration}
                    </div>
                ) : (
                    <div className="text-6xl mb-4">
                        {icon}
                    </div>
                )}
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-white mb-2">
                {title}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {description}
            </p>

            {/* Actions */}
            {actions.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {actions.map((action, index) => {
                        const baseClasses = "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 justify-center";
                        const primaryClasses = "bg-[#01C38D] text-[#191E29] hover:bg-[#01A071] hover:scale-105";
                        const secondaryClasses = "bg-[#171717] text-white hover:bg-[#262626] border border-[#262626]";

                        const Component = action.href ? Link : 'button';
                        const linkProps = action.href ? { to: action.href } : { onClick: action.onClick };

                        return (
                            <Component
                                key={index}
                                {...linkProps}
                                className={`${baseClasses} ${action.primary ? primaryClasses : secondaryClasses}`}
                            >
                                {action.icon && <span>{action.icon}</span>}
                                {action.label}
                            </Component>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Specific empty states for different scenarios
export const EmptyTransactions = () => {
    const { t } = useTranslation();
    
    return (
        <EmptyStateBase
            icon={<svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            title={t('emptyStates.transactions.title')}
            description={t('emptyStates.transactions.description')}
            actions={[
                {
                    label: t('emptyStates.transactions.add_expense'),
                    href: '/add-expense',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>,
                    primary: true
                },
                {
                    label: t('emptyStates.transactions.add_income'),
                    href: '/add-income',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
                }
            ]}
        />
    );
};

export const EmptyExpenses = () => {
    const { t } = useTranslation();
    
    return (
        <EmptyStateBase
            icon={<svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
            title={t('emptyStates.expenses.title')}
            description={t('emptyStates.expenses.description')}
            actions={[
                {
                    label: t('emptyStates.expenses.add_first'),
                    href: '/add-expense',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
                    primary: true
                },
                {
                    label: t('emptyStates.expenses.import_csv'),
                    onClick: () => {/* Import CSV logic */},
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                }
            ]}
        />
    );
};

export const EmptyIncome = () => {
    const { t } = useTranslation();
    
    return (
        <EmptyStateBase
            icon={<svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
            title={t('emptyStates.income.title')}
            description={t('emptyStates.income.description')}
            actions={[
                {
                    label: t('emptyStates.income.add_first'),
                    href: '/add-income',
                    icon: <Plus className="w-4 h-4" />,
                    primary: true
                },
                {
                    label: t('emptyStates.income.setup_recurring'),
                    href: '/budgets',
                    icon: <RefreshCw className="w-4 h-4" />
                }
            ]}
        />
    );
};

export const EmptyCategories = () => {
    const { t } = useTranslation();
    
    return (
        <EmptyStateBase
            icon={<svg className="w-16 h-16 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
            title={t('emptyStates.categories.title')}
            description={t('emptyStates.categories.description')}
            actions={[
                {
                    label: t('emptyStates.categories.use_ai'),
                    onClick: () => {/* Enable AI categorization */},
                    icon: <Bot className="w-4 h-4" />
                }
            ]}
        />
    );
};

export const EmptyGroups = () => {
    const { t } = useTranslation();
    
    return (
        <EmptyStateBase
            icon={<Icon name="Users" size="xxl" className="text-orange-400" />}
            title={t('emptyStates.groups.title')}
            description={t('emptyStates.groups.description')}
            actions={[
                {
                    label: t('emptyStates.groups.create_first'),
                    href: '/groups/create',
                    icon: <Plus className="w-4 h-4" />,
                    primary: true
                },
                {
                    label: t('emptyStates.groups.learn_more'),
                    onClick: () => {/* Show groups tutorial */},
                    icon: <BookOpen className="w-4 h-4" />
                }
            ]}
        />
    );
};

export const EmptyBudgets = () => {
    const { t } = useTranslation();
    
    return (
        <EmptyStateBase
            icon={<Icon name="Target" size="xxl" className="text-purple-400" />}
            title={t('emptyStates.budgets.title')}
            description={t('emptyStates.budgets.description')}
        />
    );
};

export const EmptySearchResults = ({ query }) => {
    const { t } = useTranslation();
    
    return (
        <EmptyStateBase
            icon={<Search className="w-16 h-16 text-muted-foreground" />}
            title={t('emptyStates.search.title')}
            description={t('emptyStates.search.description', { query })}
            actions={[
                {
                    label: t('emptyStates.search.clear_filters'),
                    onClick: () => {/* Clear filters */},
                    icon: <Icon name="RotateCcw" size="sm" />,
                    primary: true
                },
                {
                    label: t('emptyStates.search.browse_all'),
                    href: '/transactions',
                    icon: <Icon name="BarChart3" size="sm" />
                }
            ]}
        />
    );
};

export const EmptyDashboard = () => {
    const { t } = useTranslation();
    
    return (
        <EmptyStateBase
            icon={<Home className="w-16 h-16 text-muted-foreground" />}
            title={t('emptyStates.dashboard.title')}
            description={t('emptyStates.dashboard.description')}
            actions={[
                {
                    label: t('emptyStates.dashboard.add_expense'),
                    href: '/add-expense',
                    icon: <Icon name="CreditCard" size="sm" />,
                    primary: true
                },
                {
                    label: t('emptyStates.dashboard.add_income'),
                    href: '/add-income',
                    icon: <Icon name="TrendingUp" size="sm" />
                },
                {
                    label: t('emptyStates.dashboard.watch_tutorial'),
                    onClick: () => {/* Show tutorial */},
                    icon: <Play className="w-4 h-4" />
                }
            ]}
        />
    );
};

// Error states
export const ErrorState = ({ title, description, onRetry }) => {
    const { t } = useTranslation();
    
    return (
        <EmptyStateBase
            icon={<Icon name="AlertTriangle" size="xxl" className="text-yellow-400" />}
            title={title || t('errorStates.generic.title')}
            description={description || t('errorStates.generic.description')}
            actions={[
                {
                    label: t('errorStates.generic.retry'),
                    onClick: onRetry,
                    icon: <RotateCcw className="w-4 h-4" />,
                    primary: true
                },
                {
                    label: t('errorStates.generic.contact_support'),
                    href: '/settings',
                    icon: <MessageCircle className="w-4 h-4" />
                }
            ]}
            className="bg-red-500/5 border border-red-500/10 rounded-xl"
        />
    );
};

// Loading state with skeleton
export const LoadingState = ({ message }) => {
    const { t } = useTranslation();
    
    return (
        <div className="animate-pulse space-y-4 p-6">
            <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-[#262626] border-t-[#01C38D] animate-spin"></div>
            </div>
            <p className="text-center text-gray-400">
                {message || t('loadingStates.generic')}
            </p>
        </div>
    );
};

export default EmptyStateBase; 