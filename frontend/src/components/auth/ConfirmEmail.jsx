import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaRedo } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ConfirmEmail = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { resendConfirmationEmail } = useAuth();
    const [isResending, setIsResending] = useState(false);
    const [resendStatus, setResendStatus] = useState(null);
    const [resendError, setResendError] = useState(null);

    // Get email from location state or query params
    const email = location.state?.email || new URLSearchParams(location.search).get('email') || '';

    const handleResendEmail = async () => {
        if (!email) {
            setResendError(t('confirmEmail.email_not_found'));
            return;
        }

        setIsResending(true);
        setResendError(null);
        setResendStatus(null);

        try {
            const { success, error } = await resendConfirmationEmail(email);

            if (success) {
                setResendStatus(t('confirmEmail.resend_success'));
            } else {
                setResendError(error || t('confirmEmail.resend_error'));
            }
        } catch {
            setResendError(t('confirmEmail.resend_error'));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#262624] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#56a69f]/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#56a69f]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#56a69f]/2 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="max-w-md w-full space-y-8 bg-[#1F1E1D] backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#262626] relative z-10">
                {/* Icon */}
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-[#56a69f]/10 rounded-full flex items-center justify-center border border-[#56a69f]/30">
                        <FaEnvelope className="h-10 w-10 text-[#56a69f]" />
                    </div>
                </div>

                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">
                        {t('confirmEmail.title')}
                    </h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-[#56a69f] to-[#56a69f]/50 mx-auto rounded-full my-4"></div>
                    <p className="mt-4 text-gray-400">
                        {t('confirmEmail.subtitle')}
                    </p>
                    {email && (
                        <p className="mt-2 text-lg font-semibold text-[#56a69f]">
                            {email}
                        </p>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-[#56a69f]/5 border border-[#56a69f]/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                        <FaCheckCircle className="h-5 w-5 text-[#56a69f] mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-white mb-2">
                                {t('confirmEmail.next_steps_title')}
                            </h3>
                            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                                <li>{t('confirmEmail.step_1')}</li>
                                <li>{t('confirmEmail.step_2')}</li>
                                <li>{t('confirmEmail.step_3')}</li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Resend email section */}
                <div className="text-center space-y-4">
                    <p className="text-sm text-gray-400">
                        {t('confirmEmail.didnt_receive')}
                    </p>

                    {resendStatus && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-sm text-green-400">{resendStatus}</p>
                        </div>
                    )}

                    {resendError && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-sm text-red-400">{resendError}</p>
                        </div>
                    )}

                    <button
                        onClick={handleResendEmail}
                        disabled={isResending || !email}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-[#56a69f] to-[#56a69f]/80 hover:from-[#56a69f]/90 hover:to-[#56a69f]/70 focus:outline-none focus:ring-4 focus:ring-[#56a69f]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <FaRedo className={`h-4 w-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
                        {isResending ? t('confirmEmail.resending') : t('confirmEmail.resend_button')}
                    </button>
                </div>

                {/* Help text */}
                <div className="border-t border-[#262626] pt-6">
                    <p className="text-xs text-gray-500 text-center">
                        {t('confirmEmail.check_spam')}
                    </p>
                </div>

                {/* Back to login */}
                <div className="text-center">
                    <Link
                        to="/login"
                        className="text-sm text-[#56a69f] hover:text-[#56a69f]/80 font-medium transition-colors duration-200"
                    >
                        {t('confirmEmail.already_confirmed')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ConfirmEmail;
