import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../context/useAuth";
import {
  FiCheck, FiZap, FiMessageSquare, FiTrendingUp, FiTarget, FiPieChart,
  FiLock, FiStar, FiCalendar, FiX, FiClock, FiUsers, FiShield, FiAward, FiPause, FiGift
} from "react-icons/fi";
import { motion } from "framer-motion";
import api from "../../utils/api";

const Subscription = () => {
  const { t } = useTranslation();
  const { subscriptionTier } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [usageStats, setUsageStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load usage stats for premium users
  useEffect(() => {
    const fetchUsageStats = async () => {
      if (subscriptionTier === 'premium') {
        try {
          const response = await api.get('/subscription/usage-stats');
          setUsageStats(response.data.data);
        } catch (error) {
          console.error('Error fetching usage stats:', error);
        } finally {
          setLoadingStats(false);
        }
      } else {
        setLoadingStats(false);
      }
    };

    fetchUsageStats();
  }, [subscriptionTier]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      window.location.href = "https://buy.stripe.com/28E00i8dS5CTaZA5h50Fi01";
    } catch (error) {
      console.error("Upgrade failed", error);
      alert("Failed to redirect to checkout");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await api.post('/billing/create-portal-session', {
        returnUrl: window.location.origin + '/subscription'
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
      alert("Failed to open billing portal");
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
    {
      icon: <FiPieChart className="w-6 h-6" />,
      title: t('subscription.features.smart_categorization'),
      description: t('subscription.features.smart_categorization_desc'),
      free: t('subscription.features.manual_only'),
      premium: t('subscription.features.ai_powered')
    },
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

  const testimonials = [
    {
      name: t('subscription.testimonials.testimonial_1_name'),
      role: t('subscription.testimonials.testimonial_1_role'),
      text: t('subscription.testimonials.testimonial_1_text'),
      savings: t('subscription.testimonials.testimonial_1_savings'),
      rating: 5
    },
    {
      name: t('subscription.testimonials.testimonial_2_name'),
      role: t('subscription.testimonials.testimonial_2_role'),
      text: t('subscription.testimonials.testimonial_2_text'),
      savings: t('subscription.testimonials.testimonial_2_savings'),
      rating: 5
    },
    {
      name: t('subscription.testimonials.testimonial_3_name'),
      role: t('subscription.testimonials.testimonial_3_role'),
      text: t('subscription.testimonials.testimonial_3_text'),
      savings: t('subscription.testimonials.testimonial_3_savings'),
      rating: 5
    }
  ];

  const comparisonFeatures = [
    { key: 'ai_messages', free: '3/dia', premium: t('subscription.comparison.premium_unlimited') },
    { key: 'budgets_goals', free: '2/2', premium: t('subscription.comparison.premium_unlimited') },
    { key: 'smart_categorization', free: false, premium: true },
    { key: 'export', free: false, premium: true },
    { key: 'cash_flow', free: false, premium: true },
    { key: 'investment_calc', free: '2/mês', premium: t('subscription.comparison.premium_unlimited') },
    { key: 'priority_support', free: false, premium: true },
    { key: 'advanced_analytics', free: false, premium: true },
    { key: 'group_expenses', free: true, premium: true },
    { key: 'custom_categories', free: true, premium: true }
  ];

  if (subscriptionTier === null) {
    return (
      <div className="min-h-screen bg-[#262624] flex items-center justify-center">
        <div className="text-[#C2C0B6]">{t('subscription.loading')}</div>
      </div>
    );
  }

  // Premium User View
  if (subscriptionTier === 'premium') {
    return (
      <div className="min-h-screen bg-[#262624] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Premium Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#56a69f]/10 border border-[#56a69f]/20 rounded-full px-6 py-3 mb-6">
              <FiStar className="text-[#56a69f] w-5 h-5" />
              <span className="text-[#56a69f] text-lg font-semibold">
                {t('subscription.premium_member')}
              </span>
            </div>

            <h1 className="text-5xl font-bold text-white mb-4">
              {t('subscription.premium_title')}
            </h1>

            <p className="text-xl text-[#C2C0B6] max-w-2xl mx-auto">
              {t('subscription.premium_subtitle')}
            </p>
          </div>

          {/* Premium Dashboard */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Subscription Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#56a69f]/20 to-[#01a87a]/10 border border-[#56a69f]/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <FiAward className="w-8 h-8 text-[#56a69f]" />
                <h2 className="text-2xl font-bold text-white">
                  {t('subscription.premium_dashboard.subscription_status')}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#C2C0B6]">{t('subscription.premium_dashboard.active')}</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                    {t('subscription.premium_dashboard.active')}
                  </span>
                </div>

                {/* Paused Billing Status - Shows if user earned referral days */}
                {!loadingStats && usageStats?.billing_paused_until && new Date(usageStats.billing_paused_until) > new Date() && (
                  <div className="bg-[#56a69f]/10 border border-[#56a69f]/30 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[#56a69f]">
                      <FiPause className="w-5 h-5" />
                      <span className="font-semibold">Cobrança Pausada</span>
                    </div>
                    <p className="text-sm text-[#C2C0B6]">
                      Sua cobrança está pausada até{' '}
                      <span className="text-white font-semibold">
                        {new Date(usageStats.billing_paused_until).toLocaleDateString('pt-BR')}
                      </span>
                      {' '}graças aos seus amigos indicados!
                    </p>
                    {usageStats.premium_days_earned > 0 && (
                      <div className="flex items-center gap-2 text-[#56a69f] text-sm">
                        <FiGift className="w-4 h-4" />
                        <span>
                          Você economizou R${(usageStats.premium_days_earned * 0.33).toFixed(2)} convidando amigos
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {!loadingStats && usageStats?.next_billing_date && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[#C2C0B6]">{t('subscription.premium_dashboard.next_billing')}</span>
                      <span className="text-white font-semibold">
                        {new Date(usageStats.next_billing_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#C2C0B6]">{t('subscription.premium_dashboard.amount')}</span>
                      <span className="text-white font-bold text-lg">
                        R$9.90{t('subscription.premium_dashboard.per_month')}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleManageBilling}
                className="w-full mt-6 bg-[#56a69f] hover:bg-[#4a8f88] text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
              >
                {t('subscription.premium_dashboard.manage_billing')}
              </button>
            </motion.div>

            {/* Usage Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1F1E1D] border border-[#262626] rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <FiTrendingUp className="w-8 h-8 text-[#56a69f]" />
                <h2 className="text-2xl font-bold text-white">
                  {t('subscription.premium_dashboard.usage_stats')}
                </h2>
              </div>

              {loadingStats ? (
                <div className="text-[#C2C0B6] text-center py-8">
                  {t('subscription.premium_dashboard.loading')}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#C2C0B6]">{t('subscription.premium_dashboard.budgets_created')}</span>
                    <span className="text-white font-bold text-xl">{usageStats?.budgets_count || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#C2C0B6]">{t('subscription.premium_dashboard.goals_created')}</span>
                    <span className="text-white font-bold text-xl">{usageStats?.savings_goals_count || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#C2C0B6]">
                      {t('subscription.premium_dashboard.ai_messages_used')}
                      <span className="text-xs ml-1">({t('subscription.premium_dashboard.this_month')})</span>
                    </span>
                    <span className="text-[#56a69f] font-bold text-xl">
                      {usageStats?.ai_messages_count || 0}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#C2C0B6]">{t('subscription.premium_dashboard.transactions_recorded')}</span>
                    <span className="text-white font-bold text-xl">{usageStats?.transactions_count || 0}</span>
                  </div>

                  <div className="pt-4 border-t border-[#262626]">
                    <p className="text-[#C2C0B6] text-sm text-center">
                      {t('subscription.premium_dashboard.current_period')}:{' '}
                      {usageStats?.current_period_start &&
                        new Date(usageStats.current_period_start).toLocaleDateString()} -{' '}
                      {usageStats?.current_period_end &&
                        new Date(usageStats.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              {t('subscription.premium_active')}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-[#1F1E1D] border border-[#56a69f]/30 rounded-xl p-6"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#56a69f]/20 to-[#01a87a]/20 rounded-xl flex items-center justify-center text-[#56a69f] mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="text-white font-semibold text-lg mb-2">{feature.title}</h4>
                  <p className="text-[#C2C0B6] text-sm mb-4">{feature.description}</p>
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-green-400 w-5 h-5" />
                    <span className="text-[#56a69f] font-medium">{feature.premium}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Free User View with Trial Offer
  return (
    <div className="min-h-screen bg-[#262624] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Trial Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#56a69f]/20 via-[#01a87a]/10 to-[#262624] border-2 border-[#56a69f]/30 rounded-3xl p-12 mb-16 text-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#56a69f]/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#01a87a]/10 rounded-full blur-3xl -z-10" />

          <div className="inline-flex items-center gap-2 bg-[#ff9f43]/20 border border-[#ff9f43]/40 rounded-full px-4 py-2 mb-6">
            <FiClock className="text-[#ff9f43]" />
            <span className="text-[#ff9f43] text-sm font-semibold">
              {t('subscription.trial.limited_time')}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {t('subscription.trial.hero_title')}
          </h1>

          <p className="text-xl text-[#C2C0B6] max-w-2xl mx-auto mb-8">
            {t('subscription.trial.hero_subtitle')}
          </p>

          {/* Trial Benefits */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2 text-left bg-[#1F1E1D]/50 p-4 rounded-lg">
                <FiCheck className="text-[#56a69f] w-6 h-6 flex-shrink-0" />
                <span className="text-white text-sm">
                  {t(`subscription.trial.trial_benefit_${i}`)}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="bg-gradient-to-r from-[#56a69f] to-[#01a87a] text-white font-bold text-xl px-12 py-5 rounded-xl hover:shadow-2xl hover:shadow-[#56a69f]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {isUpgrading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('subscription.cta.processing')}
                </>
              ) : (
                <>
                  <FiZap className="w-6 h-6" />
                  <div>
                    <div>{t('subscription.trial.start_trial_button')}</div>
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-8 text-[#C2C0B6]">
            <div className="flex items-center gap-2">
              <FiShield className="w-5 h-5 text-[#56a69f]" />
              <span className="text-sm">{t('subscription.cta.secure_payment')}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-[#56a69f]" />
              <span className="text-sm">{t('subscription.trial.join_users')}</span>
            </div>
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            {t('subscription.testimonials.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-[#1F1E1D] border border-[#262626] rounded-2xl p-6 hover:border-[#56a69f]/30 transition-all duration-300"
              >
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 fill-[#ff9f43] text-[#ff9f43]" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-[#C2C0B6] mb-6 text-lg leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t border-[#262626]">
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-[#C2C0B6] text-sm">{testimonial.role}</div>
                  </div>
                  <div className="text-[#56a69f] font-bold text-right">
                    {testimonial.savings}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            {t('subscription.upgrade_title')}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-[#1F1E1D] border border-[#262626] rounded-2xl p-6 hover:border-[#56a69f]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#56a69f]/20 to-[#01a87a]/20 rounded-xl flex items-center justify-center text-[#56a69f] mb-4">
                  {feature.icon}
                </div>

                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-[#C2C0B6] text-sm mb-4">{feature.description}</p>

                <div className="flex items-center justify-between text-sm pt-4 border-t border-[#262626]">
                  <div>
                    <div className="text-gray-500 mb-1">{t('subscription.features.free')}</div>
                    <div className="text-[#C2C0B6]">{feature.free}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500 mb-1">{t('subscription.features.premium')}</div>
                    <div className="text-[#56a69f] font-medium">{feature.premium}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            {t('subscription.comparison.title')}
          </h2>

          <div className="bg-[#1F1E1D] border border-[#262626] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#262626]">
                  <th className="text-center p-6 text-white font-semibold">Feature</th>
                  <th className="text-center p-6 text-[#C2C0B6] font-semibold">Free</th>
                  <th className="text-center p-6 bg-[#56a69f]/10">
                    <span className="text-[#56a69f] font-bold text-lg">Premium</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr key={index} className="border-b border-[#262626] last:border-0">
                    <td className="p-6 text-[#C2C0B6] text-center">
                      {t(`subscription.comparison.feature_${feature.key}`)}
                    </td>
                    <td className="p-6 text-center">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? (
                          <FiCheck className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <FiX className="w-5 h-5 text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-[#C2C0B6]">{feature.free}</span>
                      )}
                    </td>
                    <td className="p-6 text-center bg-[#56a69f]/5">
                      {typeof feature.premium === 'boolean' ? (
                        feature.premium ? (
                          <FiCheck className="w-6 h-6 text-[#56a69f] mx-auto" />
                        ) : (
                          <FiX className="w-5 h-5 text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-[#56a69f] font-semibold">{feature.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Sticky CTA at bottom of table */}
            <div className="bg-gradient-to-r from-[#56a69f]/10 to-[#01a87a]/10 p-8 text-center">
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="bg-gradient-to-r from-[#56a69f] to-[#01a87a] text-white font-bold text-lg px-10 py-4 rounded-xl hover:shadow-xl hover:shadow-[#56a69f]/20 transition-all duration-300 disabled:opacity-50"
              >
                {isUpgrading ? t('subscription.cta.processing') : t('subscription.trial.start_trial_button')}
              </button>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-[#56a69f]/10 to-[#01a87a]/10 border border-[#56a69f]/20 rounded-2xl p-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">
              {t('subscription.cta.ready_to_upgrade')}
            </h2>
            <p className="text-[#C2C0B6] mb-6 text-lg">
              {t('subscription.cta.join_thousands')}
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">R$9.90</div>
                <div className="text-[#C2C0B6] text-sm">{t('subscription.cta.price_per_month')}</div>
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="bg-gradient-to-r from-[#56a69f] to-[#01a87a] text-white font-semibold px-10 py-4 rounded-xl hover:shadow-lg hover:shadow-[#56a69f]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 text-lg"
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

            <p className="text-gray-500 text-sm mt-6">
              {t('subscription.cta.cancel_anytime')}
            </p>
          </div>
        </div>

        {/* Support */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <p className="text-gray-500 text-sm">
            {t('subscription.support.have_questions')}{' '}
            <a href={`mailto:${t('subscription.support.email')}`} className="text-[#56a69f] hover:underline">
              {t('subscription.support.email')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
