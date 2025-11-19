import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTranslation } from 'react-i18next';
import monityLogo from '../../assets/Logo-Escrito-Branca.png';
import GoogleOAuthButton from './GoogleOAuthButton';

function Login() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [, setEmailFocused] = useState(false);
    const [, setPasswordFocused] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { track } = useAnalytics();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);

            // Track successful login
            track('user_logged_in', {
                method: 'email'
            });

            navigate('/');
        } catch (err) {
            setError(err.message || t('loginPage.invalid_credentials'));

            // Track failed login
            track('auth_failed', {
                method: 'email',
                reason: 'invalid_credentials'
            });
        } finally {
            setLoading(false);
        }
    };

    const isValidEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#262624] p-4 relative overflow-hidden">
            {/* Content */}
            <div className="relative z-10 w-full max-w-md mx-auto">
                {/* Monity Logo with Custom Slogan */}
                <div className="mt-6 mb-4 flex flex-col items-center justify-center transform animate-fade-in-up">
                    <img
                        src={monityLogo}
                        alt="Monity Logo"
                        className="w-24 h-24 md:w-55 md:h-55 object-contain"
                    />
                    <p
                        className="mt-4 text-xl md:text-2xl font-medium text-center px-6"
                        style={{ fontFamily: `'Stratford', var(--font-sans)`, color: '#fcfaf5' }}
                    >
                        {t('loginPage.slogan')}
                    </p>
                </div>

                {/* Login Card with Enhanced Design */}
                <div className="p-5 rounded-2xl transform animate-fade-in-up delay-200">

                    {/* Error Message with Better Styling */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center backdrop-blur-sm animate-shake">
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Enhanced Email Input */}
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-white font-medium text-sm text-left">
                                {t('loginPage.email')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    className="w-full bg-[#262624] border border-[#9C9A92] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#01C38D] transition-all duration-300 placeholder-gray-500"
                                    placeholder="your@email.com"
                                    required
                                />
                                {email && isValidEmail(email) && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Password Input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-white font-medium text-sm">
                                    {t('loginPage.password')}
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs sm:text-sm !text-slate-300 hover:!text-[#01C38D] transition-colors duration-200"
                                >
                                    {t('loginPage.forgot_password')}
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    className="w-full bg-[#262624] border border-[#9C9A92] text-white rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-[#01C38D] transition-all duration-300 placeholder-gray-500"
                                    placeholder="••••••••"
                                    required
                                />
                                <div
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#56a69f] transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                    title={showPassword ? "Hide password" : "Show password"}
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
                        </div>

                        {/* Enhanced Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-[#56A69f] text-white py-3 rounded-xl font-semibold hover:bg-[#4A8F88] focus:ring-4 focus:ring-[#56A69f]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] shadow-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('loginPage.logging_in')}
                                </div>
                            ) : (
                                'Continuar'
                            )}
                        </button>
                    </form>

                    {/* OAuth Divider */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#9C9A92]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#262624] text-gray-400">{t('common.or') || 'ou'}</span>
                        </div>
                    </div>

                    {/* Google OAuth Button */}
                    <GoogleOAuthButton onError={(err) => setError(err)} />

                    {/* Enhanced Sign Up Link */}
                    <div className="mt-4 text-center">
                        <Link
                            to="/signup"
                            className="inline-flex items-center justify-center text-[#56a69f] hover:text-[#56a69f]/80 font-semibold transition-colors duration-200 group"
                        >
                            {t('loginPage.signup')}
                            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Footer with Privacy Policy and Terms Links */}
                <div className="mt-8 text-center">
                    <a 
                        href="/privacy" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 hover:text-[#56a69f] transition-colors duration-200"
                    >
                        Privacy Policy
                    </a>
                    <span className="text-gray-600 mx-3">•</span>
                    <a 
                        href="/terms" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 hover:text-[#56a69f] transition-colors duration-200"
                    >
                        Terms of Service
                    </a>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style>{`
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

export default Login; 