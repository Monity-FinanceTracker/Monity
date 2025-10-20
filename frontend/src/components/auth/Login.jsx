import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

function Login() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || t('loginPage.invalid_credentials'));
        } finally {
            setLoading(false);
        }
    };

    const isValidEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#232323] via-[#1a1f2e] to-[#23263a] p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#01C38D]/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#01C38D]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#01C38D]/2 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md">
                {/* Monity Logo with Animation */}
                <div className="mb-8 text-center transform animate-fade-in-up">
                    <div className="relative">
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#01C38D] to-[#01C38D]/70 bg-clip-text text-transparent">
                            Monity
                        </h1>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#01C38D] to-transparent rounded-full"></div>
                    </div>
                    <p className="text-gray-400 mt-4 text-lg font-medium">{t('loginPage.slogan')}</p>
                </div>

                {/* Login Card with Enhanced Design */}
                <div className="bg-[#171717] backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#262626] transform animate-fade-in-up delay-200">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">{t('loginPage.welcome')}</h2>
                        <div className="w-12 h-1 bg-gradient-to-r from-[#01C38D] to-[#01C38D]/50 mx-auto rounded-full"></div>
                    </div>

                    {/* Error Message with Better Styling */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center backdrop-blur-sm animate-shake">
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Enhanced Email Input */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-gray-300 font-medium text-sm">
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
                                    className={`w-full bg-[#171717] border-2 ${
                                        emailFocused ? 'border-[#01C38D]' : 'border-[#262626]'
                                    } text-white rounded-xl pl-10 pr-4 py-3 focus:ring-0 focus:border-[#01C38D] transition-all duration-300 placeholder-gray-500`}
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
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-gray-300 font-medium text-sm">
                                {t('loginPage.password')}
                            </label>
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
                                    className={`w-full bg-[#171717] border-2 ${
                                        passwordFocused ? 'border-[#01C38D]' : 'border-[#262626]'
                                    } text-white rounded-xl pl-10 pr-12 py-3 focus:ring-0 focus:border-[#01C38D] transition-all duration-300 placeholder-gray-500`}
                                    placeholder="••••••••"
                                    required
                                />
                                <div
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#01C38D] transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
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
                            className="w-full bg-gradient-to-r from-[#01C38D] to-[#01C38D]/80 text-white py-3.5 rounded-xl font-semibold hover:from-[#01C38D]/90 hover:to-[#01C38D]/70 focus:ring-4 focus:ring-[#01C38D]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
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
                                <div className="flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    {t('common.login')}
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Enhanced Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm mb-4">
                            {t('loginPage.no_account')}
                        </p>
                        <Link
                            to="/signup"
                            className="inline-flex items-center justify-center text-[#01C38D] hover:text-[#01C38D]/80 font-semibold transition-colors duration-200 group"
                        >
                            {t('loginPage.signup')}
                            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
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

export default Login; 