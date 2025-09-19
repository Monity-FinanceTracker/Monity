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
  
  // Temporarily return 'free' to prevent API errors during development
  if (process.env.NODE_ENV === 'development') {
    console.log('Subscription check temporarily disabled in development');
    subscriptionCache = "free";
    cacheTimestamp = now;
    return "free";
  }
  
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
    // Handle different types of errors gracefully
    if (error.response?.status === 401) {
      console.warn("User not authenticated for subscription check");
    } else if (error.response?.status === 404) {
      console.warn("User profile not found for subscription check");
    } else if (error.response?.status === 500) {
      console.warn("Server error fetching subscription status");
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.warn("Network error fetching subscription status");
    } else {
      console.error("Failed to fetch subscription status:", error.message || error);
    }
    
    // Cache 'free' on error to prevent repeated failed requests
    subscriptionCache = "free"; 
    cacheTimestamp = now;
    return "free";
  }
};
