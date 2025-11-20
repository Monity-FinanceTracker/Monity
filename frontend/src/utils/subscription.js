import { get } from "./api";
import { supabase } from "./supabase";

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
 * @param {Object} options - Options for the subscription check
 * @param {boolean} options.force - Force a fresh fetch from API (bypass cache)
 * @param {Object|null} options.user - Current user object (optional, avoids redundant getSession call)
 * @returns {Promise<string>} A promise that resolves with the user's subscription tier.
 */
export const checkSubscription = async (options = {}) => {
  const { force = false, user = null } = options;
  const now = Date.now();

  // If user parameter provided and is null, return free immediately (faster than getSession)
  if (user === null && Object.hasOwn(options, 'user')) {
    subscriptionCache = "free";
    cacheTimestamp = now;
    return "free";
  }

  // Only check session if user wasn't provided
  if (!user) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        subscriptionCache = "free";
        cacheTimestamp = now;
        return "free";
      }
    } catch (sessionError) {
      console.warn("Failed to read Supabase session for subscription check:", sessionError);
      subscriptionCache = "free";
      cacheTimestamp = now;
      return "free";
    }
  }
  
  // Note: Development mode override removed to allow premium testing
  // Uncomment the block below if you need to force free tier in development
  /*
  if (process.env.NODE_ENV === 'development') {
    console.log('Subscription check temporarily disabled in development');
    subscriptionCache = "free";
    cacheTimestamp = now;
    return "free";
  }
  */
  
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
