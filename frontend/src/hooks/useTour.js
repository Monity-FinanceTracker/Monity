import { useState, useEffect, useCallback } from 'react';

/**
 * useTour Hook
 * Manages the state of the interactive tour
 * Tracks completion status in localStorage
 */

const TOUR_STORAGE_KEY = 'monity_tour_completed';
const TOUR_SKIPPED_KEY = 'monity_tour_skipped';

export const useTour = () => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [tourSkipped, setTourSkipped] = useState(false);

  // Check if tour should be shown
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
    const skipped = localStorage.getItem(TOUR_SKIPPED_KEY) === 'true';
    
    setTourCompleted(completed);
    setTourSkipped(skipped);
    
    // Don't show tour if already completed or skipped
    if (completed || skipped) {
      setIsTourActive(false);
    }
  }, []);

  // Start the tour
  const startTour = useCallback(() => {
    setIsTourActive(true);
    
    // Track tour start
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('interactive_tour_started', {
        started_at: new Date().toISOString()
      });
    }
  }, []);

  // Complete the tour
  const completeTour = useCallback(() => {
    setIsTourActive(false);
    setTourCompleted(true);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    
    // Track tour completion
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('interactive_tour_completed', {
        completed_at: new Date().toISOString()
      });
    }
  }, []);

  // Skip the tour
  const skipTour = useCallback(() => {
    setIsTourActive(false);
    setTourSkipped(true);
    localStorage.setItem(TOUR_SKIPPED_KEY, 'true');
    
    // Track tour skip
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('interactive_tour_skipped', {
        skipped_at: new Date().toISOString()
      });
    }
  }, []);

  // Reset tour (for testing/debugging)
  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    localStorage.removeItem(TOUR_SKIPPED_KEY);
    setTourCompleted(false);
    setTourSkipped(false);
    setIsTourActive(false);
  }, []);

  // Check if tour should be shown (not completed and not skipped)
  const shouldShowTour = !tourCompleted && !tourSkipped;

  return {
    isTourActive,
    tourCompleted,
    tourSkipped,
    shouldShowTour,
    startTour,
    completeTour,
    skipTour,
    resetTour
  };
};

export default useTour;



