import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaRedo } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ConfirmEmail = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
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
        } catch (err) {
            setResendError(t('confirmEmail.resend_error'));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                {/* Icon */}
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaEnvelope className="h-10 w-10 text-blue-600" />
                    </div>
                </div>

                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {t('confirmEmail.title')}
                    </h2>
                    <p className="mt-4 text-gray-600">
                        {t('confirmEmail.subtitle')}
                    </p>
                    {email && (
                        <p className="mt-2 text-lg font-semibold text-blue-600">
                            {email}
                        </p>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <FaCheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                {t('confirmEmail.next_steps_title')}
                            </h3>
                            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                                <li>{t('confirmEmail.step_1')}</li>
                                <li>{t('confirmEmail.step_2')}</li>
                                <li>{t('confirmEmail.step_3')}</li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Resend email section */}
                <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">
                        {t('confirmEmail.didnt_receive')}
                    </p>

                    {resendStatus && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-700">{resendStatus}</p>
                        </div>
                    )}

                    {resendError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-700">{resendError}</p>
                        </div>
                    )}

                    <button
                        onClick={handleResendEmail}
                        disabled={isResending || !email}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaRedo className={`h-4 w-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
                        {isResending ? t('confirmEmail.resending') : t('confirmEmail.resend_button')}
                    </button>
                </div>

                {/* Help text */}
                <div className="border-t border-gray-200 pt-6">
                    <p className="text-xs text-gray-500 text-center">
                        {t('confirmEmail.check_spam')}
                    </p>
                </div>

                {/* Back to login */}
                <div className="text-center">
                    <Link
                        to="/login"
                        className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                        {t('confirmEmail.already_confirmed')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ConfirmEmail;
