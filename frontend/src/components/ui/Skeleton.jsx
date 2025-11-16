import React from 'react';

/**
 * Skeleton loader component to prevent layout shift
 */
export const Skeleton = ({ 
    className = '', 
    width, 
    height, 
    variant = 'default',
    lines = 1,
    ...props 
}) => {
    const baseClasses = 'animate-pulse bg-[#262626]/50 rounded';
    
    const variants = {
        default: 'bg-[#262626]/50',
        card: 'bg-[#262626]/30 rounded-xl',
        text: 'bg-[#262626]/40 rounded-sm',
        avatar: 'bg-[#262626]/50 rounded-full',
        button: 'bg-[#262626]/40 rounded-lg'
    };

    const getSizeClasses = () => {
        if (width && height) {
            return { width, height };
        }
        return {};
    };

    if (variant === 'text' && lines > 1) {
        return (
            <div className={className} {...props}>
                {Array.from({ length: lines }).map((_, index) => (
                    <div
                        key={index}
                        className={`${baseClasses} ${variants[variant]} ${
                            index === lines - 1 ? 'w-3/4' : 'w-full'
                        } ${index < lines - 1 ? 'mb-2' : ''}`}
                        style={{
                            height: height || '1rem',
                            ...getSizeClasses()
                        }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={`${baseClasses} ${variants[variant]} ${className}`}
            style={{
                width: width || '100%',
                height: height || '1rem',
                ...getSizeClasses()
            }}
            {...props}
        />
    );
};

/**
 * Card skeleton for dashboard cards
 */
export const CardSkeleton = ({ className = '' }) => (
    <div className={`bg-[#1F1E1D] border border-[#262626] rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            <Skeleton variant="avatar" width={40} height={40} />
            <div className="flex-1">
                <Skeleton variant="text" width="60%" height={16} className="mb-2" />
                <Skeleton variant="text" width="40%" height={12} />
            </div>
        </div>
        <div className="space-y-3">
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="60%" height={16} />
        </div>
    </div>
);

/**
 * Transaction list skeleton
 */
export const TransactionSkeleton = ({ count = 5 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-[#1F1E1D] rounded-lg">
                <Skeleton variant="avatar" width={40} height={40} />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="70%" height={16} />
                    <Skeleton variant="text" width="40%" height={12} />
                </div>
                <Skeleton variant="text" width="80px" height={16} />
            </div>
        ))}
    </div>
);

/**
 * Dashboard skeleton
 */
export const DashboardSkeleton = () => (
    <div className="space-y-6">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <CardSkeleton key={index} />
            ))}
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
        </div>
        
        {/* Recent Transactions */}
        <CardSkeleton />
    </div>
);

export default Skeleton;
