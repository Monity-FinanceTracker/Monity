<<<<<<< HEAD
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { post } from "../../utils/api";
import { Card, Button, Heading, Text } from "../ui";
=======
import React, { useState, useEffect } from "react";
import { checkSubscription } from "../../utils/subscription";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { post } from "../../utils/api";
>>>>>>> 102c91444a80761fb6e3302869248d61f3a68bd8

const Subscription = () => {
  const { t } = useTranslation();
  const { subscriptionTier, refreshSubscription } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [justReturned, setJustReturned] = useState(false);

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

  // Detect checkout return via session_id in URL and force refresh subscription
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      setJustReturned(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("session_id");
      window.history.replaceState({}, document.title, url.toString());
      refreshSubscription({ force: true });
    }
  }, [refreshSubscription]);

  if (subscriptionTier === null) {
<<<<<<< HEAD
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
        <svg className="w-6 h-6 text-[#01C38D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L13 12l2.293 2.293a1 1 0 01-1.414 1.414L12 13.414l-2.293 2.293a1 1 0 01-1.414-1.414L10.586 12 8.293 9.707a1 1 0 011.414-1.414L12 10.586l2.293-2.293a1 1 0 011.414 0z" />
        </svg>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L13 12l2.293 2.293a1 1 0 01-1.414 1.414L12 13.414l-2.293 2.293a1 1 0 01-1.414-1.414L10.586 12 8.293 9.707a1 1 0 011.414-1.414L12 10.586l2.293-2.293a1 1 0 011.414 0z" />
                </svg>
              ) : null
            }
          >
            {isUpgrading
              ? t("subscription.upgrading")
              : t("subscription.upgrade_button")}
          </Button>
        </div>
=======
    return <div className="text-white">{t("subscription.loading")}</div>;
  }

  return (
    <div className="bg-[#23263a] p-4 md:p-6 rounded-xl shadow-lg text-white">
      <h2 className="text-xl md:text-2xl font-bold mb-4">
        {t("subscription.title")}
      </h2>
      <p className="text-md md:text-lg">
        {t("subscription.current_plan")}:{" "}
        <strong className="capitalize text-[#01C38D]">
          {subscriptionTier}
        </strong>
      </p>
      {justReturned && (
        <p className="mt-2 text-sm text-gray-300">
          {t("subscription.refreshing_status") ||
            "Refreshing your subscription status..."}
        </p>
      )}
      {subscriptionTier === "free" && (
        <button
          className="mt-6 w-full md:w-auto bg-gradient-to-r from-[#01C38D] to-[#01C38D]/80 text-white font-bold py-3 px-6 rounded-lg hover:from-[#01C38D]/90 hover:to-[#01C38D]/70 transition-all disabled:opacity-50"
          onClick={handleUpgrade}
          disabled={isUpgrading}
        >
          {isUpgrading
            ? t("subscription.upgrading")
            : t("subscription.upgrade_button")}
        </button>
>>>>>>> 102c91444a80761fb6e3302869248d61f3a68bd8
      )}
    </Card>
  );
};

<<<<<<< HEAD
export default Subscription;
=======
export default Subscription;
>>>>>>> 102c91444a80761fb6e3302869248d61f3a68bd8
