import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const SavingsOverviewCard = () => {
    const { t } = useTranslation();
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
        fetchSavingsOverview();
    }, []);

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

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="text-center py-4">
                    <p className="text-red-500 dark:text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    if (savingsData.totalGoals === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('savings_goals.title')}
                    </h3>
                    <div className="w-8 h-8 bg-[#01C38D] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">💰</span>
                    </div>
                </div>
                
                <div className="text-center py-8">
                    <div className="mb-4">
                        <span className="text-4xl">💰</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
                        {t('savings_goals.no_goals_yet')}
                    </p>
                    <Link 
                        to="/savings-goals" 
                        className="inline-flex items-center px-6 py-3 bg-[#01C38D] text-white rounded-lg hover:bg-[#01a87a] transition-colors font-semibold"
                    >
                        {t('savings_goals.create_first_goal')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('savings_goals.title')}
                </h3>
                <div className="w-8 h-8 bg-[#01C38D] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">💰</span>
                </div>
            </div>

            {/* Total allocated amount */}
            <div className="mb-4 text-center">
                <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white block">
                        ${savingsData.totalAllocated.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t('savings_goals.allocated')}
                    </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t('savings_goals.target')}: ${savingsData.totalTargets.toLocaleString()}
                </div>
            </div>

            {/* Overall progress bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span>{t('savings_goals.overall_progress')}</span>
                    <span className="font-semibold">{savingsData.progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                        className="bg-[#01C38D] h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(savingsData.progressPercentage, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Top 3 goals preview */}
            {savingsData.goals.length > 0 && (
                <div className="space-y-3 mb-4">
                    {savingsData.goals.map((goal) => (
                        <div key={goal.id} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {goal.goal_name}
                                </p>
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                        <div 
                                            className="bg-[#01C38D] h-1.5 rounded-full" 
                                            style={{ width: `${goal.progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {goal.progress.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                            <div className="ml-3 text-right">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    ${goal.current_amount.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    /${goal.target_amount.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer with link to full savings page */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <Link 
                    to="/savings-goals" 
                    className="inline-flex items-center justify-center text-sm text-[#01C38D] hover:text-[#01a87a] transition-colors font-medium"
                >
                    <span className="mr-2">
                        {savingsData.totalGoals > 3 
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
