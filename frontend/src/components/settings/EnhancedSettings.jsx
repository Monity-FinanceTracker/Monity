import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../ui/NotificationSystem';
import { supabase } from '../../utils/supabase';
import LanguageSwitcher from '../navigation/LanguageSwitcher';

/**
 * Enhanced Settings Component with modern UI and comprehensive functionality
 * Includes: Profile, Security, Subscription, Preferences, Account Management
 */
const EnhancedSettings = () => {
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
        currency: 'USD'
    });
    const [isUpgrading, setIsUpgrading] = useState(false);
    
    // Load user preferences
    useEffect(() => {
        loadUserPreferences();
    }, []);

    const loadUserPreferences = async () => {
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
                    currency: 'USD',
                    language: 'en'
                };
                
                const { data: newData, error: insertError } = await supabase
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
    };

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
        } catch (error) {
            notifyError(t('subscription.upgrade_failed'));
        } finally {
            setIsUpgrading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: t('settings.profile'), icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> },
        { id: 'security', label: t('settings.security'), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
        { id: 'subscription', label: t('settings.subscription'), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
        { id: 'preferences', label: t('settings.preferences'), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { id: 'account', label: t('settings.account'), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">{t('settings.profile_info')}</h3>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            {t('settings.full_name')}
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full bg-[#191E29] border border-[#31344d] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                                            placeholder={t('settings.enter_name')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            {t('settings.email')}
                                        </label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            className="w-full bg-[#191E29] border border-[#31344d] text-gray-400 rounded-lg p-3 cursor-not-allowed"
                                            disabled
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{t('settings.email_readonly')}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        {t('settings.bio')}
                                    </label>
                                    <textarea
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                        className="w-full bg-[#191E29] border border-[#31344d] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                                        rows="3"
                                        placeholder={t('settings.enter_bio')}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#01C38D] text-white px-6 py-2 rounded-lg hover:bg-[#00b37e] transition-colors disabled:opacity-50"
                                >
                                    {loading ? t('settings.updating') : t('settings.update_profile')}
                                </button>
                            </form>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">{t('settings.change_password')}</h3>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        {t('settings.current_password')}
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="w-full bg-[#191E29] border border-[#31344d] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            {t('settings.new_password')}
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className="w-full bg-[#191E29] border border-[#31344d] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            {t('settings.confirm_password')}
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="w-full bg-[#191E29] border border-[#31344d] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#01C38D] focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#01C38D] text-white px-6 py-2 rounded-lg hover:bg-[#00b37e] transition-colors disabled:opacity-50"
                                >
                                    {loading ? t('settings.updating') : t('settings.change_password')}
                                </button>
                            </form>
                        </div>
                    </div>
                );

            case 'subscription':
                return (
                    <div className="space-y-6">
                        <div className="bg-[#2A2F3A] rounded-lg p-6 border border-[#31344d]">
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
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                </svg>
                                                Premium
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
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">{t('settings.general_preferences')}</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-[#2A2F3A] rounded-lg border border-[#31344d]">
                                    <div>
                                        <h4 className="text-white font-medium">{t('settings.language')}</h4>
                                        <p className="text-gray-400 text-sm">{t('settings.language_desc')}</p>
                                    </div>
                                    <LanguageSwitcher />
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-[#2A2F3A] rounded-lg border border-[#31344d]">
                                    <div>
                                        <h4 className="text-white font-medium">{t('settings.notifications')}</h4>
                                        <p className="text-gray-400 text-sm">{t('settings.notifications_desc')}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences.notifications}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#01C38D]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#01C38D]"></div>
                                    </label>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-[#2A2F3A] rounded-lg border border-[#31344d]">
                                    <div>
                                        <h4 className="text-white font-medium">{t('settings.email_updates')}</h4>
                                        <p className="text-gray-400 text-sm">{t('settings.email_updates_desc')}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences.emailUpdates}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, emailUpdates: e.target.checked }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#01C38D]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#01C38D]"></div>
                                    </label>
                                </div>
                                
                                <button
                                    onClick={handlePreferencesUpdate}
                                    disabled={loading}
                                    className="bg-[#01C38D] text-white px-6 py-2 rounded-lg hover:bg-[#00b37e] transition-colors disabled:opacity-50"
                                >
                                    {loading ? t('settings.updating') : t('settings.save_preferences')}
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'account':
                return (
                    <div className="space-y-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-red-800 mb-4">{t('settings.danger_zone')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-red-700 font-medium mb-2">{t('settings.export_data')}</h4>
                                    <p className="text-red-600 text-sm mb-3">{t('settings.export_data_desc')}</p>
                                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                        {t('settings.export_button')}
                                    </button>
                                </div>
                                
                                <hr className="border-red-200" />
                                
                                <div>
                                    <h4 className="text-red-700 font-medium mb-2">{t('settings.delete_account')}</h4>
                                    <p className="text-red-600 text-sm mb-3">{t('settings.delete_account_desc')}</p>
                                    <button className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors">
                                        {t('settings.delete_button')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{t('settings.title')}</h1>
                <p className="text-gray-400">{t('settings.subtitle')}</p>
            </div>

            <div className="bg-[#24293A] rounded-lg border border-[#31344d] overflow-hidden">
                {/* Tab Navigation */}
                <div className="border-b border-[#31344d]">
                    <nav className="flex space-x-8 px-6" aria-label="Settings tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-[#01C38D] text-[#01C38D]'
                                        : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default EnhancedSettings; 