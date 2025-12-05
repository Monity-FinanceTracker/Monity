import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiStar, FiZap, FiTarget } from 'react-icons/fi';

const PremiumUpgradeCard = ({ 
    titleKey = 'groups.premium_unlimited_groups',
    buttonKey = 'groups.upgrade_to_premium',
    icon: CustomIcon = FiTarget // eslint-disable-line no-unused-vars
}) => {
    const { t } = useTranslation();

    const handleUpgrade = async () => {
        try {
            window.location.href = "https://buy.stripe.com/28E00i8dS5CTaZA5h50Fi01";
        } catch (error) {
            console.error("Upgrade failed", error);
        }
    };

    return (
        <div className="bg-[#1F1E1D] border border-[#262626] rounded-lg p-6 hover:border-[#56a69f]/30 transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#56a69f]/20 to-[#01a87a]/20 rounded-xl flex items-center justify-center text-[#56a69f] flex-shrink-0">
                    <FiStar className="w-6 h-6" />
                </div>
                
                <div className="flex-1 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-[#56a69f]/20 rounded flex items-center justify-center">
                                <CustomIcon className="w-3 h-3 text-[#56a69f]" />
                            </div>
                            <span className="text-white font-semibold">
                                {t(titleKey)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleUpgrade}
                        className="bg-gradient-to-r from-[#56a69f] to-[#01a87a] text-white font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg hover:shadow-[#56a69f]/20 transition-all duration-300 inline-flex items-center justify-center gap-2 flex-shrink-0"
                    >
                        <FiZap className="w-4 h-4" />
                        {t(buttonKey)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumUpgradeCard;

