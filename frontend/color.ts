/**
 * Monity Design System - Color Palette
 * Based on rules.mdc design specifications
 * Last updated: October 2025
 */

export const COLORS = {
    // Backgrounds
    background: '#262624',           // Main background
    primaryBg: '#262624',            // Primary background
    secondaryBg: '#1F1E1D',          // Secondary background
    cardBg: '#1F1E1D',               // Card/component background
    inputBg: '#30302E',              // Input background
  
    // Borders & Dividers
    border: '#262626',               // Borders and dividers
    borderHover: 'rgba(38, 38, 38, 0.8)', // Borders on hover
    buttonBorder: '#FAF9F5',         // Button borders only
  
    // Accent Colors
    accent: '#56a69f',               // Primary accent (teal)
    accentHover: '#4a8f88',          // Hover state for accent
    accentLight: 'rgba(86, 166, 159, 0.1)',   // Light accent background
    accentMedium: 'rgba(86, 166, 159, 0.2)',  // Medium accent background
  
    // Text Colors
    textPrimary: '#FAF9F5',          // Primary text
    textSecondary: '#8F8D85',        // Secondary text
    textMuted: '#30302E',            // Muted text / placeholder
    textGray: '#FAF9F5',             // Light gray text
  
    // Status Colors
    success: '#56a69f',              // Green - success
    successLight: 'rgba(86, 166, 159, 0.2)',  // Success background
    error: '#EF4444',                // Red - error
    errorLight: 'rgba(239, 68, 68, 0.2)',     // Error background
    warning: '#F59E0B',              // Yellow - warning
    warningLight: 'rgba(245, 158, 11, 0.2)',  // Warning background
    info: '#3B82F6',                 // Blue - information
    infoLight: 'rgba(59, 130, 246, 0.2)',     // Info background
  
    // Transaction Specific Colors
    income: '#56a69f',               // Green for income
    incomeBg: 'rgba(86, 166, 159, 0.2)',  // Income background
    expense: '#FAF9F5',              // White for expenses
    expenseBg: 'rgba(250, 249, 245, 0.1)',  // Expense background
    savings: '#60A5FA',              // Blue-400 for savings
    savingsBg: 'rgba(59, 130, 246, 0.2)',  // Savings background
  
    // Financial Health Colors
    healthExcellent: '#56a69f',      // Green (80-100)
    healthGood: '#56a69f',           // Green (60-79)
    healthFair: '#FBBF24',           // Yellow-400 (40-59)
    healthPoor: '#F87171',           // Red-400 (0-39)
  
    // Gradient Colors (for manual gradient construction)
    gradientStart: '#56a69f',
    gradientEnd: '#4a8f88',
  
    // Transparent Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayHeavy: 'rgba(0, 0, 0, 0.8)',
    backdropBlur: 'rgba(0, 0, 0, 0.5)',
  } as const;
  
  /**
   * Semantic color mappings for specific use cases
   */
  export const SEMANTIC_COLORS = {
    // Button States
    buttonPrimary: COLORS.accent,
    buttonPrimaryHover: COLORS.accentHover,
    buttonPrimaryText: '#FAF9F5',
    buttonSecondary: COLORS.cardBg,
    buttonSecondaryHover: COLORS.border,
    buttonSecondaryText: COLORS.textPrimary,
    buttonDanger: COLORS.error,
    buttonDangerHover: '#DC2626',
    buttonDangerText: COLORS.textPrimary,
    buttonGhost: 'transparent',
    buttonGhostHover: COLORS.accentLight,
    buttonGhostText: COLORS.accent,
  
    // Input States
    inputBackground: '#30302E',
    inputBorder: COLORS.border,
    inputBorderFocus: COLORS.accent,
    inputBorderError: COLORS.error,
    inputText: COLORS.textPrimary,
    inputPlaceholder: '#8F8D85',
  
    // Card States
    cardBackground: COLORS.cardBg,
    cardBorder: COLORS.border,
    cardBorderHover: COLORS.accent,
    cardShadow: 'rgba(0, 0, 0, 0.1)',
  
    // Navigation
    navBackground: COLORS.secondaryBg,
    navBorder: COLORS.border,
    navActive: COLORS.accent,
    navInactive: COLORS.textMuted,
  
    // Modal/Dialog
    modalBackground: COLORS.cardBg,
    modalBorder: COLORS.border,
    modalOverlay: COLORS.overlay,
  
    // Status Indicators
    statusSuccess: COLORS.success,
    statusError: COLORS.error,
    statusWarning: COLORS.warning,
    statusInfo: COLORS.info,
  } as const;
  
  /**
   * Helper function to get color with opacity
   * @param color - Hex color code
   * @param opacity - Opacity value between 0 and 1
   * @returns RGBA color string
   */
  export const withOpacity = (color: string, opacity: number): string => {
    // Remove # if present
    const hex = color.replace('#', '');
  
    // Parse hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
  
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  /**
   * Color palette for exports and documentation
   */
  export const COLOR_PALETTE = {
    backgrounds: {
      main: COLORS.background,
      primary: COLORS.primaryBg,
      secondary: COLORS.secondaryBg,
      card: COLORS.cardBg,
    },
    borders: {
      default: COLORS.border,
      hover: COLORS.borderHover,
    },
    accent: {
      default: COLORS.accent,
      hover: COLORS.accentHover,
      light: COLORS.accentLight,
      medium: COLORS.accentMedium,
    },
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textSecondary,
      muted: COLORS.textMuted,
      gray: COLORS.textGray,
    },
    status: {
      success: COLORS.success,
      error: COLORS.error,
      warning: COLORS.warning,
      info: COLORS.info,
    },
    transactions: {
      income: COLORS.income,
      expense: COLORS.expense,
      savings: COLORS.savings,
    },
  } as const;
  
  export default COLORS;
  