import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { QRCodeSVG } from 'qrcode.react';
import { useAnalytics } from '../../hooks/useAnalytics';

function ReferralDashboard() {
    const { track } = useAnalytics();
    const [loading, setLoading] = useState(true);
    const [referralData, setReferralData] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/referrals/my-code');

            if (response.data.success) {
                setReferralData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch referral data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = async () => {
        if (!referralData) return;

        try {
            await navigator.clipboard.writeText(referralData.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            // Track event
            track('referral_code_copied', {
                referralCode: referralData.referralCode
            });
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleCopyLink = async () => {
        if (!referralData) return;

        try {
            await navigator.clipboard.writeText(referralData.shortUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            // Track event
            track('referral_link_copied', {
                referralCode: referralData.referralCode
            });
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    const handleShareWhatsApp = () => {
        if (!referralData) return;

        const message = `Olá! 👋\n\nEstou usando o Monity para organizar minhas finanças e está sendo incrível! 💰\n\nUse meu código ${referralData.referralCode} no cadastro e ganhe 7 dias GRÁTIS de Premium!\n\n👉 Link direto: ${referralData.shortUrl}\n\nVocê vai conseguir:\n✅ Orçamentos ilimitados\n✅ Metas de economia ilimitadas\n✅ Assistente AI sem limites\n\nBora organizar as finanças juntos? 🚀`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        // Track event
        track('referral_shared', {
            method: 'whatsapp',
            referralCode: referralData.referralCode
        });
    };

    const handleShareSMS = () => {
        if (!referralData) return;

        const message = `Ei! Use meu código ${referralData.referralCode} no Monity e ganhe 7 dias GRÁTIS de Premium! 🎁\n👉 ${referralData.shortUrl}`;

        const smsUrl = `sms:?&body=${encodeURIComponent(message)}`;
        window.location.href = smsUrl;

        // Track event
        track('referral_shared', {
            method: 'sms',
            referralCode: referralData.referralCode
        });
    };

    const getTierInfo = (stats) => {
        const successfulRefs = stats.successfulReferrals || 0;

        if (successfulRefs === 0) {
            return {
                currentTier: 'Tier 1',
                currentReward: '14 dias',
                nextTier: 'Tier 2',
                nextReward: '7 dias por amigo',
                refsNeeded: 1,
                progress: 0
            };
        } else if (successfulRefs <= 3) {
            return {
                currentTier: 'Tier 2',
                currentReward: '7 dias por amigo',
                nextTier: 'Tier 3',
                nextReward: '5 dias por amigo',
                refsNeeded: 4 - successfulRefs,
                progress: (successfulRefs / 4) * 100
            };
        } else if (successfulRefs <= 8) {
            return {
                currentTier: 'Tier 3',
                currentReward: '5 dias por amigo',
                nextTier: 'Tier 4',
                nextReward: '3 dias por amigo',
                refsNeeded: 9 - successfulRefs,
                progress: ((successfulRefs - 4) / 5) * 100
            };
        } else {
            return {
                currentTier: 'Tier 4 (Máximo)',
                currentReward: '3 dias por amigo',
                nextTier: null,
                nextReward: null,
                refsNeeded: 0,
                progress: 100
            };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-full bg-[#262624]">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-[#56a69f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-white">Carregando...</p>
                </div>
            </div>
        );
    }

    const tierInfo = referralData?.stats ? getTierInfo(referralData.stats) : null;

    return (
        <div className="min-h-full bg-[#262624] p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Indique Amigos, Ganhe Premium Grátis
                    </h1>
                    <p className="text-gray-400">
                        Compartilhe seu código e ganhe até 14 dias de Premium para cada amigo!
                    </p>
                </div>

                {/* Your Referral Code Card */}
                <div className="bg-[#1a1a19] border border-[#9C9A92]/30 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Seu Código de Indicação</h2>

                    {/* Code Display */}
                    <div className="bg-gradient-to-r from-[#56a69f]/10 to-[#01a87a]/10 border-2 border-[#56a69f]/50 rounded-xl p-6 mb-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-400 mb-2">Compartilhe este código:</p>
                            <div className="text-4xl font-bold text-[#56a69f] tracking-wider mb-4">
                                {referralData?.referralCode || 'LOADING'}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 justify-center">
                                {/* Copy Code Button */}
                                <button
                                    onClick={handleCopyCode}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#56a69f] hover:bg-[#4A8F88] text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                                >
                                    {copied ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copiar Código
                                        </>
                                    )}
                                </button>

                                {/* WhatsApp Button */}
                                <button
                                    onClick={handleShareWhatsApp}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    WhatsApp
                                </button>

                                {/* SMS Button */}
                                <button
                                    onClick={handleShareSMS}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    SMS
                                </button>

                                {/* QR Code Button */}
                                <button
                                    onClick={() => setShowQR(!showQR)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                    QR Code
                                </button>
                            </div>

                            {/* QR Code Display */}
                            {showQR && (
                                <div className="mt-4 p-4 bg-white rounded-lg inline-block">
                                    <QRCodeSVG
                                        value={referralData?.shortUrl || ''}
                                        size={200}
                                        level="H"
                                        includeMargin={true}
                                    />
                                    <p className="text-xs text-gray-600 mt-2 text-center">
                                        Escaneie para acessar
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Short Link */}
                    <div className="flex items-center gap-2 p-3 bg-[#262624] rounded-lg border border-[#9C9A92]/20">
                        <span className="text-gray-400 text-sm flex-1 truncate">
                            {referralData?.shortUrl}
                        </span>
                        <button
                            onClick={handleCopyLink}
                            className="px-3 py-1 text-sm bg-[#56a69f] hover:bg-[#4A8F88] text-white rounded transition-colors"
                        >
                            Copiar Link
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#1a1a19] border border-[#9C9A92]/30 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-[#56a69f]">
                            {referralData?.stats.totalReferrals || 0}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Total de Indicações</div>
                    </div>

                    <div className="bg-[#1a1a19] border border-[#9C9A92]/30 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-green-400">
                            {referralData?.stats.successfulReferrals || 0}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Qualificadas</div>
                    </div>

                    <div className="bg-[#1a1a19] border border-[#9C9A92]/30 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-400">
                            {referralData?.stats.pendingReferrals || 0}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Pendentes</div>
                    </div>

                    <div className="bg-[#1a1a19] border border-[#9C9A92]/30 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-purple-400">
                            {referralData?.stats.totalDaysEarned || 0}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Dias Ganhos</div>
                    </div>
                </div>

                {/* Progress to Next Tier */}
                {tierInfo && tierInfo.nextTier && (
                    <div className="bg-[#1a1a19] border border-[#9C9A92]/30 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Progresso para Próximo Nível</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">
                                    {tierInfo.currentTier}: <span className="text-[#56a69f] font-semibold">{tierInfo.currentReward}</span>
                                </span>
                                <span className="text-gray-400">
                                    {tierInfo.nextTier}: <span className="text-[#56a69f] font-semibold">{tierInfo.nextReward}</span>
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-700 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-[#56a69f] to-[#01a87a] h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${tierInfo.progress}%` }}
                                ></div>
                            </div>

                            <p className="text-center text-gray-400 text-sm">
                                Faltam <span className="text-[#56a69f] font-semibold">{tierInfo.refsNeeded} {tierInfo.refsNeeded === 1 ? 'indicação' : 'indicações'}</span> para o próximo nível
                            </p>
                        </div>
                    </div>
                )}

                {/* How It Works */}
                <div className="bg-[#1a1a19] border border-[#9C9A92]/30 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Como Funciona</h3>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-[#56a69f] rounded-full flex items-center justify-center text-white font-bold">
                                1
                            </div>
                            <div className="text-left">
                                <p className="text-white font-medium">Compartilhe seu código</p>
                                <p className="text-gray-400 text-sm">Envie para amigos via WhatsApp, SMS ou mostre o QR Code</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-[#56a69f] rounded-full flex items-center justify-center text-white font-bold">
                                2
                            </div>
                            <div className="text-left">
                                <p className="text-white font-medium">Amigos se cadastram e adicionam primeira transação</p>
                                <p className="text-gray-400 text-sm">Quando completarem o cadastro e adicionarem a primeira transação, você ganha!</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-[#56a69f] rounded-full flex items-center justify-center text-white font-bold">
                                3
                            </div>
                            <div className="text-left">
                                <p className="text-white font-medium">Você ganha dias Premium grátis!</p>
                                <p className="text-gray-400 text-sm">Quanto mais amigos, mais dias você ganha. Sem limites!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reward Tiers */}
                <div className="bg-[#1a1a19] border border-[#9C9A92]/30 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Níveis de Recompensa</h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-[#262624] rounded-lg border border-[#56a69f]/30">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">✨</span>
                                <div className="text-left">
                                    <p className="text-white font-medium">1ª indicação</p>
                                    <p className="text-xs text-gray-400">Tier 1</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[#56a69f] font-bold">14 dias GRÁTIS</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-[#262624] rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⭐</span>
                                <div className="text-left">
                                    <p className="text-white font-medium">2-4 indicações</p>
                                    <p className="text-xs text-gray-400">Tier 2</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[#56a69f] font-bold">7 dias cada</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-[#262624] rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🌟</span>
                                <div className="text-left">
                                    <p className="text-white font-medium">5-9 indicações</p>
                                    <p className="text-xs text-gray-400">Tier 3</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[#56a69f] font-bold">5 dias cada</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-[#262624] rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🔥</span>
                                <div className="text-left">
                                    <p className="text-white font-medium">10+ indicações</p>
                                    <p className="text-xs text-gray-400">Tier 4</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[#56a69f] font-bold">3 dias cada</p>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg space-y-2">
                            <p className="text-yellow-400 text-sm text-center font-semibold">
                                ⚠️ Limite vitalício: 60 dias no total
                            </p>
                            {referralData?.lifetimeCapRemaining !== undefined && (
                                <div className="space-y-1">
                                    <p className="text-[#C2C0B6] text-xs text-center">
                                        Você já ganhou {referralData.totalDaysEarned || 0} dias.{' '}
                                        {referralData.lifetimeCapRemaining > 0 ? (
                                            <span className="text-[#56a69f] font-semibold">
                                                Restam {referralData.lifetimeCapRemaining} dias disponíveis!
                                            </span>
                                        ) : (
                                            <span className="text-yellow-400 font-semibold">
                                                Limite máximo atingido.
                                            </span>
                                        )}
                                    </p>
                                    {/* Progress bar */}
                                    <div className="w-full bg-[#262624] rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-[#56a69f] to-[#01a87a] h-full transition-all duration-300"
                                            style={{
                                                width: `${((referralData.totalDaysEarned || 0) / (referralData.lifetimeCapTotal || 60)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReferralDashboard;
