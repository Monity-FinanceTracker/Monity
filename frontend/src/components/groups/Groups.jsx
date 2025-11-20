import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useTranslation } from 'react-i18next';
import { useGroups } from '../../hooks/useQueries';
import GroupInvitations from './GroupInvitations';
import GroupSpendingCard from './GroupSpendingCard';
import { EmptyGroups, LoadingState } from '../ui/EmptyStates';

const Groups = () => {
    const { t } = useTranslation();
    const { subscriptionTier } = useAuth();
    const { data: groups = [], isLoading: loading } = useGroups();

    const isLimited = useMemo(
        () => subscriptionTier === 'free' && groups.length >= 2,
        [subscriptionTier, groups.length]
    );

    return (
        <div className="flex-1 p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">{t('groups.title')}</h1>
                <div className="flex items-center gap-4">
                    {isLimited && (
                        <Link
                            to="/subscription"
                            className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                            {t('groups.upgrade_to_add')}
                        </Link>
                    )}
                    <Link
                        to="/groups/create"
                        className={`bg-[#56a69f] !text-[#1F1E1D] font-medium px-6 py-3 rounded-lg hover:bg-[#4A8F88] transition-colors ${isLimited ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => isLimited && e.preventDefault()}
                    >
                        {t('groups.create')}
                    </Link>
                </div>
            </div>

            {/* Group Invitations */}
            <GroupInvitations />

            {loading ? (
                <div className="bg-[#1F1E1D] rounded-lg border border-[#262626] overflow-hidden">
                    <LoadingState message={t('groups.loading')} />
                </div>
            ) : groups.length === 0 ? (
                <div className="bg-[#1F1E1D] rounded-lg border border-[#262626] overflow-hidden">
                    <EmptyGroups />
                </div>
            ) : (
                <div className="space-y-4">
                    {groups.map(group => (
                        <div 
                            key={group.id} 
                            className="bg-[#1F1E1D] rounded-lg border border-[#262626] p-6 hover:border-[#3a3a3a] transition-all duration-200"
                        >
                            <Link 
                                to={`/groups/${group.id}`} 
                                className="block"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="text-left">
                                        <h2 className="text-xl font-semibold text-white mb-1">{group.name}</h2>
                                        <p className="text-[#C2C0B6] text-sm">{t('groups.click_to_view')}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {group.totalSpent > 0 && (
                                            <div className="text-right">
                                                <div className="text-[#56a69f] font-bold text-lg">
                                                    R$ {group.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                </div>
                                                <div className="text-[#C2C0B6] text-xs">
                                                    {group.expenseCount} {t('groups.expenses_count')}
                                                </div>
                                            </div>
                                        )}
                                        <div className="w-8 h-8 bg-[#56a69f] rounded-full flex items-center justify-center">
                                            <span className="text-[#1F1E1D] font-bold text-sm">
                                                {group.memberCount || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            <GroupSpendingCard group={group} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Groups; 