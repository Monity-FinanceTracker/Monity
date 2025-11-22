import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/useAuth';

const SavingsOverviewCard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [savingsData, setSavingsData] = useState({
        totalAllocated: 0,
        totalTargets: 0,
        goals: [],
        progressPercentage: 0,
        totalGoals: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchSavingsOverview = async () => {
            try {
                setLoading(true);
                const response = await api.get('/balance/savings-overview');
                setSavingsData(response.data);
            } catch (error) {
                console.error('Error fetching savings overview:', error);
                setError('Failed to load savings data');
            } finally {
                setLoading(false);
            }
        };

        fetchSavingsOverview();
    }, [user]);

    if (loading) {
        return (
            <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6 hover:border-[#3a3a3a] transition-all duration-200">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="h-8 bg-gray-700 rounded w-1/2 mb-6"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-[#171717] border border-[#262626] rounded-xl p-6">
                <div className="text-center py-4">
                    <p className="text-gray-400">
                        {t('savings_goals.login_to_view', 'Faça login para ver o resumo das suas metas de poupança.')}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6 hover:border-[#3a3a3a] transition-all duration-200">
                <div className="text-center py-4">
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    if (savingsData.totalGoals === 0) {
        return (
            <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6 hover:border-[#3a3a3a] transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white">
                            {t('savings_goals.title')}
                        </h3>
                    <div className="w-8 h-8 bg-[#56a69f] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                </div>
                
                <div className="text-center py-8">
                    <div className="mb-4">
                        <svg className="w-16 h-16 text-[#56a69f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                    <p className="text-[#C2C0B6] mb-6 text-lg">
                        {t('savings_goals.no_goals_yet')}
                    </p>
                    <Link 
                        to="/savings-goals" 
                        className="inline-flex items-center px-6 py-3 bg-[#56a69f] text-white rounded-lg hover:bg-[#4A8F88] transition-colors font-semibold"
                    >
                        {t('savings_goals.create_first_goal')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6 hover:border-[#3a3a3a] transition-all duration-200">
            {/* Title */}
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#C2C0B6] text-left">
                    {t('savings_goals.title')}
                </h3>
            </div>

            {/* Current vs Target Amount */}
            <div className="mb-6">
                <div className="flex justify-between items-baseline mb-3">
                    <div>
                        <span className="text-sm text-[#C2C0B6] block mb-1">
                            {t('savings_goals.current_amount')}
                        </span>
                        <span className="text-3xl font-bold text-white">
                            ${savingsData.totalAllocated.toLocaleString()}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-[#C2C0B6] block mb-1">
                            {t('savings_goals.target_amount')}
                        </span>
                        <span className="text-3xl font-bold text-[#56a69f]">
                            ${savingsData.totalTargets.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Single Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-[#C2C0B6] mb-2">
                    <span>{t('savings_goals.overall_progress')}</span>
                    <span className="font-bold text-[#56a69f]">{savingsData.progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#232323] rounded-full h-4">
                    <div 
                        className="bg-[#56a69f] h-4 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${Math.min(savingsData.progressPercentage, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Footer with link to full savings page */}
            <div className="pt-4 border-t border-[#262626] text-center">
                <Link 
                    to="/savings-goals" 
                    className="inline-flex items-center justify-center text-sm text-[#56a69f] hover:text-[#4a8f88] transition-colors font-medium"
                >
                    <span className="mr-2">
                        {savingsData.totalGoals > 1 
                            ? t('savings_goals.view_all_goals', { count: savingsData.totalGoals })
                            : t('savings_goals.manage_goals')
                        }
                    </span>
                    <span>→</span>
                </Link>
            </div>
        </div>
    );
};

export default SavingsOverviewCard;
