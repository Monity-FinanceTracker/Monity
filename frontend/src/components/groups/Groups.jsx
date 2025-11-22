import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useTranslation } from 'react-i18next';
import { useGroups } from '../../hooks/useQueries';
import GroupInvitations from './GroupInvitations';
import GroupCard from './GroupCard';
import { EmptyGroups, LoadingState } from '../ui/EmptyStates';
import Dropdown from '../ui/Dropdown';

const Groups = () => {
    const { t } = useTranslation();
    const { subscriptionTier } = useAuth();
    const { data: groups = [], isLoading: loading } = useGroups();
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const isLimited = useMemo(
        () => subscriptionTier === 'free' && groups.length >= 2,
        [subscriptionTier, groups.length]
    );

    const sortedGroups = useMemo(() => {
        if (!groups.length) return [];

        const sorted = [...groups].sort((a, b) => {
            let compareA, compareB;

            switch (sortBy) {
                case 'name':
                    compareA = a.name?.toLowerCase() || '';
                    compareB = b.name?.toLowerCase() || '';
                    break;
                case 'members':
                    compareA = a.members?.length || 0;
                    compareB = b.members?.length || 0;
                    break;
                case 'total':
                    compareA = a.total_spent || 0;
                    compareB = b.total_spent || 0;
                    break;
                case 'activity':
                    compareA = new Date(a.updated_at || a.created_at).getTime();
                    compareB = new Date(b.updated_at || b.created_at).getTime();
                    break;
                default:
                    return 0;
            }

            if (typeof compareA === 'string') {
                return sortOrder === 'asc' 
                    ? compareA.localeCompare(compareB)
                    : compareB.localeCompare(compareA);
            }

            return sortOrder === 'asc' 
                ? compareA - compareB
                : compareB - compareA;
        });

        return sorted;
    }, [groups, sortBy, sortOrder]);

    return (
        <div className="flex-1 p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">{t('groups.title')}</h1>
                <div className="flex items-center gap-4 flex-shrink-0">
                    {!loading && groups.length > 0 && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-40 [&_button]:h-10 [&_button]:text-sm [&_button]:rounded-lg [&_button]:px-3 [&_button]:whitespace-nowrap">
                                <Dropdown
                                    value={sortBy}
                                    onChange={setSortBy}
                                    options={[
                                        { value: 'name', label: t('groups.sort_by_name') },
                                        { value: 'members', label: t('groups.sort_by_members') },
                                        { value: 'total', label: t('groups.sort_by_total') },
                                        { value: 'activity', label: t('groups.sort_by_activity') }
                                    ]}
                                    placeholder={t('groups.sort_by')}
                                    className="w-40"
                                />
                            </div>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="bg-[#262626] border border-[#262626] rounded-lg px-2.5 py-1.5 text-white hover:border-[#56a69f] transition-colors min-w-[40px] h-10 flex items-center justify-center text-sm"
                                title={sortOrder === 'asc' ? t('groups.sort_ascending') : t('groups.sort_descending')}
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    )}
                    {isLimited && (
                        <Link
                            to="/subscription"
                            className="bg-yellow-400 text-black font-bold px-5 py-2.5 rounded-lg hover:bg-yellow-500 transition-colors text-sm"
                        >
                            {t('groups.upgrade_to_add')}
                        </Link>
                    )}
                    <Link
                        to="/groups/create"
                        className={`bg-[#56a69f] !text-[#1F1E1D] font-medium px-5 py-2.5 rounded-lg hover:bg-[#4A8F88] transition-colors text-sm ${isLimited ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                    {sortedGroups.map(group => (
                        <GroupCard key={group.id} group={group} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Groups;
