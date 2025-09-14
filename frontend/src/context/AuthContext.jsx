import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../utils/supabase";
import { checkSubscription, clearSubscriptionCache } from "../utils/subscription";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

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
      setUser(currentUser);
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
    await refreshSubscription();
  };

  const signup = async (name, email, password, role = "user") => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const logout = async () => {
    // Clear subscription cache before logging out
    clearSubscriptionCache();
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
