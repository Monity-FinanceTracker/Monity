import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Bell, Sparkles } from 'lucide-react';
import { Icon } from '../../utils/iconMapping.jsx';
// LanguageSwitcher removed - now only available in settings

/**
 * Unified top navigation bar with breadcrumbs, search, and user menu
 * Replaces the inconsistent navigation systems
 */
const UnifiedTopBar = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, subscriptionTier } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const userMenuRef = useRef(null);
    const searchRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Quick navigation suggestions based on search
    const getQuickActions = (query) => {
        const lowerQuery = query.toLowerCase();
        const actions = [
            { path: '/add-expense', label: t('quickActions.add_expense'), icon: <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>, keywords: ['expense', 'despesa', 'add', 'new', 'criar'] },
            { path: '/add-income', label: t('quickActions.add_income'), icon: <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, keywords: ['income', 'receita', 'salary', 'salario'] },
            { path: '/transactions', label: t('quickActions.view_transactions'), icon: <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, keywords: ['transaction', 'history', 'historico'] },
            { path: '/budgets', label: t('quickActions.manage_budgets'), icon: <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, keywords: ['budget', 'orcamento', 'limit'] },
            { path: '/groups', label: t('quickActions.view_groups'), icon: <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, keywords: ['group', 'grupo', 'split', 'shared'] },
            { path: '/categories', label: t('quickActions.manage_categories'), icon: <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>, keywords: ['category', 'categoria', 'organize'] },
            { path: '/settings', label: t('quickActions.settings'), icon: <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, keywords: ['settings', 'configuracoes', 'profile'] },
        ];

        if (!query) return actions.slice(0, 4); // Show top 4 when no search

        return actions.filter(action => 
            action.keywords.some(keyword => keyword.includes(lowerQuery)) ||
            action.label.toLowerCase().includes(lowerQuery)
        ).slice(0, 6);
    };

    // Generate breadcrumbs from current path
    const getBreadcrumbs = () => {
        const pathMap = {
            '/': t('sidebar.dashboard'),
            '/transactions': t('sidebar.transactions'),
            '/add-expense': t('addExpense.title'),
            '/add-income': t('addIncome.title'),
            '/groups': t('sidebar.groups'),
            '/categories': t('sidebar.categories'),
            '/budgets': t('sidebar.budgets'),
            '/settings': t('sidebar.settings'),
            '/premium': t('sidebar.premium'),
            '/subscription': t('sidebar.subscription'),
            '/admin': t('sidebar.admin_dashboard'),
            '/savings-goals': t('sidebar.savings_goals'),
        };

        const segments = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ path: '/', label: t('sidebar.dashboard') }];

        let currentPath = '';
        segments.forEach(segment => {
            currentPath += `/${segment}`;
            const label = pathMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
            breadcrumbs.push({ path: currentPath, label });
        });

        return breadcrumbs;
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleQuickActionSelect = (path) => {
        navigate(path);
        setIsSearchOpen(false);
        setSearchQuery('');
    };

    const breadcrumbs = getBreadcrumbs();
    const quickActions = getQuickActions(searchQuery);

    return (
        <header className="sticky top-0 z-30 bg-[#0A0A0A] border-b border-[#262626] w-full">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left Section: Mobile menu + Search */}
                <div className="flex items-center gap-4 flex-1">
                    {/* Mobile menu toggle */}
                    <button
                        onClick={onMobileMenuToggle}
                        className="md:hidden text-white hover:text-gray-300 transition-colors bg-transparent border-none p-0 m-0"
                        style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
                        aria-label={t('topbar.toggle_menu')}
                    >
                        {isMobileMenuOpen ? (
                            <Icon name="X" size="md" className="text-white" />
                        ) : (
                            <Icon name="Menu" size="md" className="text-white" />
                        )}
                    </button>

                    {/* Search - moved to left */}
                    <div className="flex-1 max-w-lg relative" ref={searchRef}>
                    <div className="relative">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="w-full rounded-lg px-4 py-2.5 text-left transition-all duration-200 focus:outline-none hover:bg-[#171717]"
                            style={{
                                backgroundColor: '#262626',
                                border: '1px solid #262626',
                                color: '#9ca3af',
                                fontSize: '14px',
                                fontWeight: '400'
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <Icon name="Search" size="md" className="text-gray-400" />
                                <span className="hidden sm:inline text-gray-400">{t('topbar.quick_search')}</span>
                            </div>
                        </button>

                        {isSearchOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl overflow-hidden z-50" style={{ backgroundColor: '#171717', border: '1px solid #262626' }}>
                                <div className="max-h-64 overflow-y-auto" style={{ backgroundColor: '#171717' }}>
                                    {quickActions.map((action, index) => (
                                        <button
                                            key={action.path}
                                            onClick={() => handleQuickActionSelect(action.path)}
                                            className="w-full text-left px-4 py-3 transition-all duration-200 group hover:bg-[#171717]"
                                            style={{
                                                backgroundColor: 'transparent',
                                                borderBottom: index < quickActions.length - 1 ? '1px solid #262626' : 'none',
                                                color: '#9ca3af',
                                                border: 'none',
                                                fontSize: '14px',
                                                fontWeight: '400'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{action.icon}</span>
                                                <span className="font-medium group-hover:text-white transition-colors duration-200">{action.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    </div>
                </div>

                {/* Right Section: Notifications + PRO Badge + User Menu */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <Bell className="w-5 h-5 text-white hover:text-gray-300 transition-colors cursor-pointer" />

                    {/* PRO Badge - Only for premium users */}
                    {subscriptionTier === 'premium' && (
                        <div className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
                            PRO
                        </div>
                    )}

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <div className={`p-0.5 rounded-full ${subscriptionTier === 'premium' ? 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500' : ''}`}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: '#01C38D',
                                    borderRadius: '50%',
                                    border: 'none',
                                    outline: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#00A876'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#01C38D'}
                                className="shadow-sm focus:ring-2 focus:ring-[#01C38D]/50"
                            >
                            <span style={{ 
                                color: '#191E29', 
                                fontSize: '14px', 
                                fontWeight: 'bold',
                                userSelect: 'none'
                            }}>
                                {user?.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>
                                )}
                            </span>
                            </button>
                        </div>

                        {isUserMenuOpen && (
                            <div className="absolute right-0 top-full mt-3 w-56 bg-[#171717] border border-[#262626] rounded-lg shadow-xl overflow-hidden z-50" key="user-dropdown">
                                {/* User Info Header */}
                                <div className="px-3 py-3 border-b border-[#262626]">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium text-white leading-none text-left">
                                            {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-gray-400 leading-none">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Menu Items - Updated with white text */}
                                <div className="py-1">
                                    <button
                                        className="flex items-center gap-3 w-full px-3 py-2 text-sm transition-all duration-200 text-left rounded-none"
                                        style={{ 
                                            backgroundColor: 'transparent', 
                                            border: 'none',
                                            color: '#ffffff !important',
                                            padding: '0.5rem 0.75rem',
                                            margin: '0',
                                            textAlign: 'left',
                                            borderRadius: '0'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#31344d'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            // TODO: Navigate to profile when profile page is implemented
                                            console.log('Profile clicked - not implemented yet');
                                        }}
                                    >
                                        <Icon name="User" size="sm" className="text-white" />
                                        <span style={{ color: '#ffffff' }}>Profile</span>
                                    </button>
                                    
                                    <Link
                                        to="/settings"
                                        className="flex items-center gap-3 w-full px-3 py-2 text-sm transition-all duration-200 rounded-none"
                                        style={{ 
                                            color: '#ffffff',
                                            textDecoration: 'none',
                                            backgroundColor: 'transparent',
                                            borderRadius: '0'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#31344d'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <Icon name="Settings" size="sm" className="text-white" />
                                        <span style={{ color: '#ffffff' }}>Settings</span>
                                    </Link>

                                    
                                    <hr className="border-[#262626] my-1" />
                                    
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-3 py-2 text-sm transition-all duration-200 text-left rounded-none"
                                        style={{ 
                                            backgroundColor: 'transparent', 
                                            border: 'none',
                                            color: '#ffffff',
                                            padding: '0.5rem 0.75rem',
                                            margin: '0',
                                            textAlign: 'left',
                                            borderRadius: '0'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#31344d'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <Icon name="LogOut" size="sm" className="text-white" />
                                        <span style={{ color: '#ffffff' }}>Log out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default UnifiedTopBar; 