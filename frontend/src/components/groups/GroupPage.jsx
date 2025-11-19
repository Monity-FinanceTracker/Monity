
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getGroupById, addGroupExpense, searchUsers, sendGroupInvitation, settleExpenseShare } from '../../utils/api';
import { useAuth } from '../../context/useAuth';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../utils/supabase';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa6';

const GroupPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [shares, setShares] = useState([]);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const { user } = useAuth();

    const fetchGroup = useCallback(async () => {
        try {
            setLoading(true);
            const fetchedGroup = await getGroupById(id);
            setGroup(fetchedGroup);
            // Initialize shares when group data is fetched
            if (fetchedGroup && fetchedGroup.group_members) {
                const initialShares = fetchedGroup.group_members.map(member => ({
                    user_id: member.profiles.id,
                    username: member.profiles.name,
                    amount_owed: ''
                }));
                setShares(initialShares);
            }
        } catch (err) {
            console.error('Error fetching group:', err);
            if (err.response?.status === 404) {
                setError('Group not found or you are not a member of this group.');
            } else {
                setError(t('groups.fetch_fail'));
            }
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        fetchGroup();
    }, [fetchGroup]);

    useEffect(() => {
        // Set up real-time subscriptions for this group
        if (user) {
            const groupSubscription = supabase
                .channel(`group-${id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'group_members',
                        filter: `group_id=eq.${id}`
                    },
                    () => {
                        fetchGroup(); // Refresh when members change
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'group_expenses',
                        filter: `group_id=eq.${id}`
                    },
                    () => {
                        fetchGroup(); // Refresh when expenses change
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(groupSubscription);
            };
        }
    }, [id, user, fetchGroup]);

    const handleSearchUsers = async (query) => {
        if (query.length < 2) {
            setUserSearchResults([]);
            return;
        }

        setSearchLoading(true);
        try {
            const results = await searchUsers(query);
            // Filter out users who are already members
            const memberIds = group?.group_members?.map(member => member.profiles.id) || [];
            const filteredResults = results.filter(user => !memberIds.includes(user.id));
            setUserSearchResults(filteredResults);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSendInvitation = async (email) => {
        setInviteLoading(true);
        try {
            await sendGroupInvitation(id, email);
            setNewMemberEmail('');
            setUserSearchResults([]);
            setShowUserSearch(false);
            // Show success message
            alert(t('groups.invitation_sent'));
        } catch (error) {
            alert(error.response?.data?.error || t('groups.invitation_failed'));
        } finally {
            setInviteLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        // Validate that shares add up to the total expense amount
        const totalShares = shares.reduce((acc, share) => acc + parseFloat(share.amount_owed || 0), 0);
        if (Math.abs(totalShares - parseFloat(expenseAmount)) > 0.01) {
            alert(t('groups.share_amount_error'));
            return;
        }

        try {
            await addGroupExpense(id, {
                description: expenseDescription,
                amount: parseFloat(expenseAmount),
                shares: shares.filter(share => parseFloat(share.amount_owed) > 0)
            });
            setExpenseDescription('');
            setExpenseAmount('');
            setShares(shares.map(s => ({ ...s, amount_owed: '' }))); // Clear amounts
            fetchGroup(); // Refresh group details
        } catch (err) {
            console.error('Failed to add expense:', err);
        }
    };

    const handleShareChange = (userId, value) => {
        setShares(shares.map(share =>
            share.user_id === userId ? { ...share, amount_owed: value } : share
        ));
    };

    const autoSplitExpense = () => {
        const numMembers = shares.length;
        if (numMembers > 0 && expenseAmount) {
            const amountPerMember = (parseFloat(expenseAmount) / numMembers).toFixed(2);
            setShares(shares.map(share => ({ ...share, amount_owed: amountPerMember })));
        }
    };

    const handleSettleShare = async (shareId) => {
        try {
            await settleExpenseShare(shareId);
            fetchGroup(); // Refresh group details to show updated settlement status
        } catch (error) {
            console.error('Failed to settle share:', error);
            alert('Failed to settle share. Please try again.');
        }
    };

    if (loading) return (
        <div className="flex-1 p-6">
            <div className="text-center text-[#C2C0B6] mt-8">{t('groups.loading_details')}</div>
        </div>
    );
    
    if (error) return (
        <div className="flex-1 p-6">
            <div className="text-center text-red-400 mt-8">{error}</div>
        </div>
    );
    
    if (!group) return (
        <div className="flex-1 p-6">
            <div className="text-center text-[#C2C0B6] mt-8">{t('groups.not_found')}</div>
        </div>
    );

    return (
        <div className="flex-1 p-6">
            {/* Back Button - Fixed position */}
            <button
                onClick={() => window.history.back()}
                className="fixed top-4 left-4 z-10 flex items-center justify-center w-10 h-10 rounded-lg bg-[#1F1E1D] border border-[#262626] hover:border-[#56a69f] transition-colors group"
                title={t('groups.back')}
            >
                <svg 
                    className="w-5 h-5 text-[#C2C0B6] group-hover:text-[#56a69f] transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">{group.name}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Members Section */}
                <div className="bg-[#1F1E1D] rounded-lg border border-[#262626] p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">{t('groups.members')}</h2>
                    
                    <div className="space-y-3 mb-6">
                        {group.group_members.map(member => (
                            <div key={member.profiles.id} className="flex items-center justify-between p-3 bg-[#1F1E1D] rounded-lg">
                                <span className="text-white">{member.profiles.name}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="border-t border-[#262626] pt-4">
                        <h3 className="text-lg font-medium text-white mb-3">{t('groups.invite_member')}</h3>
                        
                        <div className="space-y-3">
                            <input
                                type="email"
                                value={newMemberEmail}
                                onChange={(e) => {
                                    setNewMemberEmail(e.target.value);
                                    handleSearchUsers(e.target.value);
                                    setShowUserSearch(e.target.value.length >= 2);
                                }}
                                placeholder={t('groups.enter_email')}
                                className="w-full px-4 py-2 bg-[#1F1E1D] border border-[#262626] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#56a69f] focus:border-transparent"
                            />
                            
                            {showUserSearch && (
                                <div className="bg-[#1F1E1D] border border-[#262626] rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
                                    {searchLoading ? (
                                        <div className="p-3 text-[#C2C0B6] text-center">{t('groups.searching')}</div>
                                    ) : userSearchResults.length > 0 ? (
                                        userSearchResults.map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleSendInvitation(user.email)}
                                                disabled={inviteLoading}
                                                className="w-full text-left p-3 hover:bg-[#1F1E1D] transition-colors border-b border-[#262626] last:border-b-0"
                                            >
                                                <div className="text-white">{user.name}</div>
                                                <div className="text-[#C2C0B6] text-sm">{user.email}</div>
                                            </button>
                                        ))
                                    ) : newMemberEmail.length >= 2 ? (
                                        <div className="p-3">
                                            <div className="text-[#C2C0B6] text-sm mb-2">{t('groups.no_users_found')}</div>
                                            <button
                                                onClick={() => handleSendInvitation(newMemberEmail)}
                                                disabled={inviteLoading}
                                                className="text-[#56a69f] hover:text-[#00b37e] text-sm"
                                            >
                                                {t('groups.send_invitation_to')} {newMemberEmail}
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expenses Section - Same as before */}
                <div className="bg-[#1F1E1D] rounded-lg border border-[#262626] p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">{t('groups.expenses')}</h2>
                    
                    <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar">
                        {group.group_expenses.length === 0 ? (
                            <p className="text-[#C2C0B6] text-center py-8">{t('groups.no_expenses')}</p>
                        ) : (
                            group.group_expenses.map(expense => (
                                <div key={expense.id} className="p-4 bg-[#1F1E1D] rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-white font-medium">{expense.description}</span>
                                        <span className="text-[#56a69f] font-bold">R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="text-sm text-[#C2C0B6] mb-3">{t('groups.paid_by')} {expense.profiles.name}</div>
                                    <div className="space-y-1">
                                        {expense.expense_shares.map(share => (
                                            <div key={share.id} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-300">{share.profiles.name} {t('groups.owes')} R$ {share.amount_owed.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                {share.is_settled ? (
                                                    <span className="text-green-400 text-xs">{t('groups.settled')}</span>
                                                ) : share.user_id === user.id ? (
                                                    <button 
                                                        onClick={() => handleSettleShare(share.id)}
                                                        className="text-[#56a69f] hover:text-[#00b37e] text-xs"
                                                    >
                                                        {t('groups.settle')}
                                                    </button>
                                                ) : (
                                                    <span className="text-[#C2C0B6] text-xs">{t('groups.pending')}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <form onSubmit={handleAddExpense} className="border-t border-[#262626] pt-4 space-y-4">
                        <h3 className="text-lg font-medium text-white">{t('groups.add_expense')}</h3>
                        
                        <div>
                            <label htmlFor="description" className="block text-white font-medium mb-2">{t('groups.description')}</label>
                            <input
                                type="text"
                                id="description"
                                value={expenseDescription}
                                onChange={(e) => setExpenseDescription(e.target.value)}
                                className="w-full px-4 py-2 bg-[#1F1E1D] border border-[#262626] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#56a69f] focus:border-transparent"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="amount" className="block text-white font-medium mb-2">{t('groups.amount')}</label>
                            <input
                                type="number"
                                step="0.01"
                                id="amount"
                                value={expenseAmount}
                                onChange={(e) => setExpenseAmount(e.target.value)}
                                className="w-full px-4 py-2 bg-[#1F1E1D] border border-[#262626] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#56a69f] focus:border-transparent"
                                required
                            />
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-white font-medium">{t('groups.split')}</h4>
                                <button
                                    type="button"
                                    onClick={autoSplitExpense}
                                    className="text-[#56a69f] hover:text-[#00b37e] text-sm"
                                >
                                    {t('groups.split_equally')}
                                </button>
                            </div>
                            <div className="space-y-2">
                                {shares.map(share => (
                                    <div key={share.user_id} className="flex items-center justify-between">
                                        <label className="text-gray-300 text-sm">{share.username}</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={share.amount_owed}
                                                onChange={(e) => handleShareChange(share.user_id, e.target.value)}
                                                className="w-24 px-2 py-1 pr-6 bg-[#1F1E1D] border border-[#262626] rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#56a69f] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                                placeholder="0.00"
                                            />
                                            {/* Custom spinner arrows */}
                                            <div className="absolute top-1/2 right-1 -translate-y-1/2 flex flex-col gap-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleShareChange(share.user_id, ((parseFloat(share.amount_owed) || 0) + 0.01).toFixed(2))}
                                                    className="w-3 h-2 flex items-center justify-center text-white hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                                                    style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0 }}
                                                >
                                                    <FaChevronUp className="w-2 h-2 text-white stroke-2" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleShareChange(share.user_id, Math.max(0, (parseFloat(share.amount_owed) || 0) - 0.01).toFixed(2))}
                                                    className="w-3 h-2 flex items-center justify-center text-white hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                                                    style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0 }}
                                                >
                                                    <FaChevronDown className="w-2 h-2 text-white stroke-2" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full bg-[#56a69f] text-[#1F1E1D] font-bold py-3 rounded-lg hover:bg-[#4A8F88] transition-colors"
                        >
                            {t('groups.add_expense_button')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GroupPage; 