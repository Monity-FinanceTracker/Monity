import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/useAuth';
import { 
  FiCheckCircle, 
  FiTarget, 
  FiTrendingUp, 
  FiMessageSquare, 
  FiPieChart, 
  FiCalendar, 
  FiDownload,
  FiArrowRight,
  FiStar
} from 'react-icons/fi';
import Spinner from '../ui/Spinner';

const ThankYouPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { subscriptionTier, loading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Give webhook a moment to process if needed
    const timer = setTimeout(() => {
      setIsVerifying(false);
      
      // If user is not premium after verification, redirect to subscription page
      if (!loading && subscriptionTier !== 'premium') {
        navigate('/subscription', { replace: true });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [subscriptionTier, loading, navigate]);

  const features = [
    {
      icon: <FiTarget className="w-6 h-6" />,
      title: t('subscription.thank_you.feature_budgets_title'),
      description: t('subscription.thank_you.feature_budgets_desc'),
      cta: t('subscription.thank_you.create_budget'),
      path: '/budgets',
      gradient: 'from-[#56a69f]/20 to-[#01a87a]/20'
    },
    {
      icon: <FiTrendingUp className="w-6 h-6" />,
      title: t('subscription.thank_you.feature_goals_title'),
      description: t('subscription.thank_you.feature_goals_desc'),
      cta: t('subscription.thank_you.set_goal'),
      path: '/savings-goals',
      gradient: 'from-[#56a69f]/20 to-[#01a87a]/20'
    },
    {
      icon: <FiMessageSquare className="w-6 h-6" />,
      title: t('subscription.thank_you.feature_ai_title'),
      description: t('subscription.thank_you.feature_ai_desc'),
      cta: t('subscription.thank_you.chat_now'),
      path: '/ai-assistant',
      gradient: 'from-[#56a69f]/20 to-[#01a87a]/20'
    },
    {
      icon: <FiPieChart className="w-6 h-6" />,
      title: t('subscription.thank_you.feature_calculator_title'),
      description: t('subscription.thank_you.feature_calculator_desc'),
      cta: t('subscription.thank_you.calculate'),
      path: '/investment-calculator',
      gradient: 'from-[#56a69f]/20 to-[#01a87a]/20'
    },
    {
      icon: <FiCalendar className="w-6 h-6" />,
      title: t('subscription.thank_you.feature_cashflow_title'),
      description: t('subscription.thank_you.feature_cashflow_desc'),
      cta: t('subscription.thank_you.view_calendar'),
      path: '/cashflow',
      gradient: 'from-[#56a69f]/20 to-[#01a87a]/20'
    },
    {
      icon: <FiDownload className="w-6 h-6" />,
      title: t('subscription.thank_you.feature_export_title'),
      description: t('subscription.thank_you.feature_export_desc'),
      cta: t('subscription.thank_you.explore'),
      path: '/transactions',
      gradient: 'from-[#56a69f]/20 to-[#01a87a]/20'
    }
  ];

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen bg-[#262624] flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="text-[#C2C0B6] mt-4">{t('subscription.thank_you.verifying')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#262624] py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8 sm:mb-12">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#56a69f]/20 to-[#01a87a]/20 rounded-full mb-4 sm:mb-6">
            <FiCheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-[#56a69f]" />
          </div>

          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 bg-[#56a69f]/10 border border-[#56a69f]/20 rounded-full px-4 py-2 mb-4">
            <FiStar className="text-[#56a69f]" />
            <span className="text-[#56a69f] text-sm font-medium">
              {t('subscription.premium_member')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {t('subscription.thank_you.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[#C2C0B6] max-w-2xl mx-auto mb-2">
            {t('subscription.thank_you.subtitle')}
          </p>

          {/* Active Note */}
          <p className="text-sm text-[#56a69f] font-medium">
            {t('subscription.thank_you.active_note')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#1F1E1D] border border-[#262626] rounded-2xl p-6 hover:border-[#56a69f]/30 transition-all duration-300 group"
            >
              {/* Icon */}
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-[#56a69f] mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-white font-semibold text-lg mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-[#C2C0B6] text-sm mb-4 leading-relaxed">
                {feature.description}
              </p>

              {/* CTA Button */}
              <button
                onClick={() => navigate(feature.path)}
                className="w-full bg-[#56a69f]/10 text-[#56a69f] border border-[#56a69f]/20 px-4 py-2.5 rounded-lg hover:bg-[#56a69f] hover:text-white transition-all duration-300 font-medium flex items-center justify-center gap-2 group"
              >
                {feature.cta}
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-[#1F1E1D] border border-[#262626] text-white px-8 py-3 rounded-xl hover:border-[#56a69f]/30 transition-all duration-300 font-medium"
          >
            {t('subscription.thank_you.return_dashboard')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;







