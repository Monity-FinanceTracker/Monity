import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { post } from "../../utils/api";
import { FiCheck, FiZap, FiMessageSquare, FiTrendingUp, FiTarget, FiPieChart, FiLock, FiStar } from "react-icons/fi";

const Subscription = () => {
  const { subscriptionTier } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const priceId =
        import.meta.env.VITE_STRIPE_PRICE_PREMIUM_MONTHLY ||
        import.meta.env.VITE_STRIPE_PRICE_ID;
      if (!priceId) {
        throw new Error(
          "Missing Stripe price ID. Set VITE_STRIPE_PRICE_PREMIUM_MONTHLY in .env"
        );
      }
      const { data } = await post("/billing/create-checkout-session", {
        priceId,
      });
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (error) {
      console.error("Upgrade failed", error);
      alert(error.message || "Failed to start checkout");
    } finally {
      setIsUpgrading(false);
    }
  };

  const features = [
    {
      icon: <FiMessageSquare className="w-6 h-6" />,
      title: "Unlimited AI Financial Assistant",
      description: "Get personalized advice anytime, no daily limits",
      free: "3 messages/day",
      premium: "Unlimited"
    },
    {
      icon: <FiTarget className="w-6 h-6" />,
      title: "Unlimited Budgets & Goals",
      description: "Create as many budgets and savings goals as you need",
      free: "2 budgets, 2 goals",
      premium: "Unlimited"
    },
    {
      icon: <FiTrendingUp className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Deep insights into your spending patterns and trends",
      free: "Basic stats",
      premium: "Full insights"
    },
    {
      icon: <FiPieChart className="w-6 h-6" />,
      title: "Smart Categorization",
      description: "AI-powered transaction categorization that learns from you",
      free: "Manual only",
      premium: "AI-powered"
    },
    {
      icon: <FiZap className="w-6 h-6" />,
      title: "Priority Features",
      description: "Early access to new features and faster processing",
      free: "Standard",
      premium: "Priority"
    },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: "Export & Backup",
      description: "Download your financial data anytime in CSV or PDF",
      free: "Limited",
      premium: "Full access"
    }
  ];

  if (subscriptionTier === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
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
              {subscriptionTier === 'premium' ? 'Premium Member' : 'Upgrade Available'}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {subscriptionTier === 'premium'
              ? 'You\'re on Premium!'
              : 'Take Control of Your Finances'
            }
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {subscriptionTier === 'premium'
              ? 'Enjoy unlimited access to all Monity features and AI-powered insights.'
              : 'Unlock powerful tools and insights to reach your financial goals faster.'
            }
          </p>
        </div>

        {/* Current Plan Badge */}
        {subscriptionTier === 'premium' && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-gradient-to-r from-[#01C38D]/20 to-[#01a87a]/20 border border-[#01C38D]/30 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#01C38D] rounded-full flex items-center justify-center">
                  <FiCheck className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">Premium Active</h3>
                  <p className="text-gray-300 text-sm">You have full access to all features</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <div className="text-gray-500 mb-1">Free</div>
                  <div className="text-gray-400">{feature.free}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 mb-1">Premium</div>
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
                Ready to level up your finances?
              </h2>
              <p className="text-gray-300 mb-6">
                Join thousands of users managing their money smarter with Premium.
              </p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">$9.99</div>
                  <div className="text-gray-400 text-sm">per month</div>
                </div>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="bg-gradient-to-r from-[#01C38D] to-[#01a87a] text-white font-semibold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-[#01C38D]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto inline-flex items-center justify-center gap-2 text-lg"
              >
                {isUpgrading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiZap />
                    Upgrade to Premium
                  </>
                )}
              </button>

              <p className="text-gray-500 text-xs mt-4">
                Cancel anytime. No hidden fees.
              </p>
            </div>
          </div>
        )}

        {/* FAQ or Additional Info */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Have questions? Contact us at <a href="mailto:support@monity.app" className="text-[#01C38D] hover:underline">support@monity.app</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;