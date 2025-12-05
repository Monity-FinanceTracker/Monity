import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getInvitationByToken, acceptInvitationByToken } from '../../utils/api';
import { useAuth } from '../../context/useAuth';
import { useTranslation } from 'react-i18next';
import { LoadingState } from '../ui/EmptyStates';

const AcceptInvitationPage = () => {
    const { t } = useTranslation();
    const { token } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [invitation, setInvitation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvitation = async () => {
            try {
                setLoading(true);
                const data = await getInvitationByToken(token);
                setInvitation(data.invitation);
                setError(null);
            } catch (err) {
                setError(err.error || 'Failed to load invitation');
                if (err.expired) {
                    setError(t('groups.invitation_expired'));
                } else if (err.status) {
                    setError(t('groups.invitation_already_used'));
                }
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchInvitation();
        }
    }, [token, t]);

    const handleAccept = async () => {
        if (!user) {
            // Redirect to login with return URL
            navigate('/login', { state: { returnTo: `/groups/invite/${token}` } });
            return;
        }

        try {
            setAccepting(true);
            await acceptInvitationByToken(token);
            // Redirect to the group page
            navigate(`/groups/${invitation.groupId}`, { 
                replace: true,
                state: { message: t('groups.invitation_accepted') }
            });
        } catch (err) {
            if (err.requiresAuth) {
                navigate('/login', { state: { returnTo: `/groups/invite/${token}` } });
            } else if (err.alreadyMember) {
                navigate(`/groups/${invitation.groupId}`, { 
                    replace: true,
                    state: { message: t('groups.already_member') }
                });
            } else {
                setError(err.error || t('groups.failed_to_accept_invitation'));
            }
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 p-6 flex items-center justify-center">
                <div className="bg-[#1F1E1D] rounded-lg border border-[#262626] p-8">
                    <LoadingState message={t('groups.loading_invitation')} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-6 flex items-center justify-center">
                <div className="bg-[#1F1E1D] rounded-lg border border-[#262626] p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="text-red-400 text-xl mb-4">⚠️</div>
                        <h2 className="text-white text-2xl font-bold mb-4">{t('groups.invitation_error')}</h2>
                        <p className="text-[#C2C0B6] mb-6">{error}</p>
                        <Link
                            to="/groups"
                            className="inline-block bg-[#56a69f] text-[#1F1E1D] font-bold py-2 px-6 rounded-lg hover:bg-[#4A8F88] transition-colors"
                        >
                            {t('groups.back_to_groups')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!invitation) {
        return null;
    }

    const expiresAt = invitation.expiresAt ? new Date(invitation.expiresAt) : null;
    const isExpired = expiresAt && expiresAt < new Date();

    return (
        <div className="flex-1 p-6 flex items-center justify-center">
            <div className="bg-[#1F1E1D] rounded-lg border border-[#262626] p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="text-[#56a69f] text-4xl mb-4">👥</div>
                    <h1 className="text-white text-3xl font-bold mb-2">{t('groups.group_invitation')}</h1>
                    <p className="text-[#C2C0B6]">{t('groups.you_are_invited')}</p>
                </div>

                <div className="bg-[#262626] rounded-lg p-6 mb-6">
                    <div className="mb-4">
                        <div className="text-[#8B8A85] text-xs font-medium mb-1 uppercase tracking-wide">
                            {t('groups.group_name')}
                        </div>
                        <div className="text-white text-xl font-bold">
                            {invitation.groupName || t('groups.unknown_group')}
                        </div>
                    </div>

                    {invitation.inviter && (
                        <div className="mb-4">
                            <div className="text-[#8B8A85] text-xs font-medium mb-1 uppercase tracking-wide">
                                {t('groups.invited_by')}
                            </div>
                            <div className="text-[#C2C0B6] text-lg">
                                {invitation.inviter.name}
                            </div>
                        </div>
                    )}

                    {expiresAt && (
                        <div>
                            <div className="text-[#8B8A85] text-xs font-medium mb-1 uppercase tracking-wide">
                                {t('groups.expires_at')}
                            </div>
                            <div className={`text-sm ${isExpired ? 'text-red-400' : 'text-[#C2C0B6]'}`}>
                                {expiresAt.toLocaleDateString('pt-BR', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {isExpired ? (
                    <div className="text-center">
                        <p className="text-red-400 mb-4">{t('groups.invitation_expired')}</p>
                        <Link
                            to="/groups"
                            className="inline-block bg-[#56a69f] text-[#1F1E1D] font-bold py-2 px-6 rounded-lg hover:bg-[#4A8F88] transition-colors"
                        >
                            {t('groups.back_to_groups')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {!user ? (
                            <>
                                <p className="text-[#C2C0B6] text-center mb-4">
                                    {t('groups.login_to_accept')}
                                </p>
                                <div className="flex gap-3">
                                    <Link
                                        to="/login"
                                        state={{ returnTo: `/groups/invite/${token}` }}
                                        className="flex-1 bg-[#56a69f] text-[#1F1E1D] font-bold py-3 px-6 rounded-lg hover:bg-[#4A8F88] transition-colors text-center"
                                    >
                                        {t('groups.login')}
                                    </Link>
                                    <Link
                                        to="/signup"
                                        state={{ returnTo: `/groups/invite/${token}` }}
                                        className="flex-1 bg-[#262626] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#3a3a3a] transition-colors text-center border border-[#262626]"
                                    >
                                        {t('groups.signup')}
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={handleAccept}
                                disabled={accepting}
                                className="w-full bg-[#56a69f] text-[#1F1E1D] font-bold py-3 px-6 rounded-lg hover:bg-[#4A8F88] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {accepting ? t('groups.accepting') : t('groups.accept_invitation')}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcceptInvitationPage;

