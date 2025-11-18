import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaArrowLeft, FaRedo } from 'react-icons/fa';
import monityLogo from '../../assets/Logo-Escrito-Branca.png';

function ForgotPassword() {
    const { t } = useTranslation();
    const { sendPasswordResetEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState('');

    const isValidEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isValidEmail(email)) {
            setError(t('forgotPassword.invalid_email'));
            return;
        }

        setLoading(true);

        try {
            const { success, error } = await sendPasswordResetEmail(email);

            if (success) {
                setEmailSent(true);
            } else {
                setError(error || t('forgotPassword.send_error'));
            }
        } catch (err) {
            setError(err.message || t('forgotPassword.send_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setLoading(true);

        try {
            const { success, error } = await sendPasswordResetEmail(email);

            if (!success) {
                setError(error || t('forgotPassword.send_error'));
            }
        } catch (err) {
            setError(err.message || t('forgotPassword.send_error'));
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#262624] p-4 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#56a69f]/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#56a69f]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#56a69f]/2 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-md mx-auto">
                    {/* Success Card */}
                    <div className="bg-[#1F1E1D] backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#262626] transform animate-fade-in-up">
                        {/* Icon */}
                        <div className="text-center mb-6">
                            <div className="mx-auto h-20 w-20 bg-[#56a69f]/10 rounded-full flex items-center justify-center border border-[#56a69f]/30">
                                <FaEnvelope className="h-10 w-10 text-[#56a69f]" />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {t('forgotPassword.check_email')}
                            </h2>
                            <div className="w-12 h-1 bg-gradient-to-r from-[#56a69f] to-[#56a69f]/50 mx-auto rounded-full mb-4"></div>
                            <p className="text-gray-400 mb-2">
                                {t('forgotPassword.instructions_sent')}
                            </p>
                            <p className="text-[#56a69f] font-semibold">
                                {email}
                            </p>
                        </div>

                        {/* Instructions */}
                        <div className="bg-[#56a69f]/5 border border-[#56a69f]/20 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-300 text-center">
                                {t('forgotPassword.check_spam')}
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center backdrop-blur-sm animate-shake">
                                <div className="flex items-center justify-center text-sm">
                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Resend Button */}
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-400 mb-3">
                                {t('forgotPassword.didnt_receive')}
                            </p>
                            <button
                                onClick={handleResend}
                                disabled={loading}
                                className="inline-flex items-center text-[#56a69f] hover:text-[#56a69f]/80 font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaRedo className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? t('forgotPassword.sending') : t('forgotPassword.resend')}
                            </button>
                        </div>

                        {/* Back to Login */}
                        <div className="text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center text-gray-400 hover:text-white font-medium transition-colors duration-200"
                            >
                                <FaArrowLeft className="h-4 w-4 mr-2" />
                                {t('forgotPassword.back_to_login')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#262624] p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#56a69f]/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#56a69f]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#56a69f]/2 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md mx-auto">
                {/* Monity Logo */}
                <div className="mb-8 flex flex-col items-center justify-center transform animate-fade-in-up">
                    <img src={monityLogo} alt="Monity Logo" className="w-auto scale-[0.6] -mb-5" />
                    <p className="text-gray-400 mt-4 text-lg font-medium text-center">{t('loginPage.slogan')}</p>
                </div>

                {/* Forgot Password Card */}
                <div className="bg-[#1F1E1D] backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-[#262626] transform animate-fade-in-up delay-200">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">{t('forgotPassword.title')}</h2>
                        <div className="w-12 h-1 bg-gradient-to-r from-[#56a69f] to-[#56a69f]/50 mx-auto rounded-full mb-4"></div>
                        <p className="text-gray-400 text-sm">{t('forgotPassword.subtitle')}</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center backdrop-blur-sm animate-shake">
                            <div className="flex items-center justify-center text-sm">
                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-gray-300 font-medium text-sm">
                                {t('forgotPassword.email')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-4 w-4 text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField('')}
                                    className={`w-full bg-[#E8F0FE] border-2 ${
                                        focusedField === 'email' ? 'border-[#56a69f]' : 'border-gray-300'
                                    } text-gray-900 rounded-xl pl-10 pr-4 py-2.5 focus:ring-0 focus:border-[#56a69f] transition-all duration-300 placeholder-gray-500`}
                                    placeholder="your@email.com"
                                    required
                                />
                                {email && isValidEmail(email) && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#56a69f] to-[#56a69f]/80 text-white py-3 rounded-xl font-semibold hover:from-[#56a69f]/90 hover:to-[#56a69f]/70 focus:ring-4 focus:ring-[#56a69f]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg mt-6"
                            disabled={loading || !isValidEmail(email)}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('forgotPassword.sending')}
                                </div>
                            ) : (
                                t('forgotPassword.send_reset_link')
                            )}
                        </button>
                    </form>

                    {/* Back to Login Link */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center text-[#56a69f] hover:text-[#56a69f]/80 font-semibold transition-colors duration-200 group"
                        >
                            <FaArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
                            {t('forgotPassword.back_to_login')}
                        </Link>
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

                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out;
                }

                .delay-200 {
                    animation-delay: 200ms;
                }

                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}

export default ForgotPassword;
