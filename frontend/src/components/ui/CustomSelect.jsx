import React from 'react';

/**
 * Custom Select component with consistent styling and custom arrow
 * Follows the project's design pattern
 */
const CustomSelect = ({ 
    value, 
    onChange, 
    children, 
    className = '', 
    leftIcon = null,
    rightIcon = null,
    ...props 
}) => {
    return (
        <div className="relative">
            {leftIcon && (
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    {leftIcon}
                </div>
            )}
            
            <select
                value={value}
                onChange={onChange}
                className={`w-full bg-[#171717] border border-[#262626] text-white rounded-xl px-4 py-3 focus:ring-0 focus:ring-transparent focus:border-[#01C38D] transition-all appearance-none cursor-pointer font-sans text-sm font-medium ${
                    leftIcon ? 'pl-10' : 'pl-4'
                } pr-14 ${className}`}
                style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    fontWeight: '500'
                }}
                {...props}
            >
                {children}
            </select>
            
            {rightIcon ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {rightIcon}
                </div>
            ) : (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
