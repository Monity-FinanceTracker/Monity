import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FaTimes, FaLightbulb } from 'react-icons/fa';

/**
 * FeatureDiscoveryTooltips System
 *
 * Progressive disclosure of features over the first week
 * Includes:
 * - useFeatureDiscovery hook for tracking feature discovery
 * - FeatureTooltip component for displaying tooltips
 * - PulsingBadge component for feature indicators
 */

// Feature discovery schedule (days after signup)
export const FEATURE_SCHEDULE = {
  // Day 0-1: Core features
  dashboard_overview: { day: 0, priority: 1 },
  add_transaction: { day: 0, priority: 2 },

  // Day 2: Organization features
  budgets: { day: 2, priority: 1 },
  categories: { day: 2, priority: 2 },

  // Day 3-4: Advanced features
  savings_goals: { day: 3, priority: 1 },
  financial_health: { day: 4, priority: 1 },

  // Day 5-6: Collaborative features
  groups: { day: 5, priority: 1 },
  ai_assistant: { day: 6, priority: 1 },

  // Day 7: Premium features
  cashflow: { day: 7, priority: 1 },
  premium_features: { day: 7, priority: 2 },
};

/**
 * Hook to manage feature discovery state
 */
export const useFeatureDiscovery = () => {
  const [discoveredFeatures, setDiscoveredFeatures] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [userSignupDate, setUserSignupDate] = useState(null);

  useEffect(() => {
    fetchDiscoveredFeatures();
  }, []);

  const fetchDiscoveredFeatures = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Fetch feature discovery data
      const response = await fetch('/api/features/discovered', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Convert array to object for easier lookup
        const featuresMap = {};
        data.features?.forEach(feature => {
          featuresMap[feature.feature_name] = {
            discovered_at: feature.discovered_at,
            interaction_count: feature.interaction_count
          };
        });

        setDiscoveredFeatures(featuresMap);
        setUserSignupDate(data.signup_date);
      }
    } catch (error) {
      console.error('Error fetching feature discovery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markFeatureDiscovered = async (featureName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/features/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ feature_name: featureName })
      });

      if (response.ok) {
        setDiscoveredFeatures(prev => ({
          ...prev,
          [featureName]: {
            discovered_at: new Date().toISOString(),
            interaction_count: 1
          }
        }));

        // Track analytics
        if (window.analytics && typeof window.analytics.track === 'function') {
          window.analytics.track('feature_discovered', {
            feature_name: featureName
          });
        }
      }
    } catch (error) {
      console.error('Error marking feature discovered:', error);
    }
  };

  const isFeatureDiscovered = (featureName) => {
    return !!discoveredFeatures[featureName];
  };

  const shouldShowFeature = (featureName) => {
    // Already discovered - don't show
    if (isFeatureDiscovered(featureName)) {
      return false;
    }

    // No signup date - don't show
    if (!userSignupDate) {
      return false;
    }

    // Check if feature is scheduled
    const schedule = FEATURE_SCHEDULE[featureName];
    if (!schedule) {
      return false;
    }

    // Calculate days since signup
    const daysSinceSignup = Math.floor(
      (Date.now() - new Date(userSignupDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Show if we're on or past the scheduled day
    return daysSinceSignup >= schedule.day;
  };

  return {
    discoveredFeatures,
    isLoading,
    markFeatureDiscovered,
    isFeatureDiscovered,
    shouldShowFeature
  };
};

/**
 * Pulsing Badge Component
 * Shows a pulsing indicator for undiscovered features
 */
export const PulsingBadge = ({ show = true }) => {
  if (!show) return null;

  return (
    <motion.div
      className="absolute -top-1 -right-1 w-3 h-3 bg-[#56a69f] rounded-full"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <motion.div
        className="absolute inset-0 bg-[#56a69f] rounded-full"
        animate={{
          scale: [1, 1.5, 2],
          opacity: [0.5, 0.3, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut'
        }}
      />
    </motion.div>
  );
};

/**
 * Feature Tooltip Component
 * Displays a tooltip with feature information
 */
export const FeatureTooltip = ({
  featureName,
  title,
  description,
  targetRef,
  onDismiss,
  position = 'right'
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!targetRef?.current || !tooltipRef.current) return;

    const updatePosition = () => {
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (position) {
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + 12;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left - tooltipRect.width - 12;
          break;
        case 'top':
          top = targetRect.top - tooltipRect.height - 12;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = targetRect.bottom + 12;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        default:
          break;
      }

      // Ensure tooltip stays within viewport
      const padding = 16;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = window.innerHeight - tooltipRect.height - padding;
      }

      setTooltipPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [targetRef, position]);

  const handleDismiss = () => {
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('feature_tooltip_dismissed', {
        feature_name: featureName
      });
    }
    onDismiss?.();
  };

  return createPortal(
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        zIndex: 9998
      }}
      className="max-w-xs"
    >
      {/* Arrow indicator */}
      <div
        className={`absolute w-3 h-3 bg-gradient-to-br from-[#56a69f] to-[#4a8f89] transform rotate-45 ${
          position === 'right' ? '-left-1.5 top-1/2 -translate-y-1/2' :
          position === 'left' ? '-right-1.5 top-1/2 -translate-y-1/2' :
          position === 'top' ? 'left-1/2 -translate-x-1/2 -bottom-1.5' :
          'left-1/2 -translate-x-1/2 -top-1.5'
        }`}
      />

      {/* Tooltip content */}
      <div className="bg-gradient-to-br from-[#56a69f] to-[#4a8f89] rounded-lg shadow-2xl p-4 border-2 border-[#56a69f]">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <FaLightbulb className="text-yellow-300 text-lg flex-shrink-0" />
            <h4 className="text-white font-semibold text-sm">
              {title}
            </h4>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors ml-2 flex-shrink-0"
          >
            <FaTimes size={14} />
          </button>
        </div>
        <p className="text-white/90 text-xs leading-relaxed">
          {description}
        </p>
        <div className="mt-3 pt-3 border-t border-white/20">
          <button
            onClick={handleDismiss}
            className="text-xs text-white font-medium hover:underline"
          >
            Entendi!
          </button>
        </div>
      </div>
    </motion.div>,
    document.body
  );
};

/**
 * Feature Discovery Manager Component
 * Manages the display of tooltips based on schedule
 */
export const FeatureDiscoveryManager = ({ children }) => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const { shouldShowFeature, markFeatureDiscovered } = useFeatureDiscovery();

  // Check for features to show on mount and periodically
  useEffect(() => {
    const checkForFeatures = () => {
      // Find highest priority undiscovered feature that should show
      let featureToShow = null;
      let highestPriority = Infinity;

      Object.keys(FEATURE_SCHEDULE).forEach(featureName => {
        if (shouldShowFeature(featureName)) {
          const priority = FEATURE_SCHEDULE[featureName].priority;
          if (priority < highestPriority) {
            highestPriority = priority;
            featureToShow = featureName;
          }
        }
      });

      if (featureToShow && !activeTooltip) {
        setActiveTooltip(featureToShow);
      }
    };

    checkForFeatures();

    // Check every 5 minutes
    const interval = setInterval(checkForFeatures, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [shouldShowFeature, activeTooltip]);

  const handleDismissTooltip = () => {
    if (activeTooltip) {
      markFeatureDiscovered(activeTooltip);
      setActiveTooltip(null);
    }
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {activeTooltip && (
          <div>
            {/* Tooltips will be rendered by individual components using the FeatureTooltip component */}
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * HOC to wrap components with feature discovery
 */
export const withFeatureDiscovery = (Component, featureName, tooltipConfig) => {
  return (props) => {
    const elementRef = useRef(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const { shouldShowFeature, markFeatureDiscovered, isFeatureDiscovered } = useFeatureDiscovery();

    useEffect(() => {
      // Show tooltip after a short delay if feature should be shown
      if (shouldShowFeature(featureName)) {
        const timer = setTimeout(() => {
          setShowTooltip(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [shouldShowFeature, featureName]);

    const handleDismiss = () => {
      setShowTooltip(false);
      markFeatureDiscovered(featureName);
    };

    const handleClick = () => {
      if (!isFeatureDiscovered(featureName)) {
        markFeatureDiscovered(featureName);
      }
      setShowTooltip(false);
    };

    return (
      <div ref={elementRef} onClick={handleClick} className="relative">
        <Component {...props} />

        {/* Pulsing badge */}
        <PulsingBadge show={shouldShowFeature(featureName) && !isFeatureDiscovered(featureName)} />

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && tooltipConfig && (
            <FeatureTooltip
              featureName={featureName}
              targetRef={elementRef}
              onDismiss={handleDismiss}
              {...tooltipConfig}
            />
          )}
        </AnimatePresence>
      </div>
    );
  };
};

export default {
  useFeatureDiscovery,
  PulsingBadge,
  FeatureTooltip,
  FeatureDiscoveryManager,
  withFeatureDiscovery,
  FEATURE_SCHEDULE
};
