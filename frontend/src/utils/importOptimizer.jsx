// Utilitário simplificado para preload de utilitários críticos
// Versão minimalista para reduzir bundle size

/**
 * Preload simplificado de utilitários críticos
 * Apenas as funções essenciais para reduzir o bundle
 */
export const preloadCriticalUtilities = async () => {
  try {
    // Preload apenas lodash/debounce que é usado no useDebounce hook
    await import('lodash/debounce');
  } catch (error) {
    console.warn('Critical utilities preload failed:', error);
  }
};

// Export default minimalista
export default {
  preloadCriticalUtilities
};
