/**
 * CLS (Cumulative Layout Shift) Optimization Utilities
 * Helps prevent layout shifts and improve Core Web Vitals
 */

/**
 * Prevent layout shift by reserving space for dynamic content
 */
export const reserveSpace = (element, width, height) => {
  if (element && width && height) {
    element.style.minWidth = `${width}px`;
    element.style.minHeight = `${height}px`;
    element.style.contain = 'layout';
  }
};

/**
 * Add skeleton loading to prevent content shift
 */
export const addSkeletonLoading = (container, skeletonHtml) => {
  if (container) {
    container.innerHTML = skeletonHtml;
    container.classList.add('loading-container');
  }
};

/**
 * Remove skeleton and add real content with smooth transition
 */
export const replaceSkeletonContent = (container, realContent) => {
  if (container) {
    container.classList.remove('loading-container');
    container.innerHTML = realContent;
    container.classList.add('fade-in');
  }
};

/**
 * Preload images to prevent layout shift
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images
 */
export const preloadImages = async (srcs) => {
  try {
    await Promise.all(srcs.map(preloadImage));
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
};

/**
 * Add layout containment to prevent shifts
 */
export const addLayoutContainment = (element, type = 'layout') => {
  if (element) {
    element.style.contain = type;
    element.style.willChange = 'contents';
  }
};

/**
 * Measure element dimensions to reserve space
 */
export const measureAndReserveSpace = (element) => {
  if (!element) return { width: 0, height: 0 };
  
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  
  return {
    width: rect.width,
    height: rect.height,
    marginTop: parseFloat(computedStyle.marginTop) || 0,
    marginBottom: parseFloat(computedStyle.marginBottom) || 0,
    marginLeft: parseFloat(computedStyle.marginLeft) || 0,
    marginRight: parseFloat(computedStyle.marginRight) || 0,
  };
};

/**
 * Create a stable placeholder for dynamic content
 */
export const createStablePlaceholder = (width, height, className = '') => {
  const placeholder = document.createElement('div');
  placeholder.style.width = `${width}px`;
  placeholder.style.height = `${height}px`;
  placeholder.style.contain = 'layout';
  placeholder.style.minWidth = `${width}px`;
  placeholder.style.minHeight = `${height}px`;
  
  if (className) {
    placeholder.className = className;
  }
  
  return placeholder;
};

/**
 * Prevent layout shift from font loading
 */
export const preventFontLayoutShift = () => {
  // Font optimization is already handled by the Google Fonts import with display=swap
  // No additional font-display optimization needed
};

/**
 * Monitor and log CLS events for debugging
 */
export const monitorCLSEvents = () => {
  if ('PerformanceObserver' in window) {
    let clsValue = 0;
    const clsEntries = [];
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push({
            value: entry.value,
            timestamp: entry.startTime,
            sources: entry.sources?.map(source => ({
              node: source.node?.tagName || 'unknown',
              className: source.node?.className || '',
              previousRect: source.previousRect,
              currentRect: source.currentRect
            })) || []
          });
        }
      });
      
      // Log detailed CLS information
      if (clsValue > 0.1) {
        console.group(`CLS Event: ${clsValue.toFixed(4)}`);
        console.log('Total CLS Value:', clsValue);
        console.log('Recent Entries:', clsEntries.slice(-3));
        console.log('All Entries:', clsEntries);
        console.groupEnd();
      }
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
    
    return {
      getCLSValue: () => clsValue,
      getCLSEntries: () => clsEntries,
      reset: () => {
        clsValue = 0;
        clsEntries.length = 0;
      }
    };
  }
  
  return null;
};

/**
 * Optimize component mounting to prevent layout shifts
 */
export const optimizeComponentMount = (componentRef, options = {}) => {
  const {
    minHeight = 100,
    minWidth = 'auto',
    contain = 'layout style',
    reserveSpace = true
  } = options;
  
  if (componentRef.current && reserveSpace) {
    const element = componentRef.current;
    element.style.minHeight = `${minHeight}px`;
    element.style.minWidth = minWidth;
    element.style.contain = contain;
    element.classList.add('component-mount');
  }
};

/**
 * Debounce layout-affecting operations
 */
export const debounceLayoutOperation = (operation, delay = 16) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => operation(...args), delay);
  };
};

/**
 * Batch DOM updates to prevent multiple layout shifts
 */
export const batchDOMUpdates = (updates) => {
  // Use requestAnimationFrame to batch updates
  requestAnimationFrame(() => {
    updates.forEach(update => {
      if (typeof update === 'function') {
        update();
      }
    });
  });
};

/**
 * Initialize CLS optimization for the app
 */
let clsOptimizationInitialized = false;

export const initializeCLSOptimization = () => {
  // Prevent multiple initializations
  if (clsOptimizationInitialized) {
    return {
      clsMonitor: null,
      reserveSpace,
      addSkeletonLoading,
      replaceSkeletonContent,
      preloadImages,
      addLayoutContainment,
      measureAndReserveSpace,
      createStablePlaceholder,
      optimizeComponentMount,
      debounceLayoutOperation,
      batchDOMUpdates
    };
  }
  
  // Prevent font layout shifts
  preventFontLayoutShift();
  
  // Start CLS monitoring
  const clsMonitor = monitorCLSEvents();
  
  // Add global layout containment
  document.body.style.contain = 'layout style';
  
  clsOptimizationInitialized = true;
  
  return {
    clsMonitor,
    reserveSpace,
    addSkeletonLoading,
    replaceSkeletonContent,
    preloadImages,
    addLayoutContainment,
    measureAndReserveSpace,
    createStablePlaceholder,
    optimizeComponentMount,
    debounceLayoutOperation,
    batchDOMUpdates
  };
};

export default {
  reserveSpace,
  addSkeletonLoading,
  replaceSkeletonContent,
  preloadImage,
  preloadImages,
  addLayoutContainment,
  measureAndReserveSpace,
  createStablePlaceholder,
  preventFontLayoutShift,
  monitorCLSEvents,
  optimizeComponentMount,
  debounceLayoutOperation,
  batchDOMUpdates,
  initializeCLSOptimization
};
