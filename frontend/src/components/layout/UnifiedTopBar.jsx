import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { Icon } from '../../utils/iconMapping.jsx';
// LanguageSwitcher removed - now only available in settings

/**
 * Unified top navigation bar with Monity title, notifications, and user menu
 */
const UnifiedTopBar = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout, subscriptionTier } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-30 bg-[#262624] border-b border-[#262626] w-full">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4">
                {/* Left Section: Mobile menu + Monity Title */}
                <div className="flex items-center gap-4 flex-1">
                    {/* Mobile menu toggle */}
                    <button
                        onClick={onMobileMenuToggle}
                        className="md:hidden text-white hover:text-gray-300 transition-colors bg-transparent border-none p-0 m-0"
                        style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
                        aria-label={t('topbar.toggle_menu')}
                    >
                        {isMobileMenuOpen ? (
                            <Icon name="X" size="sm" className="text-white" />
                        ) : (
                            <Icon name="Menu" size="sm" className="text-white" />
                        )}
                    </button>
                </div>

                {/* Right Section: Notifications + PRO Badge + User Menu */}
                <div className="flex items-center gap-4">
                    {/* Free Plan Upgrade - Only for non-premium users */}
                    {subscriptionTier !== 'premium' && (
                        <button
                            onClick={() => navigate('/subscription')}
                            className="text-white hover:text-gray-300 transition-colors text-sm font-medium cursor-pointer bg-transparent border-none"
                            style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
                        >
                            Free Plan Upgrade
                        </button>
                    )}

                    {/* Notifications */}
                    <Bell className="w-4 h-4 text-white hover:text-gray-300 transition-colors cursor-pointer" strokeWidth={2.6} />

                    {/* PRO Badge - Only for premium users */}
                    {subscriptionTier === 'premium' && (
                        <div className="bg-gray-700 text-gray-300 px-2 py-0.75 rounded-full text-xs font-bold">
                            PRO
                        </div>
                    )}

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <div className={subscriptionTier === 'premium' ? 'premium-spinning-border' : ''}>
                            <div className="relative group">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        backgroundColor: '#56a69f',
                                        borderRadius: '50%',
                                        border: 'none',
                                        outline: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        zIndex: 2
                                    }}
                                    className="shadow-sm focus:ring-2 focus:ring-[#56a69f]/50"
                                >
                                <span style={{ 
                                    color: '#1F1E1D', 
                                    fontSize: '13px', 
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
                                
                                {/* Hover Tooltip */}
                                <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-[#1F1E1D] border border-[#262626] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                                    <div className="text-white text-sm text-left">
                                        <div className="font-medium">
                                            Monity Account
                                        </div>
                                        <div className="text-gray-300 text-xs">
                                            {user?.user_metadata?.name || 'User'}
                                        </div>
                                        <div className="text-gray-400 text-xs">
                                            {user?.email}
                                        </div>
                                    </div>
                                    {/* Tooltip arrow */}
                                    <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-[#262626]"></div>
                                </div>
                            </div>
                        </div>

                        {isUserMenuOpen && (
                            <div className="absolute right-0 top-full mt-3 w-56 sm:w-64 bg-[#1F1E1D] border border-[#262626] rounded-lg shadow-xl overflow-hidden z-50" key="user-dropdown">
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
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#152520'}
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
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#152520'}
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
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#152520'}
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