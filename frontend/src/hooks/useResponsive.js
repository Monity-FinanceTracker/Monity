import { useState, useEffect } from 'react';

/**
 * Responsive hooks for detecting screen sizes and breakpoints
 * Performance optimized with proper cleanup and debouncing
 */

// Breakpoint values (matching Tailwind CSS)
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// Hook to get current breakpoint
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('base');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('base');
      }
    };

    // Set initial breakpoint
    handleResize();

    // Debounced resize handler for better performance
    let timeoutId;
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return breakpoint;
};

// Hook to check if screen is above a certain breakpoint
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

// Hook for common responsive checks
export const useResponsive = () => {
  const breakpoint = useBreakpoint();
  
  return {
    breakpoint,
    isMobile: breakpoint === 'base',
    isTablet: breakpoint === 'sm' || breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isSmallScreen: breakpoint === 'base' || breakpoint === 'sm',
    isLargeScreen: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    
    // Specific breakpoint checks
    isAboveSm: ['sm', 'md', 'lg', 'xl', '2xl'].includes(breakpoint),
    isAboveMd: ['md', 'lg', 'xl', '2xl'].includes(breakpoint),
    isAboveLg: ['lg', 'xl', '2xl'].includes(breakpoint),
    isAboveXl: ['xl', '2xl'].includes(breakpoint),
    
    // Touch device detection
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    // Orientation (for mobile devices)
    isLandscape: window.innerWidth > window.innerHeight,
    isPortrait: window.innerWidth <= window.innerHeight
  };
};

// Hook for responsive values
export const useResponsiveValue = (values) => {
  const { breakpoint } = useResponsive();
  
  // Values should be an object like { base: 1, md: 2, lg: 3 }
  const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'base'];
  
  for (const bp of breakpointOrder) {
    if (values[bp] !== undefined) {
      if (bp === breakpoint || breakpointOrder.indexOf(breakpoint) < breakpointOrder.indexOf(bp)) {
        return values[bp];
      }
    }
  }
  
  return values.base || values[Object.keys(values)[0]];
};

// Hook for container queries (experimental)
export const useContainerQuery = (containerRef, query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const checkQuery = () => {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      // Simple width-based container query
      if (query.includes('min-width')) {
        const minWidth = parseInt(query.match(/min-width:\s*(\d+)px/)?.[1] || '0');
        setMatches(rect.width >= minWidth);
      } else if (query.includes('max-width')) {
        const maxWidth = parseInt(query.match(/max-width:\s*(\d+)px/)?.[1] || '9999');
        setMatches(rect.width <= maxWidth);
      }
    };

    checkQuery();

    const resizeObserver = new ResizeObserver(checkQuery);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, query]);

  return matches;
};
