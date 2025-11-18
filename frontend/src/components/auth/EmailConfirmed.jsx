import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const EmailConfirmed = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isEmailConfirmed } = useAuth();
    const [status, setStatus] = useState('checking'); // checking, success, error
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        // Check if user is confirmed
        const checkConfirmation = async () => {
            // Wait a moment for auth state to update
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (user && isEmailConfirmed()) {
                setStatus('success');
            } else if (!user) {
                // User not logged in, probably need to login
                setStatus('error');
            } else {
                // User logged in but not confirmed yet
                setStatus('checking');
                // Retry after a delay
                setTimeout(checkConfirmation, 2000);
            }
        };

        checkConfirmation();
    }, [user, isEmailConfirmed]);

    useEffect(() => {
        if (status === 'success') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [status, navigate]);

    if (status === 'checking') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#262624] px-4 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#56a69f]/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#56a69f]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="max-w-md w-full space-y-8 bg-[#1F1E1D] backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#262626] text-center relative z-10">
                    <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-[#262626] border-t-[#56a69f]"></div>
                    <h2 className="text-2xl font-bold text-white">
                        {t('emailConfirmed.checking_title')}
                    </h2>
                    <p className="text-gray-400">
                        {t('emailConfirmed.checking_subtitle')}
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#262624] px-4 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="max-w-md w-full space-y-8 bg-[#1F1E1D] backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#262626] relative z-10">
                    <div className="text-center">
                        <div className="mx-auto h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
                            <FaTimesCircle className="h-10 w-10 text-red-400" />
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-white">
                            {t('emailConfirmed.error_title')}
                        </h2>
                        <div className="w-12 h-1 bg-gradient-to-r from-red-400 to-red-400/50 mx-auto rounded-full"></div>
                        <p className="text-gray-400">
                            {t('emailConfirmed.error_subtitle')}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#56a69f] to-[#56a69f]/80 hover:from-[#56a69f]/90 hover:to-[#56a69f]/70 focus:outline-none focus:ring-4 focus:ring-[#56a69f]/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            {t('emailConfirmed.go_to_login')}
                        </button>
                        <button
                            onClick={() => navigate('/confirm-email')}
                            className="w-full px-4 py-2 border border-[#262626] text-sm font-medium rounded-xl text-gray-300 bg-[#262624] hover:bg-[#1A1A1A] focus:outline-none focus:ring-4 focus:ring-[#56a69f]/25 transition-all duration-300"
                        >
                            {t('emailConfirmed.resend_confirmation')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#262624] px-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#56a69f]/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#56a69f]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#56a69f]/2 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="max-w-md w-full space-y-8 bg-[#1F1E1D] backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#262626] relative z-10">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-[#56a69f]/10 rounded-full flex items-center justify-center border border-[#56a69f]/30 animate-bounce">
                        <FaCheckCircle className="h-10 w-10 text-[#56a69f]" />
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-white">
                        {t('emailConfirmed.success_title')}
                    </h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-[#56a69f] to-[#56a69f]/50 mx-auto rounded-full"></div>
                    <p className="text-lg text-gray-400">
                        {t('emailConfirmed.success_subtitle')}
                    </p>
                    <p className="text-sm text-gray-500">
                        {t('emailConfirmed.redirecting', { count: countdown })}
                    </p>
                </div>

                <div className="bg-[#56a69f]/5 border border-[#56a69f]/20 rounded-xl p-4">
                    <p className="text-sm text-gray-300 text-center">
                        {t('emailConfirmed.can_access')}
                    </p>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#56a69f] to-[#56a69f]/80 hover:from-[#56a69f]/90 hover:to-[#56a69f]/70 focus:outline-none focus:ring-4 focus:ring-[#56a69f]/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                    {t('emailConfirmed.go_to_dashboard')}
                </button>
            </div>
        </div>
    );
};

export default EmailConfirmed;
