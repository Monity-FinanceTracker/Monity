import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * What's New page - displays latest updates and releases from Monity
 * Similar to Spotify's notification section
 */
const WhatsNewPage = () => {
    const { t } = useTranslation();

    return (
        <div className="w-full h-full overflow-hidden bg-[#262624]">
            <div className="h-full px-4 sm:px-6 py-8 overflow-hidden">
                {/* Header Section - Top Left */}
                <div className="mb-8 text-left">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
                        {t('whatsNew.title')}
                    </h1>
                    <p className="text-gray-400 text-base sm:text-lg">
                        {t('whatsNew.subtitle')}
                    </p>
                </div>

                {/* Empty State Section */}
                <div className="mt-12 text-center py-16">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-3">
                            {t('whatsNew.empty_title')}
                        </h2>
                        <p className="text-gray-400 text-base leading-relaxed">
                            {t('whatsNew.empty_description')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsNewPage;

