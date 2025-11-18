import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import monityLogo from '../../assets/Logo-Escrito-Branca.png';

function ResetPassword() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { updatePassword } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [focusedField, setFocusedField] = useState('');
    const [countdown, setCountdown] = useState(3);

    // Check if we have access_token in URL (from Supabase email link)
    useEffect(() => {
        const params = new URLSearchParams(location.hash.substring(1)); // Remove # and parse
        const accessToken = params.get('access_token');

        if (!accessToken) {
            setError(t('resetPassword.error_subtitle'));
        }
    }, [location, t]);

    useEffect(() => {
        if (success) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/login');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [success, navigate]);

    const getPasswordStrength = (password) => {
        let score = 0;
        let feedback = [];

        if (password.length >= 8) score++;
        else feedback.push(t('signupPage.password_min_length'));

        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        else feedback.push(t('signupPage.password_mixed_case'));

        if (/\d/.test(password)) score++;
        else feedback.push(t('signupPage.password_number'));

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        else feedback.push(t('signupPage.password_special'));

        const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score];
        const color = ['text-red-500', 'text-red-400', 'text-yellow-400', 'text-gray-300', 'text-green-400'][score];

        return { score, strength, color, feedback };
    };

    const passwordStrength = getPasswordStrength(password);
    const passwordsMatch = password && confirmPassword && password === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(t('resetPassword.passwords_no_match'));
            return;
        }

        if (passwordStrength.score < 2) {
            setError(t('resetPassword.password_too_weak'));
            return;
        }

        setLoading(true);

        try {
            await updatePassword(password);
            setSuccess(true);
        } catch (err) {
            setError(err.message || t('resetPassword.error_subtitle'));
        } finally {
            setLoading(false);
        }
    };

    // Success state
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#262624] p-4 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#56a69f]/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#56a69f]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-[#1F1E1D] backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#262626]">
                        <div className="text-center">
                            <div className="mx-auto h-20 w-20 bg-[#56a69f]/10 rounded-full flex items-center justify-center border border-[#56a69f]/30 animate-bounce mb-6">
                                <FaCheckCircle className="h-10 w-10 text-[#56a69f]" />
                            </div>
                        </div>

                        <div className="text-center space-y-4 mb-6">
                            <h2 className="text-3xl font-bold text-white">
                                {t('resetPassword.success_title')}
                            </h2>
                            <div className="w-12 h-1 bg-gradient-to-r from-[#56a69f] to-[#56a69f]/50 mx-auto rounded-full"></div>
                            <p className="text-lg text-[#C2C0B6]">
                                {t('resetPassword.success_subtitle')}
                            </p>
                            <p className="text-sm text-gray-500">
                                {t('emailConfirmed.redirecting', { count: countdown })}
                            </p>
                        </div>

                        <div className="bg-[#56a69f]/5 border border-[#56a69f]/20 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-300 text-center">
                                {t('resetPassword.can_login')}
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-gradient-to-r from-[#56a69f] to-[#56a69f]/80 text-white py-3 rounded-xl font-semibold hover:from-[#56a69f]/90 hover:to-[#56a69f]/70 focus:ring-4 focus:ring-[#56a69f]/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            {t('resetPassword.go_to_login')}
                        </button>
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
                    <p className="text-[#C2C0B6] mt-4 text-lg font-medium text-center">{t('loginPage.slogan')}</p>
                </div>

                {/* Reset Password Card */}
                <div className="bg-[#1F1E1D] backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-[#262626] transform animate-fade-in-up delay-200">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">{t('resetPassword.title')}</h2>
                        <div className="w-12 h-1 bg-gradient-to-r from-[#56a69f] to-[#56a69f]/50 mx-auto rounded-full mb-4"></div>
                        <p className="text-[#C2C0B6] text-sm">{t('resetPassword.subtitle')}</p>
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
                        {/* New Password Input */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-gray-300 font-medium text-sm">
                                {t('resetPassword.new_password')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField('')}
                                    className={`w-full bg-[#E8F0FE] border-2 ${
                                        focusedField === 'password' ? 'border-[#56a69f]' : 'border-gray-300'
                                    } text-gray-900 rounded-xl pl-10 pr-12 py-2.5 focus:ring-0 focus:border-[#56a69f] transition-all duration-300 placeholder-gray-500`}
                                    placeholder="••••••••"
                                    required
                                />
                                <div
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#C2C0B6] hover:text-[#56a69f] transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                >
                                    {showPassword ? (
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    passwordStrength.score === 0 ? 'bg-red-500 w-1/5' :
                                                    passwordStrength.score === 1 ? 'bg-red-400 w-2/5' :
                                                    passwordStrength.score === 2 ? 'bg-yellow-400 w-3/5' :
                                                    passwordStrength.score === 3 ? 'bg-gray-300 w-4/5' :
                                                    'bg-green-400 w-full'
                                                }`}
                                            ></div>
                                        </div>
                                        <span className={`text-xs font-medium ${passwordStrength.color}`}>
                                            {passwordStrength.strength}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-gray-300 font-medium text-sm">
                                {t('resetPassword.confirm_password')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onFocus={() => setFocusedField('confirmPassword')}
                                    onBlur={() => setFocusedField('')}
                                    className={`w-full bg-[#E8F0FE] border-2 ${
                                        focusedField === 'confirmPassword' ? 'border-[#56a69f]' :
                                        confirmPassword && !passwordsMatch ? 'border-red-400' :
                                        'border-gray-300'
                                    } text-gray-900 rounded-xl pl-10 pr-12 py-2.5 focus:ring-0 focus:border-[#56a69f] transition-all duration-300 placeholder-gray-500`}
                                    placeholder="••••••••"
                                    required
                                />
                                <div
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#C2C0B6] hover:text-[#56a69f] transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                        </svg>
                                    )}
                                </div>
                            </div>
                            {confirmPassword && (
                                <div className="text-xs">
                                    {passwordsMatch ? (
                                        <span className="text-green-400 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Passwords match
                                        </span>
                                    ) : (
                                        <span className="text-red-400 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Passwords don't match
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#56a69f] to-[#56a69f]/80 text-white py-3 rounded-xl font-semibold hover:from-[#56a69f]/90 hover:to-[#56a69f]/70 focus:ring-4 focus:ring-[#56a69f]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg mt-6"
                            disabled={loading || !passwordsMatch || passwordStrength.score < 2}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('resetPassword.resetting')}
                                </div>
                            ) : (
                                t('resetPassword.reset_button')
                            )}
                        </button>
                    </form>
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

export default ResetPassword;
