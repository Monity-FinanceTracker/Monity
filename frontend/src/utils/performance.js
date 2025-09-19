/**
 * Performance monitoring utilities
 * Helps track and optimize application performance
 */

// Performance observer for measuring component render times
export const measureComponentRender = (componentName, renderFn) => {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    
    if (endTime - startTime > 16) { // Only log if render takes more than 16ms (60fps threshold)
      console.log(`🐌 Slow render: ${componentName} took ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    return result;
  }
  return renderFn();
};

// Web Vitals monitoring - temporarily disabled to prevent errors
export const reportWebVitals = (onPerfEntry) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals monitoring temporarily disabled');
    return;
  }
  
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then((webVitals) => {
      try {
        // Use the correct API for web-vitals v5+
        const { onCLS, onFID, onFCP, onLCP, onTTFB } = webVitals;
        onCLS(onPerfEntry);
        onFID(onPerfEntry);
        onFCP(onPerfEntry);
        onLCP(onPerfEntry);
        onTTFB(onPerfEntry);
      } catch (error) {
        console.warn('Error initializing Web Vitals:', error);
      }
    }).catch((error) => {
      console.warn('Web Vitals not available:', error);
    });
  }
};

// Memory usage monitoring
export const logMemoryUsage = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = performance.memory;
    console.log('📊 Memory Usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
    });
  }
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // Log the approximate size of major dependencies
    console.log('📦 Major Dependencies:');
    console.log('- React:', typeof React !== 'undefined' ? '✅' : '❌');
    console.log('- React Router:', typeof window?.history?.pushState !== 'undefined' ? '✅' : '❌');
    console.log('- React Query:', typeof window?.ReactQuery !== 'undefined' ? '✅' : '❌');
  }
};

// Performance timing helper
export const withTiming = (label, fn) => {
  if (process.env.NODE_ENV === 'development') {
    console.time(label);
    const result = fn();
    console.timeEnd(label);
    return result;
  }
  return fn();
};
