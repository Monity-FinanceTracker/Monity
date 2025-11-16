import React, { useState, useRef, useEffect } from 'react';

/**
 * Custom dropdown component with full styling control
 * Replaces native select to avoid browser default styling limitations
 */
const Dropdown = ({ 
    value, 
    onChange, 
    options = [], 
    placeholder = "Select an option",
    className = '',
    leftIcon = null,
    disabled = false,
    bgColor = '#1F1E1D',
    menuBgColor = '#1F1E1D'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const dropdownRef = useRef(null);

    // Find selected option
    useEffect(() => {
        const option = options.find(opt => opt.value === value);
        setSelectedOption(option);
    }, [value, options]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleOptionClick = (option) => {
        onChange(option.value);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={toggleDropdown}
                disabled={disabled}
                className={`
                    w-full h-12 border border-[#262626] text-white rounded-xl px-4 
                    focus:ring-0 focus:ring-transparent focus:border-[#56a69f] transition-all 
                    cursor-pointer font-sans text-base font-medium flex items-center
                    ${leftIcon ? 'pl-10' : 'pl-4'} pr-10
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#56a69f]'}
                `}
                style={{
                    backgroundColor: bgColor,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '16px',
                    fontWeight: '500'
                }}
            >
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        {leftIcon}
                    </div>
                )}
                
                <span className="text-left flex-1">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                
                <svg 
                    className={`absolute top-1/2 right-2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : 'rotate-0'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div 
                    className="absolute z-50 w-full mt-1 border border-[#262626] rounded-xl shadow-lg overflow-hidden"
                    style={{ backgroundColor: menuBgColor }}
                >
                    {options.map((option, index) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleOptionClick(option)}
                            className={`
                                w-full text-left px-4 py-3 text-white transition-colors
                                font-sans text-base font-medium
                                ${index === 0 ? 'rounded-t-xl' : ''}
                                ${index === options.length - 1 ? 'rounded-b-xl' : ''}
                                ${option.value === value 
                                    ? 'bg-[#56a69f] text-white' 
                                    : 'hover:bg-[#262626] text-white'
                                }
                            `}
                            style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: '16px',
                                fontWeight: '500'
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
