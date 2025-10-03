import React, { useState, useEffect, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Notification Context and Provider for app-wide notifications
 */
const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [notificationCounter, setNotificationCounter] = useState(0);
    const { t } = useTranslation();

    const addNotification = (notification) => {
        // Use a counter-based ID to avoid hydration mismatches
        const id = `notification-${notificationCounter}`;
        setNotificationCounter(prev => prev + 1);
        
        const newNotification = {
            id,
            type: 'info', // 'success', 'error', 'warning', 'info'
            title: '',
            message: '',
            duration: 5000, // 5 seconds default
            actions: [],
            persistent: false,
            ...notification
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto-remove non-persistent notifications
        if (!newNotification.persistent) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }

        return id;
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    // Convenience methods
    const success = (message, options = {}) => addNotification({
        type: 'success',
        title: t('notifications.success'),
        message,
        ...options
    });

    const error = (message, options = {}) => addNotification({
        type: 'error',
        title: t('notifications.error'),
        message,
        duration: 8000, // Longer for errors
        ...options
    });

    const warning = (message, options = {}) => addNotification({
        type: 'warning',
        title: t('notifications.warning'),
        message,
        ...options
    });

    const info = (message, options = {}) => addNotification({
        type: 'info',
        title: t('notifications.info'),
        message,
        ...options
    });

    const value = {
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        success,
        error,
        warning,
        info
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainer />
        </NotificationContext.Provider>
    );
};

/**
 * Notification Container - renders all notifications
 */
const NotificationContainer = () => {
    const { notifications, removeNotification } = useNotifications();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            {notifications.map(notification => (
                <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    );
};

/**
 * Individual Notification Card
 */
const NotificationCard = ({ notification, onClose }) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Animate in
        setTimeout(() => setIsVisible(true), 10);
    }, []);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(onClose, 300); // Match animation duration
    };

    const getTypeStyles = () => {
        switch (notification.type) {
            case 'success':
                return {
                    icon: <CheckCircle className="w-5 h-5 text-[#01C38D]" />,
                    iconBg: 'bg-[#01C38D]/10'
                };
            case 'error':
                return {
                    icon: <XCircle className="w-5 h-5 text-red-400" />,
                    iconBg: 'bg-red-500/10'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
                    iconBg: 'bg-yellow-500/10'
                };
            default: // info
                return {
                    icon: <Info className="w-5 h-5 text-blue-400" />,
                    iconBg: 'bg-blue-500/10'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className={`transform transition-all duration-300 ${
            isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            <div className="bg-[#171717] border border-[#262626] rounded-lg p-4 shadow-lg">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${styles.iconBg} flex-shrink-0`}>
                        {styles.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {notification.title && (
                            <h4 className="text-white font-medium text-sm mb-1">
                                {notification.title}
                            </h4>
                        )}
                        <p className="text-gray-300 text-sm">
                            {notification.message}
                        </p>

                        {/* Actions */}
                        {notification.actions && notification.actions.length > 0 && (
                            <div className="flex gap-2 mt-3">
                                {notification.actions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={action.onClick}
                                        className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                                            action.primary
                                                ? 'bg-[#01C38D] text-white hover:bg-[#01a87a]'
                                                : 'bg-[#262626] text-white hover:bg-[#262626] border border-[#262626]'
                                        }`}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="border-0 outline-none focus:outline-none bg-transparent p-0 m-0 text-white hover:text-gray-300 transition-colors flex-shrink-0"
                        style={{ 
                            border: 'none', 
                            outline: 'none', 
                            background: 'transparent'
                        }}
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>

                {/* Progress bar for timed notifications */}
                {!notification.persistent && (
                    <div className="mt-3 h-1 bg-[#262626] rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#01C38D] rounded-full"
                            style={{
                                animation: `shrink ${notification.duration}ms linear forwards`
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// CSS for progress bar animation
const NotificationStyles = () => (
    <style jsx global>{`
        @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
        }
    `}</style>
);

export default NotificationProvider; 