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

  const refreshSubscription = useCallback(async (options = {}) => {
    if (subscriptionCheckPromise) {
      return subscriptionCheckPromise;
    }
    subscriptionCheckPromise = (async () => {
      try {
        // Force refresh subscription when called for a new user
        const tier = await checkSubscription({ ...options, force: true });
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
        await refreshSubscription();
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
        
        // Clear all caches when user changes (including switching between accounts)
        if (previousUser?.id !== currentUser?.id) {
          clearSubscriptionCache();
          queryClient.clear(); // Clear React Query cache
          console.log('🧹 Cleared all caches due to user change');
        }
        
        return currentUser;
      });
      
      setIsAdmin(currentUser?.user_metadata?.role === "admin");

      if (currentUser) {
        refreshSubscription();
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
    
    // Clear caches to ensure fresh data for the new user
    clearSubscriptionCache();
    queryClient.clear();
    
    await refreshSubscription();
  };

  const signup = async (name, email, password, role = "user") => {
    try {
      const response = await API.post('/auth/register', {
        email,
        password,
        name,
        role,
      });

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
        queryClient.clear();
        await refreshSubscription();
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

  const resendConfirmationEmail = async (email) => {
    try {
      const response = await API.post('/auth/resend-confirmation', { email });
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

  const logout = async () => {
    clearSubscriptionCache();
    queryClient.clear();
    await supabase.auth.signOut();
    setUser(null);
  };

  const checkEmailVerification = async (email) => {
    try {
      const response = await API.get('/auth/check-verification', {
        params: { email },
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
export { useAuth } from './useAuth';
