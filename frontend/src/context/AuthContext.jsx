import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabase";
import { checkSubscription, clearSubscriptionCache } from "../utils/subscription";
import { queryClient } from "../lib/queryClient";
import { AuthContext } from "./useAuth";
import API from "../utils/api";

let subscriptionCheckPromise = null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState("free");

  const refreshSubscription = useCallback(async (currentUser = null, options = {}) => {
    if (subscriptionCheckPromise) {
      return subscriptionCheckPromise;
    }
    subscriptionCheckPromise = (async () => {
      try {
        // Force refresh subscription when called for a new user
        // Pass user to avoid redundant getSession() calls
        const tier = await checkSubscription({ ...options, user: currentUser, force: true });
        setSubscriptionTier(tier);
        return tier;
      } catch (error) {
        console.error("Failed to refresh subscription tier:", error);
        setSubscriptionTier("free");
        return "free";
      } finally {
        subscriptionCheckPromise = null;
      }
    })();
    return subscriptionCheckPromise;
  }, []);

  useEffect(() => {
    const setInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(currentUser?.user_metadata?.role === "admin");

      if (currentUser) {
        await refreshSubscription(currentUser);
      } else {
        // Ensure cache is cleared on initial load if no user
        clearSubscriptionCache();
        setSubscriptionTier("free");
      }
      setLoading(false);
    };

    setInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      
      setUser(prevUser => {
        const previousUser = prevUser;

        // Clear user-specific caches when user changes (including switching between accounts)
        if (previousUser?.id !== currentUser?.id) {
          clearSubscriptionCache();
          // Remove queries instead of clearing everything - gentler on the cache
          queryClient.removeQueries();
          console.log('🧹 Cleared user-specific caches due to user change');
        }

        return currentUser;
      });

      setIsAdmin(currentUser?.user_metadata?.role === "admin");

      if (currentUser) {
        refreshSubscription(currentUser);
      } else {
        // Clear subscription cache when user logs out
        clearSubscriptionCache();
        setSubscriptionTier("free");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshSubscription]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }

    // Clear caches to ensure fresh data for the new user
    clearSubscriptionCache();
    queryClient.removeQueries(); // Remove queries instead of clearing everything

    const currentUser = data?.session?.user ?? null;
    await refreshSubscription(currentUser);
  };

  const signup = async (name, email, password, referralCode = null, role = "user") => {
    try {
      const requestBody = {
        email,
        password,
        name,
        role,
      };

      // Add referral code if provided
      if (referralCode && referralCode.trim().length > 0) {
        requestBody.referralCode = referralCode.trim().toUpperCase();
      }

      const response = await API.post('/auth/register', requestBody);

      if (response.data.requiresEmailConfirmation) {
        return {
          success: true,
          user: response.data.user,
          requiresEmailConfirmation: true,
          message: response.data.message,
        };
      }

      if (response.data.user && response.data.session) {
        await supabase.auth.setSession({
          access_token: response.data.session.access_token,
          refresh_token: response.data.session.refresh_token,
        });

        clearSubscriptionCache();
        queryClient.removeQueries(); // Remove queries instead of clearing everything

        // Get the user from the session we just set
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        await refreshSubscription(currentUser);
      }

      return {
        success: true,
        user: response.data.user,
        requiresEmailConfirmation: false,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Erro ao criar conta';
      return { success: false, error: errorMessage };
    }
  };

  const resendConfirmationEmail = async (emailParam) => {
    const targetEmail = emailParam || user?.email;

    if (!targetEmail) {
      return { success: false, error: 'Email não disponível' };
    }

    try {
      const response = await API.post('/auth/resend-confirmation', { email: targetEmail });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Erro ao reenviar email';
      return { success: false, error: errorMessage };
    }
  };

  const isEmailConfirmed = () => {
    if (!user) return false;
    return user.email_confirmed_at != null;
  };

  const sendPasswordResetEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to send password reset email' };
    }
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const checkEmailVerification = async (emailParam) => {
    const targetEmail = emailParam || user?.email;

    if (!targetEmail) {
      return { success: false, error: 'Email não disponível', verified: false };
    }

    try {
      const response = await API.get('/auth/check-verification', {
        params: { email: targetEmail },
      });
      return {
        success: true,
        verified: response.data?.verified || false,
        data: response.data,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Erro ao verificar email';
      return { success: false, error: errorMessage, verified: false };
    }
  };

  const logout = async () => {
    clearSubscriptionCache();
    queryClient.clear();
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAdmin,
    subscriptionTier,
    login,
    signup,
    logout,
    refreshSubscription,
    resendConfirmationEmail,
    checkEmailVerification,
    isEmailConfirmed,
    sendPasswordResetEmail,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Re-export useAuth hook for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from './useAuth';
