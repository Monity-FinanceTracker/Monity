import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/useAuth';
import { useNotifications } from '../ui/notificationContext';
import { supabase } from '../../utils/supabase';
import LanguageSwitcher from '../navigation/LanguageSwitcher';
import CloseButton from '../ui/CloseButton';

/**
 * Enhanced Settings Component with modern UI and comprehensive functionality
 * Includes: Profile, Security, Subscription, Preferences, Account Management
 * Updated: Navigation buttons with green theme
 */
const EnhancedSettings = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, subscriptionTier, refreshSubscription, logout } = useAuth();
    const { success, error: notifyError } = useNotifications();
    
    // Form states
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.user_metadata?.name || '',
        email: user?.email || '',
        bio: user?.user_metadata?.bio || ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [preferences, setPreferences] = useState({
        notifications: true,
        emailUpdates: false,
        darkMode: true,
        currency: 'BRL'
    });
    const [isUpgrading, setIsUpgrading] = useState(false);

    const loadUserPreferences = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            if (data && !error) {
                setPreferences(prev => ({ ...prev, ...data }));
            } else if (error && error.code === 'PGRST116') {
                // No preferences found, create default ones
                const defaultPrefs = {
                    user_id: user.id,
                    notifications: true,
                    email_updates: false,
                    dark_mode: true,
                    currency: 'BRL',
                    language: 'pt'
                };
                
                const { error: insertError } = await supabase
                    .from('user_preferences')
                    .insert(defaultPrefs)
                    .single();
                    
                if (!insertError) {
                    setPreferences(prev => ({ ...prev, ...defaultPrefs }));
                }
            }
        } catch (err) {
            console.error('Error loading preferences:', err);
            // Continue with default preferences if table doesn't exist
        }
    }, [user.id]);
    
    // Load user preferences
    useEffect(() => {
        loadUserPreferences();
    }, [loadUserPreferences]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    name: profileData.name,
                    bio: profileData.bio
                }
            });
            
            if (error) throw error;
            success(t('settings.profile_updated'));
        } catch (err) {
            notifyError(err.message || t('settings.profile_update_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            notifyError(t('settings.passwords_dont_match'));
            setLoading(false);
            return;
        }
        
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });
            
            if (error) throw error;
            
            success(t('settings.password_updated'));
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            notifyError(err.message || t('settings.password_update_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handlePreferencesUpdate = async () => {
        setLoading(true);
        
        try {
            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: user.id,
                    ...preferences,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });
            
            if (error) throw error;
            success(t('settings.preferences_updated'));
        } catch (err) {
            console.error('Preferences update error:', err);
            notifyError(err.message || t('settings.preferences_update_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async () => {
        setIsUpgrading(true);
        try {
            // Simulate upgrade process
            await new Promise(resolve => setTimeout(resolve, 2000));
            await refreshSubscription();
            success(t('subscription.upgrade_successful'));
        } catch {
            notifyError(t('subscription.upgrade_failed'));
        } finally {
            setIsUpgrading(false);
        }
    };

    const categories = [
        { 
            id: 'profile', 
            label: t('settings.profile'), 
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> 
        },
        { 
            id: 'security', 
            label: t('settings.security'), 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        },
        { 
            id: 'preferences', 
            label: t('settings.preferences'), 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 
        },
        { 
            id: 'subscription', 
            label: t('settings.subscription'), 
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        },
        { 
            id: 'account', 
            label: t('settings.account'), 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> 
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-4">
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            {/* Name Setting Row */}
                            <div className="flex items-center justify-between py-3 border-b border-[#262626]">
                                <div className="flex-1">
                                    <h4 className="text-white text-sm font-medium">{t('settings.full_name')}</h4>
                                    <p className="text-gray-400 text-xs mt-0.5">{t('settings.enter_name')}</p>
                                </div>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-48 bg-[#262626] border border-[#333333] text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                                    placeholder="Your name"
                                />
                            </div>

                            {/* Email Setting Row (Read-only) */}
                            <div className="flex items-center justify-between py-3 border-b border-[#262626]">
                                <div className="flex-1">
                                    <h4 className="text-white text-sm font-medium">{t('settings.email')}</h4>
                                    <p className="text-gray-400 text-xs mt-0.5">{t('settings.email_readonly')}</p>
                                </div>
                                <div className="w-48 bg-[#1A1A1A] border border-[#262626] text-gray-500 text-sm rounded-lg px-3 py-1.5 cursor-not-allowed truncate">
                                    {profileData.email}
                                </div>
                            </div>

                            {/* Bio Setting Row */}
                            <div className="py-3 border-b border-[#262626]">
                                <h4 className="text-white text-sm font-medium mb-2">{t('settings.bio')}</h4>
                                <textarea
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                    className="w-full bg-[#262626] border border-[#333333] text-white text-sm rounded-lg p-3 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                                    rows="3"
                                    placeholder={t('settings.enter_bio')}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#01C38D] text-white px-6 py-2 text-sm rounded-lg hover:bg-[#00b37e] transition-colors disabled:opacity-50 mt-4"
                            >
                                {loading ? t('settings.updating') : t('settings.update_profile')}
                            </button>
                        </form>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-4">
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {/* Current Password */}
                            <div className="py-3 border-b border-[#262626]">
                                <label className="block text-white text-sm font-medium mb-2">
                                    {t('settings.current_password')}
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className="w-full bg-[#262626] border border-[#333333] text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {/* New Password */}
                            <div className="py-3 border-b border-[#262626]">
                                <label className="block text-white text-sm font-medium mb-2">
                                    {t('settings.new_password')}
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="w-full bg-[#262626] border border-[#333333] text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="py-3 border-b border-[#262626]">
                                <label className="block text-white text-sm font-medium mb-2">
                                    {t('settings.confirm_password')}
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="w-full bg-[#262626] border border-[#333333] text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#01C38D] text-white px-6 py-2 text-sm rounded-lg hover:bg-[#00b37e] transition-colors disabled:opacity-50 mt-4"
                            >
                                {loading ? t('settings.updating') : t('settings.change_password')}
                            </button>
                        </form>
                    </div>
                );

            case 'subscription':
                return (
                    <div className="space-y-6">
                        <div className="bg-[#262626] rounded-lg p-6 border border-[#262626]">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{t('subscription.current_plan')}</h3>
                                    <p className="text-gray-400">{t('subscription.manage_plan')}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        subscriptionTier === 'premium' 
                                            ? 'bg-yellow-100 text-yellow-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {subscriptionTier === 'premium' ? (
                                            <>
                                                <svg className="w-4 h-4 mr-1 text-black" fill="currentColor" viewBox="0 0 24 24" style={{color: '#000000'}}>
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                </svg>
                                                PREMIUM
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                                </svg>
                                                Free
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                            
                            {subscriptionTier === 'free' ? (
                                <div>
                                    <h4 className="text-white font-medium mb-3">{t('subscription.upgrade_benefits')}</h4>
                                    <ul className="space-y-2 text-gray-300 mb-6">
                                        <li className="flex items-center gap-2">
                                            <span className="text-[#01C38D]">✓</span>
                                            {t('subscription.unlimited_transactions')}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-[#01C38D]">✓</span>
                                            {t('subscription.advanced_analytics')}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-[#01C38D]">✓</span>
                                            {t('subscription.export_data')}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-[#01C38D]">✓</span>
                                            {t('subscription.priority_support')}
                                        </li>
                                    </ul>
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={isUpgrading}
                                        className="bg-gradient-to-r from-[#01C38D] to-[#00b37e] text-white px-6 py-3 rounded-lg hover:from-[#00b37e] hover:to-[#01C38D] transition-all disabled:opacity-50 font-medium"
                                    >
                                        {isUpgrading ? t('subscription.upgrading') : t('subscription.upgrade_now')}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-gray-300 mb-4">{t('subscription.premium_active')}</p>
                                    <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                        {t('subscription.cancel_subscription')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'preferences':
                return (
                    <div className="space-y-4">
                        {/* Language Setting */}
                        <div className="flex items-center justify-between py-3 border-b border-[#262626]">
                            <div className="flex-1">
                                <h4 className="text-white text-sm font-medium">{t('settings.language')}</h4>
                                <p className="text-gray-400 text-xs mt-0.5">{t('settings.language_desc')}</p>
                            </div>
                            <LanguageSwitcher />
                        </div>
                        
                        {/* Notifications Toggle */}
                        <div className="flex items-center justify-between py-3 border-b border-[#262626]">
                            <div className="flex-1">
                                <h4 className="text-white text-sm font-medium">{t('settings.notifications')}</h4>
                                <p className="text-gray-400 text-xs mt-0.5">{t('settings.notifications_desc')}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.notifications}
                                    onChange={(e) => {
                                        setPreferences(prev => ({ ...prev, notifications: e.target.checked }));
                                        handlePreferencesUpdate();
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#01C38D]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#01C38D]"></div>
                            </label>
                        </div>
                        
                        {/* Email Updates Toggle */}
                        <div className="flex items-center justify-between py-3 border-b border-[#262626]">
                            <div className="flex-1">
                                <h4 className="text-white text-sm font-medium">{t('settings.email_updates')}</h4>
                                <p className="text-gray-400 text-xs mt-0.5">{t('settings.email_updates_desc')}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.emailUpdates}
                                    onChange={(e) => {
                                        setPreferences(prev => ({ ...prev, emailUpdates: e.target.checked }));
                                        handlePreferencesUpdate();
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#01C38D]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#01C38D]"></div>
                            </label>
                        </div>
                        
                        {/* Dark Mode Toggle */}
                        <div className="flex items-center justify-between py-3 border-b border-[#262626]">
                            <div className="flex-1">
                                <h4 className="text-white text-sm font-medium">Dark Mode</h4>
                                <p className="text-gray-400 text-xs mt-0.5">Always enabled for optimal experience</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.darkMode}
                                    onChange={(e) => setPreferences(prev => ({ ...prev, darkMode: e.target.checked }))}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#01C38D]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#01C38D]"></div>
                            </label>
                        </div>
                    </div>
                );

            case 'account':
                return (
                    <div className="space-y-4">
                        {/* Export Data */}
                        <div className="py-3 border-b border-[#262626]">
                            <h4 className="text-white text-sm font-medium mb-1">{t('settings.export_data')}</h4>
                            <p className="text-gray-400 text-xs mb-3">{t('settings.export_data_desc')}</p>
                            <button className="text-white hover:text-[#01C38D] px-4 py-1.5 text-sm rounded-lg transition-colors">
                                {t('settings.export_button')}
                            </button>
                        </div>
                        
                        {/* Danger Zone */}
                        <div className="py-3 border-b border-red-900/30">
                            <h4 className="text-red-400 text-sm font-medium mb-1">{t('settings.delete_account')}</h4>
                            <p className="text-gray-400 text-xs mb-3">{t('settings.delete_account_desc')}</p>
                            <button className="text-red-400 hover:text-red-300 px-4 py-1.5 text-sm rounded-lg transition-colors">
                                {t('settings.delete_button')}
                            </button>
                        </div>

                        {/* Logout Button */}
                        <div className="py-3">
                            <button 
                                onClick={logout}
                                className="text-white hover:text-[#01C38D] px-4 py-2 text-sm rounded-lg transition-colors w-full"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const modalContent = (
        <>
            {/* Modal Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4"
                onClick={() => navigate(-1)}
            >
                {/* Modal Container */}
                <div 
                    className="w-full max-w-5xl bg-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in" 
                    style={{ maxHeight: '90vh', height: '700px' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    
                    {/* Left Sidebar */}
                    <div className="w-full md:w-64 bg-[#0F0F0F] border-r border-[#262626] overflow-y-auto">
                        {/* Header with Close Button */}
                        <div className="p-4 border-b border-[#262626] flex items-center">
                            <CloseButton onClick={() => navigate(-1)} />
                        </div>

                        {/* Category Navigation */}
                        <nav className="p-4 space-y-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveTab(category.id)}
                                    style={{
                                        backgroundColor: activeTab === category.id ? '#01C38D' : '#1A1A1A',
                                        color: activeTab === category.id ? '#FFFFFF' : '#9CA3AF'
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                        activeTab === category.id
                                            ? 'shadow-lg shadow-[#01C38D]/20'
                                            : 'hover:!bg-[#262626] hover:!text-white'
                                    }`}
                                >
                                    <span className="flex-shrink-0">{category.icon}</span>
                                    <span className="text-sm">{category.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6">
                            {/* Category Title */}
                            <h3 className="text-2xl font-bold text-white mb-6 capitalize">
                                {categories.find(c => c.id === activeTab)?.label}
                            </h3>

                            {/* Category Content */}
                            <div className="space-y-6">
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animation Styles */}
            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </>
    );

    // Render modal at document body level using Portal
    return createPortal(modalContent, document.body);
};

export default EnhancedSettings; 