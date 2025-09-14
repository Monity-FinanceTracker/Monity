import { get } from "./api";

let subscriptionCache = null;
let cacheTimestamp = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Clears the subscription cache. Should be called when user logs out.
 */
export const clearSubscriptionCache = () => {
  subscriptionCache = null;
  cacheTimestamp = null;
};

/**
 * Checks the subscription status of the current user.
 *
 * @returns {Promise<string>} A promise that resolves with the user's subscription tier.
 */
export const checkSubscription = async (options = {}) => {
  const { force = false } = options;
  const now = Date.now();
  if (
    !force &&
    subscriptionCache &&
    cacheTimestamp &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return subscriptionCache;
  }

  try {
    const response = await get("/subscription-tier");
    const tier = response.data.subscription_tier || "free";
    subscriptionCache = tier;
    cacheTimestamp = now;
    return tier;
  } catch (error) {
    console.error("Failed to fetch subscription status:", error);
    subscriptionCache = "free"; // Cache 'free' on error to prevent repeated failed requests
    cacheTimestamp = now;
    return "free";
  }
};
