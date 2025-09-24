/**
 * Modal utilities for proper modal behavior
 */

/**
 * Lock body scroll when modal is open
 */
export const lockBodyScroll = () => {
  document.body.classList.add('modal-open');
};

/**
 * Unlock body scroll when modal is closed
 */
export const unlockBodyScroll = () => {
  document.body.classList.remove('modal-open');
};

/**
 * Handle modal open/close with scroll locking
 */
export const useModalScrollLock = (isOpen) => {
  React.useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }

    // Cleanup on unmount
    return () => {
      unlockBodyScroll();
    };
  }, [isOpen]);
};

/**
 * Get the current viewport height accounting for mobile browsers
 */
export const getViewportHeight = () => {
  return Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0
  );
};

/**
 * Check if element is in viewport
 */
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= getViewportHeight() &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Scroll element into view if needed
 */
export const scrollIntoViewIfNeeded = (element) => {
  if (element && !isInViewport(element)) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }
};

export default {
  lockBodyScroll,
  unlockBodyScroll,
  useModalScrollLock,
  getViewportHeight,
  isInViewport,
  scrollIntoViewIfNeeded
};
