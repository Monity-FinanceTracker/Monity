import { useState } from 'react';
import { useAuth } from '../context/useAuth';

export const useRequireAuth = () => {
  const { user } = useAuth();
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);

  const requireAuth = (callback) => {
    return (...args) => {
      if (!user) {
        setShowAuthOverlay(true);
        return;
      }

      if (callback) {
        return callback(...args);
      }
    };
  };

  const isAuthenticated = () => {
    return !!user;
  };

  return {
    requireAuth,
    isAuthenticated,
    showAuthOverlay,
    setShowAuthOverlay,
    user
  };
};

