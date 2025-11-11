import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../context/AuthContext";
import { FiCheck, FiZap, FiMessageSquare, FiTrendingUp, FiTarget, FiPieChart, FiLock, FiStar, FiCalendar } from "react-icons/fi";

const Subscription = () => {
  const { t } = useTranslation();
  const { subscriptionTier } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Load Stripe buy button script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      // Redirect to Stripe checkout URL
      window.location.href = "https://buy.stripe.com/28E00i8dS5CTaZA5h50Fi01";
    } catch (error) {
      console.error("Upgrade failed", error);
      alert("Failed to redirect to checkout");
    } finally {
      setIsUpgrading(false);
    }
  };

  const features = [
    {
      icon: <FiMessageSquare className="w-6 h-6" />,
      title: t('subscription.features.unlimited_ai'),
      description: t('subscription.features.unlimited_ai_desc'),
      free: t('subscription.features.messages_per_day', { count: 3 }),
      premium: t('subscription.features.unlimited')
    },
    {
      icon: <FiTarget className="w-6 h-6" />,
      title: t('subscription.features.unlimited_budgets'),
      description: t('subscription.features.unlimited_budgets_desc'),
      free: t('subscription.features.budgets_goals_limit', { budgets: 2, goals: 2 }),
      premium: t('subscription.features.unlimited')
    },
    // {
    //   icon: <FiTrendingUp className="w-6 h-6" />,
    //   title: t('subscription.features.advanced_analytics'),
    //   description: t('subscription.features.advanced_analytics_desc'),
    //   free: t('subscription.features.basic_stats'),
    //   premium: t('subscription.features.full_insights')
    // },
    {
      icon: <FiPieChart className="w-6 h-6" />,
      title: t('subscription.features.smart_categorization'),
      description: t('subscription.features.smart_categorization_desc'),
      free: t('subscription.features.manual_only'),
      premium: t('subscription.features.ai_powered')
    },
    // {
    //   icon: <FiZap className="w-6 h-6" />,
    //   title: t('subscription.features.priority_features'),
    //   description: t('subscription.features.priority_features_desc'),
    //   free: t('subscription.features.standard'),
    //   premium: t('subscription.features.priority')
    // },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: t('subscription.features.export_backup'),
      description: t('subscription.features.export_backup_desc'),
      free: t('subscription.features.limited'),
      premium: t('subscription.features.full_access_export')
    },
    {
      icon: <FiCalendar className="w-6 h-6" />,
      title: t('subscription.features.cash_flow_calendar'),
      description: t('subscription.features.cash_flow_calendar_desc'),
      free: t('subscription.features.not_available'),
      premium: t('subscription.features.full_access')
    },
    {
      icon: <FiTrendingUp className="w-6 h-6" />,
      title: t('subscription.features.investment_calculator'),
      description: t('subscription.features.investment_calculator_desc'),
      free: t('subscription.features.simulations_per_month', { count: 2 }),
      premium: t('subscription.features.unlimited')
    }
  ];

  if (subscriptionTier === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">{t('subscription.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#01C38D]/10 border border-[#01C38D]/20 rounded-full px-4 py-2 mb-4">
            <FiStar className="text-[#01C38D]" />
            <span className="text-[#01C38D] text-sm font-medium">
              {subscriptionTier === 'premium' ? t('subscription.premium_member') : t('subscription.upgrade_available')}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {subscriptionTier === 'premium'
              ? t('subscription.premium_title')
              : t('subscription.upgrade_title')
            }
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {subscriptionTier === 'premium'
              ? t('subscription.premium_subtitle')
              : t('subscription.upgrade_subtitle')
            }
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#171717] border border-[#262626] rounded-2xl p-6 hover:border-[#01C38D]/30 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#01C38D]/20 to-[#01a87a]/20 rounded-xl flex items-center justify-center text-[#01C38D] mb-4">
                {feature.icon}
              </div>

              <h3 className="text-white font-semibold text-lg mb-2">
                {feature.title}
              </h3>

              <p className="text-gray-400 text-sm mb-4">
                {feature.description}
              </p>

              <div className="flex items-center justify-between text-sm pt-4 border-t border-[#262626]">
                <div>
                  <div className="text-gray-500 mb-1">{t('subscription.features.free')}</div>
                  <div className="text-gray-400">{feature.free}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 mb-1">{t('subscription.features.premium')}</div>
                  <div className="text-[#01C38D] font-medium">{feature.premium}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        {subscriptionTier === 'free' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-[#01C38D]/10 to-[#01a87a]/10 border border-[#01C38D]/20 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">
                {t('subscription.cta.ready_to_upgrade')}
              </h2>
              <p className="text-gray-300 mb-6">
                {t('subscription.cta.join_thousands')}
              </p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">R$9.90</div>
                  <div className="text-gray-400 text-sm">{t('subscription.cta.price_per_month')}</div>
                </div>
              </div>

              {/* Stripe Buy Button
              <div className="mb-6">
                <stripe-buy-button
                  buy-button-id="buy_btn_1SLE6GBDlx4noKmegfQZtEY6"
                  publishable-key="pk_live_51SH0m9BDlx4noKmetogVrJWuB7swkwBpzLi3d8GOsYUPeMB1w5IuTjVrpbrmSlJxPUj065ZdWc9CENn7AXeIWmWC00WD1iCqqz"
                />
              </div> */}

              {/* Alternative upgrade button (fallback) */}
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="bg-gradient-to-r from-[#01C38D] to-[#01a87a] text-white font-semibold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-[#01C38D]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto inline-flex items-center justify-center gap-2 text-lg"
              >
                {isUpgrading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('subscription.cta.processing')}
                  </>
                ) : (
                  <>
                    <FiZap />
                    {t('subscription.cta.upgrade_button')}
                  </>
                )}
              </button>

              <p className="text-gray-500 text-xs mt-4">
                {t('subscription.cta.cancel_anytime')}
              </p>
            </div>
          </div>
        )}

        {/* FAQ or Additional Info */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <p className="text-gray-500 text-sm">
            {t('subscription.support.have_questions')} <a href={`mailto:${t('subscription.support.email')}`} className="text-[#01C38D] hover:underline">{t('subscription.support.email')}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;