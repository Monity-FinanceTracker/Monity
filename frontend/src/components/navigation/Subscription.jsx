import React, { useState, useEffect } from "react";
import { checkSubscription } from "../../utils/subscription";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { post } from "../../utils/api";

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
      )}
    </div>
  );
};

export default Subscription;
