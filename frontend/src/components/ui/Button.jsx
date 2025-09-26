import React, { memo } from 'react';

/**
 * Modern Button Component with consistent styling and performance optimization
 * Supports multiple variants, sizes, and loading states
 * Memoized for better performance
 */
const Button = memo(({ 
  variant = 'primary', 
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
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#232323] disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const variants = {
    primary: 'bg-[#01C38D] hover:bg-[#01A071] text-[#232323] focus:ring-[#01C38D]/20 shadow-sm hover:shadow-md',
    secondary: 'bg-[#171717] hover:bg-[#262626] text-white border border-[#262626] hover:border-[#262626]/80 focus:ring-[#01C38D]/20',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500/20 shadow-sm hover:shadow-md',
    ghost: 'text-[#01C38D] hover:bg-[#01C38D]/10 hover:text-[#01A071] focus:ring-[#01C38D]/20',
    outline: 'border-2 border-[#01C38D] text-[#01C38D] hover:bg-[#01C38D] hover:text-[#232323] focus:ring-[#01C38D]/20',
    minimal: 'text-gray-300 hover:text-white hover:bg-[#171717] focus:ring-[#01C38D]/20'
  };
  
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs rounded-md gap-1',
    sm: 'px-3 py-2 text-sm rounded-lg gap-2',
    md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-3',
    xl: 'px-8 py-4 text-lg rounded-xl gap-3'
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

export default Button;
