
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGroups } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../utils/supabase';
import GroupInvitations from './GroupInvitations';
import GroupSpendingCard from './GroupSpendingCard';
import { EmptyGroups, LoadingState } from '../ui/EmptyStates';

const Groups = () => {
    const { t } = useTranslation();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, subscriptionTier } = useAuth();

    const fetchGroups = async () => {
        try {
            if (user) {
                const fetchedGroups = await getGroups();
                setGroups(fetchedGroups || []);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();

        // Set up real-time subscriptions
        if (user) {
            // Subscribe to group changes for groups the user is a member of
            const groupsSubscription = supabase
                .channel('groups-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'groups'
                    },
                    () => {
                        fetchGroups(); // Refresh groups when any group changes
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'group_members'
                    },
                    () => {
                        fetchGroups(); // Refresh when memberships change
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(groupsSubscription);
            };
        }
    }, [user]);

    const isLimited = subscriptionTier === 'free' && groups.length >= 2;

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
                        className={`bg-[#01C38D] text-[#191E29] font-bold px-6 py-3 rounded-lg hover:bg-[#00b37e] transition-colors ${isLimited ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => isLimited && e.preventDefault()}
                    >
                        {t('groups.create')}
                    </Link>
                </div>
            </div>

            {/* Group Invitations */}
            <GroupInvitations />

            <div className="bg-[#171717] rounded-lg border border-[#262626] overflow-hidden">
                {loading ? (
                    <LoadingState message={t('groups.loading')} />
                ) : groups.length === 0 ? (
                    <EmptyGroups />
                ) : (
                    <div className="divide-y divide-[#262626]">
                        {groups.map(group => (
                            <div key={group.id} className="p-6 hover:bg-[#171717] transition-colors duration-200">
                                <Link 
                                    to={`/groups/${group.id}`} 
                                    className="block"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-xl font-semibold text-white mb-1">{group.name}</h2>
                                            <p className="text-gray-400 text-sm">{t('groups.click_to_view')}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {group.totalSpent > 0 && (
                                                <div className="text-right">
                                                    <div className="text-[#01C38D] font-bold text-lg">
                                                        ${group.totalSpent.toFixed(0)}
                                                    </div>
                                                    <div className="text-gray-400 text-xs">
                                                        {group.expenseCount} {t('groups.expenses_count')}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="w-8 h-8 bg-[#01C38D] rounded-full flex items-center justify-center">
                                                <span className="text-[#191E29] font-bold text-sm">
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
        </div>
    );
};

export default Groups; 