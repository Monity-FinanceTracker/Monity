import React, { memo } from 'react';

/**
 * Modern Button Component following Monity design system
 * 
 * DESIGN PRINCIPLE: All buttons have WHITE TEXT with NO BACKGROUND by default
 * Only action buttons (submit, save) should have colored backgrounds
 * 
 * @param {string} variant - 'default' (white text) | 'action' (green bg) | 'danger' (red text) | 'dangerAction' (red bg)
 * @param {string} size - 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} loading - Shows spinner when true
 * @param {boolean} fullWidth - Makes button full width
 */
const Button = memo(({ 
  variant = 'default', 
  size = 'md', 
  children, 
  className = '', 
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-monity-accent/30 disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  // NEW DESIGN SYSTEM - Following button-styling.mdc rules
  const variants = {
    // Default: White text, no background, no border (use this 90% of the time)
    default: 'text-monity-textPrimary hover:text-monity-accent',
    
    // Action: For primary actions like submit, save, confirm
    action: 'bg-monity-accent text-monity-textPrimary hover:bg-monity-accentHover',
    
    // Danger: Red text, no background (for delete, remove)
    danger: 'text-monity-error hover:text-red-300',
    
    // Danger Action: Red background (for critical destructive actions)
    dangerAction: 'bg-red-600 text-white hover:bg-red-700',
    
    // Legacy support (maps old variants to new system)
    primary: 'bg-monity-accent text-monity-textPrimary hover:bg-monity-accentHover',  // maps to 'action'
    secondary: 'text-monity-textPrimary hover:text-monity-accent',           // maps to 'default'
    ghost: 'text-monity-textPrimary hover:text-monity-accent',               // maps to 'default'
    minimal: 'text-monity-textPrimary hover:text-monity-accent',             // maps to 'default'
    success: 'bg-monity-accent text-monity-textPrimary hover:bg-monity-accentHover',  // maps to 'action'
    outline: 'text-monity-textPrimary hover:text-monity-accent'              // maps to 'default' (NO BORDERS!)
  };
  
  const sizes = {
    xs: 'px-3 py-1.5 text-xs rounded-lg gap-1',
    sm: 'px-4 py-2 text-sm rounded-lg gap-2',
    md: 'px-4 py-2.5 text-base rounded-lg gap-2',
    lg: 'px-6 py-3 text-lg rounded-xl gap-3',
    xl: 'px-8 py-4 text-xl rounded-xl gap-3'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </>
      ) : (
        <>
          {leftIcon && leftIcon}
          {children}
          {rightIcon && rightIcon}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
