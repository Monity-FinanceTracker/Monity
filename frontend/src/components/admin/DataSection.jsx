/**
 * Data Section
 *
 * Reusable wrapper for analytics dashboard sections
 * Provides consistent styling and spacing
 */
function DataSection({
    title,
    subtitle,
    action,
    children,
    className = ''
}) {
    return (
        <div className={`space-y-4 ${className}`}>
            {/* Section Header */}
            {(title || subtitle || action) && (
                <div className="flex items-start justify-between">
                    <div>
                        {title && (
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-sm text-gray-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {action && (
                        <div className="flex-shrink-0">
                            {action}
                        </div>
                    )}
                </div>
            )}

            {/* Section Content */}
            <div>
                {children}
            </div>
        </div>
    );
}

export default DataSection;
