/**
 * Color utility functions for using colors from color.ts
 * Provides helper functions to get color classes and inline styles
 */

import { COLORS } from '../../color';

/**
 * Get inline style object for a color
 * @param {string} colorKey - Key from COLORS object
 * @returns {string} Color value
 */
export const getColor = (colorKey) => {
  return COLORS[colorKey] || colorKey;
};

/**
 * Get Tailwind class for monity colors
 * @param {string} colorKey - Key from COLORS object
 * @param {string} type - 'bg', 'text', 'border', etc.
 * @returns {string} Tailwind class
 */
export const getColorClass = (colorKey, type = 'bg') => {
  const colorMap = {
    background: 'monity-background',
    primaryBg: 'monity-primaryBg',
    secondaryBg: 'monity-secondaryBg',
    cardBg: 'monity-cardBg',
    inputBg: 'monity-inputBg',
    border: 'monity-border',
    accent: 'monity-accent',
    accentHover: 'monity-accentHover',
    textPrimary: 'monity-textPrimary',
    textSecondary: 'monity-textSecondary',
    textMuted: 'monity-textMuted',
    success: 'monity-success',
    error: 'monity-error',
    warning: 'monity-warning',
    info: 'monity-info',
    income: 'monity-income',
    expense: 'monity-expense',
    savings: 'monity-savings',
  };

  const mappedKey = colorMap[colorKey];
  if (!mappedKey) {
    // Fallback to inline style
    return null;
  }

  return `${type}-${mappedKey}`;
};

/**
 * Get inline style for background color
 */
export const bgColor = (colorKey) => ({
  backgroundColor: getColor(colorKey),
});

/**
 * Get inline style for text color
 */
export const textColor = (colorKey) => ({
  color: getColor(colorKey),
});

/**
 * Get inline style for border color
 */
export const borderColor = (colorKey) => ({
  borderColor: getColor(colorKey),
});











