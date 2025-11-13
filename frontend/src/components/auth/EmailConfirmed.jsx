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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
                    <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {t('emailConfirmed.checking_title')}
                    </h2>
                    <p className="text-gray-600">
                        {t('emailConfirmed.checking_subtitle')}
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 px-4">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                    <div className="text-center">
                        <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                            <FaTimesCircle className="h-10 w-10 text-red-600" />
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {t('emailConfirmed.error_title')}
                        </h2>
                        <p className="text-gray-600">
                            {t('emailConfirmed.error_subtitle')}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            {t('emailConfirmed.go_to_login')}
                        </button>
                        <button
                            onClick={() => navigate('/confirm-email')}
                            className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            {t('emailConfirmed.resend_confirmation')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                        <FaCheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {t('emailConfirmed.success_title')}
                    </h2>
                    <p className="text-lg text-gray-600">
                        {t('emailConfirmed.success_subtitle')}
                    </p>
                    <p className="text-sm text-gray-500">
                        {t('emailConfirmed.redirecting', { count: countdown })}
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700 text-center">
                        {t('emailConfirmed.can_access')}
                    </p>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                    {t('emailConfirmed.go_to_dashboard')}
                </button>
            </div>
        </div>
    );
};

export default EmailConfirmed;
