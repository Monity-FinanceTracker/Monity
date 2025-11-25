import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { searchUsers } from '../../utils/api';
import { useAuth } from '../../context/useAuth';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FaChevronUp, FaChevronDown, FaCopy, FaCheck } from 'react-icons/fa6';
import { useGroupById, useAddGroupExpense, useInviteGroupMember, useSettleExpenseShare } from '../../hooks/useQueries';
import { LoadingState } from '../ui/EmptyStates';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
};

const formatDate = (dateString, t) => {
    if (!dateString) return t('groups.no_activity');
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('groups.today');
    if (diffDays === 1) return t('groups.yesterday');
    if (diffDays < 7) return t('groups.days_ago', { count: diffDays });
    if (diffDays < 30) return t('groups.weeks_ago', { count: Math.floor(diffDays / 7) });
    return date.toLocaleDateString('pt-BR');
};

const GroupPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const { user } = useAuth();
    
    const { data: group, isLoading: loading, error: queryError } = useGroupById(id);
    const addExpenseMutation = useAddGroupExpense();
    const inviteMemberMutation = useInviteGroupMember();
    const settleShareMutation = useSettleExpenseShare();
    
    const [invitationLink, setInvitationLink] = useState(null);
    const [linkCopied, setLinkCopied] = useState(false);
    const [invitationError, setInvitationError] = useState(null);
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [shares, setShares] = useState([]);
    const [expenseError, setExpenseError] = useState('');

    // Initialize shares when group data is available
    const initialShares = useMemo(() => {
        if (group && group.group_members) {
            return group.group_members.map(member => ({
                user_id: member.profiles.id,
                username: member.profiles.name,
                amount_owed: ''
            }));
        }
        return [];
    }, [group]);

    // Update shares when group changes
    useEffect(() => {
        if (initialShares.length > 0 && shares.length !== initialShares.length) {
            setShares(initialShares);
        }
    }, [initialShares]);

    const handleGenerateInvitationLink = useCallback(async () => {
        try {
            setInvitationError(null);
            const data = await inviteMemberMutation.mutateAsync({ groupId: id });
            setInvitationLink({
                link: data.invitationLink,
                expiresAt: data.expiresAt,
                token: data.invitationToken
            });
            setLinkCopied(false);
            
            // Auto-copy link to clipboard if available
            if (data.invitationLink && navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(data.invitationLink);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 3000);
                } catch (clipboardError) {
                    // Clipboard copy failed, but link was generated successfully
                    console.warn('Failed to auto-copy link:', clipboardError);
                }
            }
        } catch (error) {
            console.error('Failed to generate invitation link:', error);
            
            // Check if it's a migration error
            const errorResponse = error?.response?.data || error;
            if (errorResponse?.migrationRequired || errorResponse?.code === 'MIGRATION_REQUIRED') {
                setInvitationError({
                    type: 'migration',
                    message: errorResponse.error || t('groups.migration_required_error'),
                    migrationSQL: errorResponse.migrationSQL,
                    instructions: errorResponse.instructions
                });
            } else {
                setInvitationError({
                    type: 'general',
                    message: errorResponse?.error || errorResponse?.details || t('groups.failed_to_generate_link')
                });
            }
            
            toast.error(errorResponse?.error || t('groups.failed_to_generate_link'));
        }
    }, [id, inviteMemberMutation, t]);

    const handleCopyLink = useCallback(async () => {
        if (invitationLink?.link) {
            try {
                await navigator.clipboard.writeText(invitationLink.link);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 3000);
            } catch (error) {
                console.error('Failed to copy link:', error);
                toast.error(t('groups.failed_to_copy_link'));
            }
        }
    }, [invitationLink, t]);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setExpenseError('');
        
        // Validate that shares add up to the total expense amount
        const totalShares = shares.reduce((acc, share) => acc + parseFloat(share.amount_owed || 0), 0);
        if (Math.abs(totalShares - parseFloat(expenseAmount)) > 0.01) {
            setExpenseError(t('groups.shares_must_equal_total'));
            return;
        }

        try {
            await addExpenseMutation.mutateAsync({
                groupId: id,
                expenseData: {
                    description: expenseDescription,
                    amount: parseFloat(expenseAmount),
                    shares: shares.filter(share => parseFloat(share.amount_owed) > 0)
                }
            });
            setExpenseDescription('');
            setExpenseAmount('');
            setShares(shares.map(s => ({ ...s, amount_owed: '' }))); // Clear amounts
            setExpenseError('');
        } catch (err) {
            console.error('Failed to add expense:', err);
            setExpenseError(t('groups.add_expense_error') || 'Failed to add expense');
        }
    };

    const handleShareChange = useCallback((userId, value) => {
        setShares(prevShares => prevShares.map(share =>
            share.user_id === userId ? { ...share, amount_owed: value } : share
        ));
        setExpenseError(''); // Clear error when user modifies shares
    }, []);

    const autoSplitExpense = useCallback(() => {
        if (shares.length > 0 && expenseAmount) {
            const amountPerMember = (parseFloat(expenseAmount) / shares.length).toFixed(2);
            setShares(shares.map(share => ({ ...share, amount_owed: amountPerMember })));
            setExpenseError(''); // Clear error when auto-splitting
        }
    }, [shares, expenseAmount]);

    const handleSettleShare = useCallback(async (shareId) => {
        try {
            await settleShareMutation.mutateAsync(shareId);
        } catch (error) {
            console.error('Failed to settle share:', error);
        }
    }, [settleShareMutation]);

    // Calculate summary statistics - must be before early returns
    const totalSpent = useMemo(() => {
        if (!group?.group_expenses) return 0;
        return group.group_expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    }, [group?.group_expenses]);

    const memberCount = useMemo(() => group?.group_members?.length || 0, [group?.group_members?.length]);
    const expenseCount = useMemo(() => group?.group_expenses?.length || 0, [group?.group_expenses?.length]);
    
    const lastActivity = useMemo(() => {
        if (!group?.group_expenses || group.group_expenses.length === 0) return null;
        const dates = group.group_expenses
            .map(e => new Date(e.created_at || e.updated_at))
            .filter(d => !isNaN(d.getTime()))
            .map(d => d.getTime());
        if (dates.length === 0) return null;
        return new Date(Math.max(...dates));
    }, [group?.group_expenses]);

    if (loading) return (
        <div className="flex-1 p-6">
            <div className="bg-[#1F1E1D] rounded-lg border border-[#262626] overflow-hidden">
                <LoadingState message={t('groups.loading_details')} />
            </div>
        </div>
    );
    
    if (queryError || !group) return (
        <div className="flex-1 p-6">
            <div className="text-center text-red-400 mt-8">
                {queryError?.response?.status === 404 
                    ? t('groups.not_found_or_not_member')
                    : t('groups.not_found')
                }
            </div>
        </div>
    );

    return (
        <div className="flex-1 p-6 max-w-7xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => window.history.back()}
                className="mb-6 flex items-center gap-2 text-[#C2C0B6] hover:text-white transition-colors group"
                title={t('groups.back')}
            >
                <svg 
                    className="w-5 h-5 group-hover:text-[#56a69f] transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">{t('groups.back')}</span>
            </button>

            {/* Header Section - Summary */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-6 text-left">{group.name}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-5">
                        <div className="text-[#8B8A85] text-xs font-medium mb-2 uppercase tracking-wide">
                            {t('groups.total_spent')}
                        </div>
                        <div className="text-[#56a69f] text-2xl font-bold">
                            {formatCurrency(totalSpent)}
                        </div>
                    </div>
                    
                    <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-5">
                        <div className="text-[#8B8A85] text-xs font-medium mb-2 uppercase tracking-wide">
                            {t('groups.members')}
                        </div>
                        <div className="text-white text-2xl font-bold">
                            {memberCount}
                        </div>
                    </div>
                    
                    <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-5">
                        <div className="text-[#8B8A85] text-xs font-medium mb-2 uppercase tracking-wide">
                            {t('groups.last_activity')}
                        </div>
                        <div className="text-white text-lg font-semibold">
                            {formatDate(lastActivity, t)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Layout with emphasis on Expenses */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                {/* Members Section - Compact */}
                <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-5">
                    <div className="flex items-center justify-start mb-4">
                        <h3 className="text-3xl font-bold text-white">{t('groups.members')}</h3>
                    </div>
                    
                    <div className="space-y-2 mb-5">
                        {group.group_members.map(member => (
                            <div 
                                key={member.profiles.id} 
                                className="flex items-center gap-2.5 p-2.5 bg-[#262626] rounded-lg border border-[#262626] hover:border-[#3a3a3a] transition-all duration-200"
                            >
                                <div className="w-8 h-8 bg-[#56a69f]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-[#56a69f] font-semibold text-xs">
                                        {member.profiles.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-white font-medium text-sm truncate">{member.profiles.name}</span>
                            </div>
                        ))}
                    </div>
                    
                    {/* Invite Member Form - Compact */}
                    <div className="pt-4 border-t border-[#262626]">
                        <h3 className="text-sm font-semibold text-white mb-3">{t('groups.invite_member')}</h3>
                        
                        <div className="space-y-3">
                            {/* Error message display */}
                            {invitationError && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <div className="text-red-400 text-sm">⚠️</div>
                                        <div className="flex-1">
                                            <p className="text-red-400 text-xs font-semibold mb-1">{t('groups.error')}</p>
                                            <p className="text-red-300 text-xs mb-2">{invitationError.message}</p>
                                            {invitationError.type === 'migration' && invitationError.migrationSQL && (
                                                <div className="mt-3">
                                                    <p className="text-[#C2C0B6] text-xs font-medium mb-2">{t('groups.migration_instructions')}:</p>
                                                    <div className="bg-[#1F1E1D] border border-[#262626] rounded p-2 max-h-32 overflow-y-auto">
                                                        <pre className="text-[#8B8A85] text-xs whitespace-pre-wrap overflow-x-auto">
                                                            {invitationError.migrationSQL}
                                                        </pre>
                                                    </div>
                                                    <p className="text-[#8B8A85] text-xs mt-2">{t('groups.migration_steps')}</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setInvitationError(null)}
                                                className="mt-2 text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                                            >
                                                {t('groups.dismiss')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!invitationLink && !invitationError && (
                                <button
                                    onClick={handleGenerateInvitationLink}
                                    disabled={inviteMemberMutation.isPending}
                                    className="w-full bg-[#56a69f] text-[#1F1E1D] font-bold py-2.5 rounded-lg hover:bg-[#4A8F88] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                                >
                                    {inviteMemberMutation.isPending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-[#1F1E1D] border-t-transparent rounded-full animate-spin"></div>
                                            <span>{t('groups.generating_link')}</span>
                                        </>
                                    ) : (
                                        <span>{t('groups.generate_invitation_link')}</span>
                                    )}
                                </button>
                            )}

                            {invitationLink && (
                                <div className="space-y-3">
                                    <div className="bg-[#262626] border border-[#262626] rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={invitationLink.link}
                                                className="flex-1 px-2 py-1.5 text-xs bg-[#1F1E1D] border border-[#262626] rounded text-white focus:outline-none font-mono"
                                            />
                                            <button
                                                onClick={handleCopyLink}
                                                className={`px-3 py-1.5 font-semibold text-xs rounded transition-colors flex items-center gap-1.5 ${
                                                    linkCopied 
                                                        ? 'bg-green-600 text-white' 
                                                        : 'bg-[#56a69f] text-[#1F1E1D] hover:bg-[#4A8F88]'
                                                }`}
                                                title={linkCopied ? t('groups.copied') : t('groups.copy')}
                                            >
                                                {linkCopied ? (
                                                    <>
                                                        <FaCheck className="w-3 h-3" />
                                                        <span>{t('groups.copied')}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaCopy className="w-3 h-3" />
                                                        <span>{t('groups.copy')}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        {invitationLink.expiresAt && (
                                            <div className="text-[#8B8A85] text-xs mt-2 pt-2 border-t border-[#1F1E1D]">
                                                <span className="font-medium">{t('groups.expires_at')}:</span>{' '}
                                                {new Date(invitationLink.expiresAt).toLocaleDateString('pt-BR', { 
                                                    day: '2-digit', 
                                                    month: '2-digit', 
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setInvitationLink(null);
                                            setInvitationError(null);
                                            handleGenerateInvitationLink();
                                        }}
                                        disabled={inviteMemberMutation.isPending}
                                        className="w-full bg-[#262626] text-white font-semibold py-2 rounded-lg hover:bg-[#3a3a3a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs border border-[#262626]"
                                    >
                                        {inviteMemberMutation.isPending ? t('groups.generating_link') : t('groups.generate_new_link')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Expense Form - At the bottom */}
                    <form onSubmit={handleAddExpense} className="mt-10 pt-8 border-t border-[#262626] space-y-4">
                        <h3 className="text-xl font-semibold text-white mb-1">{t('groups.add_expense')}</h3>
                        
                        {expenseError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                                <p className="text-red-400 text-xs">{expenseError}</p>
                            </div>
                        )}
                        
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="description" className="block text-[#C2C0B6] text-xs font-medium mb-1.5">
                                    {t('groups.description')}
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    value={expenseDescription}
                                    onChange={(e) => setExpenseDescription(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-[#262626] border border-[#262626] rounded-lg text-white placeholder-[#8B8A85] focus:outline-none focus:ring-2 focus:ring-[#56a69f] focus:border-transparent transition-all"
                                    placeholder={t('groups.description')}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="amount" className="block text-[#C2C0B6] text-xs font-medium mb-1.5">
                                    {t('groups.amount')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        id="amount"
                                        value={expenseAmount}
                                        onChange={(e) => setExpenseAmount(e.target.value)}
                                        className="w-full px-3 py-2 pr-8 text-sm bg-[#262626] border border-[#262626] rounded-lg text-white placeholder-[#8B8A85] focus:outline-none focus:ring-2 focus:ring-[#56a69f] focus:border-transparent transition-all [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                        placeholder="0.00"
                                        required
                                    />
                                    <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => setExpenseAmount(((parseFloat(expenseAmount) || 0) + 0.01).toFixed(2))}
                                            className="w-3 h-2 flex items-center justify-center text-white hover:text-[#56a69f] transition-colors cursor-pointer"
                                        >
                                            <FaChevronUp className="w-2 h-2" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setExpenseAmount(Math.max(0, (parseFloat(expenseAmount) || 0) - 0.01).toFixed(2))}
                                            className="w-3 h-2 flex items-center justify-center text-white hover:text-[#56a69f] transition-colors cursor-pointer"
                                        >
                                            <FaChevronDown className="w-2 h-2" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-[#C2C0B6] text-xs font-medium">
                                    {t('groups.split')}
                                </label>
                                <button
                                    type="button"
                                    onClick={autoSplitExpense}
                                    className="text-[#56a69f] hover:text-[#4A8F88] text-xs font-medium transition-colors"
                                >
                                    {t('groups.split_equally')}
                                </button>
                            </div>
                            <div className="space-y-2 bg-[#262626] rounded-lg p-3 border border-[#262626]">
                                {shares.map(share => (
                                    <div key={share.user_id} className="flex items-center justify-between">
                                        <label className="text-white text-xs font-medium">{share.username}</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={share.amount_owed}
                                                onChange={(e) => handleShareChange(share.user_id, e.target.value)}
                                                className="w-24 px-2 py-1.5 pr-7 text-xs bg-[#1F1E1D] border border-[#262626] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#56a69f] focus:border-transparent transition-all [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                                placeholder="0.00"
                                            />
                                            <div className="absolute top-1/2 right-1.5 -translate-y-1/2 flex flex-col gap-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleShareChange(share.user_id, ((parseFloat(share.amount_owed) || 0) + 0.01).toFixed(2))}
                                                    className="w-3 h-2 flex items-center justify-center text-white hover:text-[#56a69f] transition-colors cursor-pointer"
                                                >
                                                    <FaChevronUp className="w-2 h-2" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleShareChange(share.user_id, Math.max(0, (parseFloat(share.amount_owed) || 0) - 0.01).toFixed(2))}
                                                    className="w-3 h-2 flex items-center justify-center text-white hover:text-[#56a69f] transition-colors cursor-pointer"
                                                >
                                                    <FaChevronDown className="w-2 h-2" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={addExpenseMutation.isPending}
                            className="w-full bg-[#56a69f] text-[#1F1E1D] font-bold py-2.5 rounded-lg hover:bg-[#4A8F88] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm mb-4"
                        >
                            {addExpenseMutation.isPending ? t('groups.creating') : t('groups.add_expense_button')}
                        </button>
                    </form>
                </div>

                {/* Expenses Section - Main Focus */}
                <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-4xl font-bold text-white">{t('groups.expenses')}</h3>
                        <span className="text-[#8B8A85] text-sm font-medium">{expenseCount} {t('groups.expenses')}</span>
                    </div>
                    
                    {/* Expenses List */}
                    <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 max-h-[800px]">
                        {group.group_expenses.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-[#8B8A85] text-sm">{t('groups.no_expenses')}</p>
                            </div>
                        ) : (
                            group.group_expenses.map(expense => (
                                <div 
                                    key={expense.id} 
                                    className="p-6 bg-[#262626] rounded-xl border border-[#262626] hover:border-[#3a3a3a] transition-all duration-200 shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 pr-4">
                                            <h4 className="text-white font-bold text-lg mb-2">{expense.description}</h4>
                                            <p className="text-[#8B8A85] text-sm">
                                                {t('groups.paid_by')} <span className="text-white font-semibold">{expense.profiles.name}</span>
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-[#56a69f] font-bold text-xl">
                                                {formatCurrency(expense.amount)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-[#1F1E1D] space-y-2.5">
                                        {expense.expense_shares.map(share => (
                                            <div key={share.id} className="flex justify-between items-center py-1.5">
                                                <span className="text-[#C2C0B6] text-sm">
                                                    <span className="text-white font-semibold">{share.profiles.name}</span> {t('groups.owes')} <span className="text-white font-medium">{formatCurrency(share.amount_owed)}</span>
                                                </span>
                                                {share.is_settled ? (
                                                    <span className="text-[#56a69f] text-xs font-semibold px-3 py-1.5 bg-[#56a69f]/10 rounded-md">
                                                        {t('groups.settled')}
                                                    </span>
                                                ) : share.user_id === user.id ? (
                                                    <button 
                                                        onClick={() => handleSettleShare(share.id)}
                                                        disabled={settleShareMutation.isPending}
                                                        className="text-[#56a69f] hover:text-[#4A8F88] hover:bg-[#56a69f]/20 text-xs font-semibold px-3 py-1.5 bg-[#56a69f]/10 rounded-md transition-all disabled:opacity-50"
                                                    >
                                                        {t('groups.settle')}
                                                    </button>
                                                ) : (
                                                    <span className="text-[#8B8A85] text-xs font-medium px-3 py-1.5 bg-[#1F1E1D] rounded-md">
                                                        {t('groups.pending')}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupPage; 