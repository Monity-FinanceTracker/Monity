import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setConsent } from '../../utils/analytics';

/**
 * Analytics Consent Banner
 *
 * GDPR-compliant consent banner for analytics tracking.
 * Shows on first visit and allows users to opt-in or opt-out.
 */
function AnalyticsConsentBanner() {
    const { t } = useTranslation();
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('analytics_consent');
        const dismissed = localStorage.getItem('analytics_banner_dismissed');

        // Show banner if no choice has been made and banner hasn't been dismissed
        if (consent === null && dismissed !== 'true') {
            // Delay showing banner slightly for better UX
            setTimeout(() => {
                setShowBanner(true);
            }, 2000);
        }
    }, []);

    const handleAccept = () => {
        setConsent(true);
        setShowBanner(false);
        localStorage.setItem('analytics_banner_dismissed', 'true');
    };

    const handleDecline = () => {
        setConsent(false);
        setShowBanner(false);
        localStorage.setItem('analytics_banner_dismissed', 'true');
    };

    const handleCustomize = () => {
        // Navigate to settings page (to be implemented)
        // For now, just decline
        handleDecline();
    };

    if (!showBanner) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
            <div className="max-w-4xl mx-auto bg-[#262624] border-2 border-[#01C38D] rounded-xl shadow-2xl p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-[#01C38D]/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-[#01C38D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                            We value your privacy
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            We use analytics to improve your experience with Monity.
                            This helps us understand how you use the app and make it better.
                            We respect your privacy - your data stays with us and is never sold to third parties.
                            You can change your preferences anytime in settings.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <button
                            onClick={handleDecline}
                            className="px-4 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            className="px-6 py-2 rounded-lg bg-[#01C38D] text-black hover:bg-[#01C38D]/90 transition-colors text-sm font-semibold"
                        >
                            Accept
                        </button>
                    </div>
                </div>

                {/* Learn More Link */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <a
                            href="/privacy"
                            className="text-[#01C38D] hover:underline text-sm"
                        >
                            Learn more about our privacy policy
                        </a>
                        <button
                            onClick={handleCustomize}
                            className="text-gray-400 hover:text-gray-300 text-sm"
                        >
                            Customize preferences
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsConsentBanner;
