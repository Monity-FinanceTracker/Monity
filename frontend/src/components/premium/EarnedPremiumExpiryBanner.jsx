import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { X, Clock, Sparkles, TrendingUp } from 'lucide-react';

/**
 * EarnedPremiumExpiryBanner
 *
 * Displays a persistent banner in the final 3 days before earned premium expires
 * Only shown for FREE tier users who have earned premium time from referrals
 */
export default function EarnedPremiumExpiryBanner() {
  const { user, subscriptionTier } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [hoursRemaining, setHoursRemaining] = useState(null);

  useEffect(() => {
    // Only show for FREE tier users
    if (subscriptionTier !== 'free') {
      return;
    }

    // Check if user has earned premium expiry date
    if (!user?.user_metadata?.premium_earned_expires_at) {
      return;
    }

    const calculateTimeRemaining = () => {
      const expiryDate = new Date(user.user_metadata.premium_earned_expires_at);
      const now = new Date();
      const diffMs = expiryDate - now;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      const diffHours = diffMs / (1000 * 60 * 60);

      // Only show if within 3 days and not expired
      if (diffDays > 0 && diffDays <= 3) {
        setDaysRemaining(Math.ceil(diffDays));
        setHoursRemaining(Math.ceil(diffHours));
      } else {
        setDaysRemaining(null);
        setHoursRemaining(null);
      }
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every hour
    const interval = setInterval(calculateTimeRemaining, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, [user, subscriptionTier]);

  // Don't show if dismissed or no days remaining
  if (dismissed || !daysRemaining) {
    return null;
  }

  // Determine banner style and message based on days remaining
  const getBannerConfig = () => {
    if (daysRemaining === 3) {
      return {
        icon: Clock,
        bgColor: 'bg-blue-600',
        hoverColor: 'hover:bg-blue-700',
        title: 'Seu Premium grátis expira em 3 dias!',
        subtitle: 'Adicione um cartão para continuar aproveitando todos os recursos.',
        ctaText: 'Assinar Premium'
      };
    } else if (daysRemaining === 2) {
      return {
        icon: TrendingUp,
        bgColor: 'bg-orange-600',
        hoverColor: 'hover:bg-orange-700',
        title: 'Últimos 2 dias de Premium!',
        subtitle: 'Não perca orçamentos ilimitados, metas e AI sem limites.',
        ctaText: 'Continuar Premium'
      };
    } else { // 1 day
      return {
        icon: Sparkles,
        bgColor: 'bg-red-600',
        hoverColor: 'hover:bg-red-700',
        title: 'Última chance! Premium expira amanhã.',
        subtitle: hoursRemaining <= 24 ? `Restam apenas ${hoursRemaining} horas. Assine agora e não perca acesso.` : 'Assine agora e mantenha todos os recursos premium.',
        ctaText: 'Assinar Agora'
      };
    }
  };

  const config = getBannerConfig();
  const Icon = config.icon;

  const handleSubscribe = () => {
    navigate('/subscription');
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in localStorage with expiry date
    // User will see banner again next time they reload
    const dismissalKey = `premium-expiry-dismissed-${user?.id}`;
    localStorage.setItem(dismissalKey, new Date().toISOString());
  };

  return (
    <div className={`${config.bgColor} text-white shadow-lg z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Left side: Icon + Message */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base">
                {config.title}
              </p>
              <p className="text-xs sm:text-sm text-white/90 mt-0.5">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Right side: CTA Button + Dismiss */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubscribe}
              className={`${config.hoverColor} bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 whitespace-nowrap`}
            >
              {config.ctaText}
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded transition-colors duration-200"
              title="Dispensar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
