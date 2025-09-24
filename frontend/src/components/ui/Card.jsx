import React, { memo } from 'react';

/**
 * Modern Card Component with consistent styling and optional features
 * Performance optimized with minimal re-renders and memoization
 */
const Card = memo(({ 
  title, 
  subtitle,
  children, 
  className = '',
  headerAction,
  icon,
  noPadding = false,
  variant = 'default'
}) => {
  const variants = {
    default: 'bg-[#171717] border border-[#262626]',
    elevated: 'bg-[#171717] border border-[#262626] shadow-lg',
    outline: 'bg-transparent border-2 border-[#262626]',
    glass: 'bg-[#171717]/80 border border-[#262626]/50 backdrop-blur-sm'
  };

  const paddingClass = noPadding ? '' : 'p-6';
  
  return (
    <div className={`${variants[variant]} rounded-xl transition-all duration-200 hover:border-[#262626]/80 ${paddingClass} ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 bg-[#01C38D]/10 rounded-lg flex items-center justify-center">
                {icon}
              </div>
            )}
                    <div>
                      {title && <h3 className="text-sm font-medium text-white">{title}</h3>}
                      {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
                    </div>
          </div>
          {headerAction && headerAction}
        </div>
      )}
      <div className="text-white">
        {children}
      </div>
    </div>
  );
});

export default Card; 