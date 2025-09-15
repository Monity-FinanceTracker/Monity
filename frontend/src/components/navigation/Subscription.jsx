import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { post } from "../../utils/api";
import { Card, Button, Heading, Text } from "../ui";
import { Sparkles } from "lucide-react";

const Subscription = () => {
  const { t } = useTranslation();
  const { subscriptionTier, refreshSubscription } = useAuth();
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

  if (subscriptionTier === null) {
    return (
      <Card>
        <Text variant="muted">{t("subscription.loading")}</Text>
      </Card>
    );
  }

  return (
    <Card 
      title={t("subscription.title")}
      icon={
        <Sparkles className="w-6 h-6 text-[#01C38D]" />
      }
      className="space-y-6"
    >
      <div className="space-y-4">
        <Text size="lg">
          {t("subscription.current_plan")}:{" "}
          <Text as="span" variant="accent" weight="semibold" className="capitalize">
            {subscriptionTier}
          </Text>
        </Text>

        {subscriptionTier === "premium" && (
          <div className="bg-[#01C38D]/10 border border-[#01C38D]/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#01C38D]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <Text variant="accent" weight="medium">
                Premium features activated
              </Text>
            </div>
          </div>
        )}
      </div>

      {subscriptionTier === "free" && (
        <div className="space-y-4">
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
            <Text size="sm" variant="warning">
              Upgrade to Premium for advanced features like AI categorization, detailed analytics, and more!
            </Text>
          </div>
          
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isUpgrading}
            disabled={isUpgrading}
            onClick={handleUpgrade}
            leftIcon={
              !isUpgrading ? (
                <Sparkles className="w-5 h-5" />
              ) : null
            }
          >
            {isUpgrading
              ? t("subscription.upgrading")
              : t("subscription.upgrade_button")}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default Subscription;