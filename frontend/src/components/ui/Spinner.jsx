import React from 'react';

/**
 * Modern Spinner Component with multiple variants and sizes
 * Performance optimized with CSS animations
 */
const Spinner = ({ 
  message, 
  size = 'md', 
  variant = 'primary',
  className = '',
  center = true 
}) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variants = {
    primary: 'border-[#56a69f] border-t-transparent',
    secondary: 'border-gray-400 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  const centerClass = center ? 'flex flex-col items-center justify-center' : '';
  const paddingClass = center ? 'p-6' : '';

  return (
    <div className={`${centerClass} ${paddingClass} ${className}`}>
      <div 
        className={`${sizes[size]} ${variants[variant]} border-2 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="text-gray-400 text-sm mt-3 text-center">
          {message}
        </p>
      )}
    </div>
  );
};

export default Spinner;