import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Standardized FormField component for consistent form styling
 * across the Monity application
 */
const FormField = ({ 
    label, 
    error, 
    success,
    helpText,
    required = false, 
    className = '',
    children,
    ...props 
}) => {
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-foreground">
                    {label}
                    {required && (
                        <span className="text-destructive ml-1" aria-label="required">
                            *
                        </span>
                    )}
                </label>
            )}

            {/* Input Container */}
            <div className="relative">
                {children}
                
                {/* Status Icons */}
                {(hasError || hasSuccess) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        {hasError && (
                            <AlertTriangle 
                                className="w-4 h-4 text-destructive" 
                                aria-hidden="true"
                            />
                        )}
                        {hasSuccess && (
                            <CheckCircle 
                                className="w-4 h-4 text-green-500" 
                                aria-hidden="true"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Help Text */}
            {helpText && !hasError && (
                <p className="text-xs text-muted-foreground" id={`${props.id}-help`}>
                    {helpText}
                </p>
            )}

            {/* Error Message */}
            {hasError && (
                <div className="flex items-start gap-2 text-xs text-destructive" role="alert">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Success Message */}
            {hasSuccess && (
                <div className="flex items-start gap-2 text-xs text-green-600" role="status">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{success}</span>
                </div>
            )}
        </div>
    );
};

/**
 * Standardized Input component with consistent styling
 */
export const Input = React.forwardRef(({ 
    className = '', 
    error,
    success,
    ...props 
}, ref) => {
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    
    const baseClasses = `
        w-full px-3 py-2.5 text-sm
        bg-input border border-border rounded-lg
        text-foreground placeholder:text-muted-foreground
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
        disabled:opacity-50 disabled:cursor-not-allowed
        ${hasError 
            ? 'border-destructive focus:border-destructive focus:ring-destructive/20' 
            : hasSuccess
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                : 'border-border focus:border-primary hover:border-border/80'
        }
    `;

    return (
        <input
            ref={ref}
            className={`${baseClasses} ${className}`.trim()}
            {...props}
        />
    );
});

Input.displayName = 'Input';

/**
 * Standardized Textarea component
 */
export const Textarea = React.forwardRef(({ 
    className = '', 
    error,
    success,
    rows = 3,
    ...props 
}, ref) => {
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    
    const baseClasses = `
        w-full px-3 py-2.5 text-sm
        bg-input border border-border rounded-lg
        text-foreground placeholder:text-muted-foreground
        transition-all duration-200 resize-vertical
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
        disabled:opacity-50 disabled:cursor-not-allowed
        ${hasError 
            ? 'border-destructive focus:border-destructive focus:ring-destructive/20' 
            : hasSuccess
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                : 'border-border focus:border-primary hover:border-border/80'
        }
    `;

    return (
        <textarea
            ref={ref}
            rows={rows}
            className={`${baseClasses} ${className}`.trim()}
            {...props}
        />
    );
});

Textarea.displayName = 'Textarea';

/**
 * Standardized Select component
 */
export const Select = React.forwardRef(({ 
    className = '', 
    error,
    success,
    children,
    ...props 
}, ref) => {
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    
    const baseClasses = `
        w-full px-3 py-2.5 text-sm
        bg-input border border-border rounded-lg
        text-foreground
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
        disabled:opacity-50 disabled:cursor-not-allowed
        ${hasError 
            ? 'border-destructive focus:border-destructive focus:ring-destructive/20' 
            : hasSuccess
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                : 'border-border focus:border-primary hover:border-border/80'
        }
    `;

    return (
        <select
            ref={ref}
            className={`${baseClasses} ${className}`.trim()}
            {...props}
        >
            {children}
        </select>
    );
});

Select.displayName = 'Select';

/**
 * Form Group component for consistent spacing and layout
 */
export const FormGroup = ({ children, className = '' }) => (
    <div className={`space-y-4 ${className}`}>
        {children}
    </div>
);

/**
 * Form Actions component for button groups
 */
export const FormActions = ({ children, className = '' }) => (
    <div className={`flex flex-col sm:flex-row gap-3 pt-6 ${className}`}>
        {children}
    </div>
);

/**
 * Form Section component for grouping related fields
 */
export const FormSection = ({ title, description, children, className = '' }) => (
    <div className={`space-y-4 ${className}`}>
        {(title || description) && (
            <div className="space-y-1">
                {title && (
                    <h3 className="text-lg font-semibold text-foreground">
                        {title}
                    </h3>
                )}
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
        )}
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

export default FormField;
