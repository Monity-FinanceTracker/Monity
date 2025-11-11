import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useTranslation } from 'react-i18next';
import monityLogo from '../assets/Logo-Escrito-Branca.png';

function EmailConfirmation() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { resendConfirmationEmail, checkEmailVerification } = useAuth();
    
    const [email] = useState(location.state?.email || 'seu email');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [canResend, setCanResend] = useState(true);
    const [countdown, setCountdown] = useState(0);

    // Countdown para reenvio
    useEffect(() => {
        let interval;
        if (countdown > 0) {
            interval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0 && !canResend) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [countdown, canResend]);

    const handleResendEmail = async () => {
        if (!canResend) return;

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const result = await resendConfirmationEmail();
            
            if (result.success) {
                setMessage('Email de confirmação enviado com sucesso! Verifique sua caixa de entrada.');
                setCanResend(false);
                setCountdown(60); // 60 segundos de cooldown
            } else {
                setError(result.error || 'Erro ao reenviar email');
            }
        } catch (error) {
            console.error('Erro ao reenviar email:', error);
            setError('Erro ao reenviar email. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckVerification = async () => {
        setChecking(true);
        setError('');
        setMessage('');

        try {
            const result = await checkEmailVerification();
            
            if (result.success && result.verified) {
                setMessage('Email confirmado com sucesso! Redirecionando...');
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 2000);
            } else if (result.success && !result.verified) {
                setError('Email ainda não foi confirmado. Verifique sua caixa de entrada.');
            } else {
                setError(result.error || 'Erro ao verificar confirmação');
            }
        } catch (error) {
            console.error('Erro ao verificar confirmação:', error);
            setError('Erro ao verificar confirmação. Tente novamente.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#01C38D]/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#01C38D]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#01C38D]/2 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md mx-auto">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center justify-center transform animate-fade-in-up">
                    <img src={monityLogo} alt="Monity Logo" className="w-auto scale-[0.6] -mb-5" />
                </div>

                {/* Card */}
                <div className="bg-[#171717] backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#262626] transform animate-fade-in-up delay-200">
                    {/* Mail Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-[#01C38D]/10 rounded-full flex items-center justify-center animate-bounce-slow">
                            <svg className="w-10 h-10 text-[#01C38D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {t('emailConfirmation.title') || 'Verifique seu Email'}
                        </h2>
                        <div className="w-12 h-1 bg-gradient-to-r from-[#01C38D] to-[#01C38D]/50 mx-auto rounded-full"></div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-center mb-6">
                        {t('emailConfirmation.description') || 'Enviamos um link de confirmação para'}
                    </p>
                    <p className="text-[#01C38D] text-center font-semibold mb-8 break-all">
                        {email}
                    </p>

                    {/* Success Message */}
                    {message && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-center animate-fade-in">
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {message}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center animate-shake">
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="space-y-3">
                        {/* Check Verification Button */}
                        <button
                            onClick={handleCheckVerification}
                            disabled={checking}
                            className="w-full bg-gradient-to-r from-[#01C38D] to-[#01C38D]/80 text-white py-3.5 rounded-xl font-semibold hover:from-[#01C38D]/90 hover:to-[#01C38D]/70 focus:ring-4 focus:ring-[#01C38D]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            {checking ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('emailConfirmation.checking') || 'Verificando...'}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {t('emailConfirmation.alreadyConfirmed') || 'Já Confirmei'}
                                </div>
                            )}
                        </button>

                        {/* Resend Button */}
                        <button
                            onClick={handleResendEmail}
                            disabled={loading || !canResend}
                            className="w-full bg-[#262626] hover:bg-[#2a2a2a] text-white py-3.5 rounded-xl font-semibold border-2 border-[#262626] hover:border-[#01C38D]/30 focus:ring-4 focus:ring-gray-700/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('emailConfirmation.sending') || 'Enviando...'}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {!canResend && countdown > 0 
                                        ? `${t('emailConfirmation.resend') || 'Reenviar Email'} (${countdown}s)`
                                        : t('emailConfirmation.resend') || 'Reenviar Email'
                                    }
                                </div>
                            )}
                        </button>

                        {/* Back to Login */}
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full text-gray-400 hover:text-[#01C38D] py-2 transition-colors duration-200"
                        >
                            {t('emailConfirmation.backToLogin') || 'Voltar para Login'}
                        </button>
                    </div>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-[#262626]/50 rounded-lg border border-[#262626]">
                        <p className="text-gray-400 text-sm text-center">
                            💡 {t('emailConfirmation.tip') || 'Não esqueça de verificar a pasta de spam'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out;
                }
                
                .delay-200 {
                    animation-delay: 200ms;
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }

                .animate-fade-in {
                    animation: fade-in-up 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

export default EmailConfirmation;

