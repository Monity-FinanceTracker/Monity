import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/useAuth';
import {
    sendAIChatMessage,
    getAIChatHistory,
    getAIChatUsage,
    clearAIChatHistory,
    getAIChatPrompts
} from '../../utils/api';
import { FiSend, FiTrash2, FiMessageSquare, FiX, FiAlertCircle, FiLoader, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PremiumUpgradeCard from '../groups/PremiumUpgradeCard';

const AIChat = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { subscriptionTier } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [usage, setUsage] = useState(null);
    const [suggestedPrompts, setSuggestedPrompts] = useState([]);
    const [showPrompts, setShowPrompts] = useState(true);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
            loadChatHistory();
            loadUsage();
            loadSuggestedPrompts();
        } else {
            // Restore body scroll when modal is closed
            document.body.style.overflow = '';
        }

        // Cleanup function
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const loadChatHistory = async () => {
        try {
            const response = await getAIChatHistory();
            if (response.success) {
                setMessages(response.messages);
                setShowPrompts(response.messages.length === 0);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const loadUsage = async () => {
        try {
            const response = await getAIChatUsage();
            if (response.success) {
                setUsage(response.usage);
            }
        } catch (error) {
            console.error('Error loading usage:', error);
        }
    };

    const loadSuggestedPrompts = async () => {
        try {
            const response = await getAIChatPrompts();
            if (response.success) {
                setSuggestedPrompts(response.prompts);
            }
        } catch (error) {
            console.error('Error loading prompts:', error);
        }
    };

    const handleSendMessage = async (messageText = null) => {
        const messageToSend = messageText || input.trim();

        if (!messageToSend) return;

        // Check if limit reached before sending
        if (subscriptionTier === 'free' && usage?.today?.messagesUsed >= 3) {
            toast.error(t('aiChat.error_daily_limit'));
            return;
        }

        setInput('');
        setShowPrompts(false);

        // Add user message to UI immediately
        const userMessage = {
            role: 'user',
            content: messageToSend,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            const response = await sendAIChatMessage(messageToSend);

            if (response.success) {
                // Add assistant message
                const assistantMessage = {
                    role: 'assistant',
                    content: response.message,
                    createdAt: new Date().toISOString()
                };
                setMessages(prev => [...prev, assistantMessage]);

                // Update usage
                if (response.usage) {
                    setUsage(prev => ({
                        ...prev,
                        today: {
                            messagesUsed: response.usage.messagesUsed,
                            messagesLimit: response.usage.messagesLimit,
                            tokensUsed: response.usage.tokensUsed
                        }
                    }));
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);

            if (error.response?.data?.upgradeRequired) {
                toast.error(error.response.data.message || t('aiChat.error_daily_limit'));
            } else if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error(t('aiChat.error_send_failed'));
            }

            // Remove the user message if it failed
            setMessages(prev => prev.filter(msg => msg !== userMessage));
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm(t('aiChat.clear_history_confirm'))) {
            return;
        }

        try {
            await clearAIChatHistory();
            setMessages([]);
            setShowPrompts(true);
            toast.success(t('aiChat.clear_history_success'));
        } catch (error) {
            console.error('Error clearing history:', error);
            toast.error(t('aiChat.clear_history_error'));
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handlePromptClick = (prompt) => {
        handleSendMessage(prompt);
    };

    if (!isOpen) return null;

    const isPremium = subscriptionTier === 'premium';
    const messagesRemaining = isPremium ? null : Math.max(0, 3 - (usage?.today?.messagesUsed || 0));
    const messagesRemainingText = messagesRemaining === 1
        ? t('aiChat.messages_remaining', { count: messagesRemaining })
        : t('aiChat.messages_remaining_plural', { count: messagesRemaining });

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
                // Close modal if clicking on backdrop
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div 
                className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#56a69f] to-[#01a87a] rounded-full flex items-center justify-center">
                            <FiMessageSquare className="text-white" size={20} />
                        </div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-white">{t('aiChat.title')}</h2>
                            {usage && !isPremium && (
                                <div className="flex items-center gap-2 px-2.5 py-1 bg-[#262626] border border-[#262626] rounded-lg">
                                    <span className="text-[#C2C0B6] text-xs">
                                        {(usage?.today?.messagesUsed || 0)}/3
                                    </span>
                                    <span className="text-[#8B8A85] text-xs">
                                        {t('aiChat.messages_today')}
                                    </span>
                                </div>
                            )}
                            {usage && isPremium && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-[#56a69f]/10 border border-[#56a69f]/20 rounded-lg">
                                    <FiStar className="w-3 h-3 text-[#56a69f]" />
                                    <span className="text-[#56a69f] text-xs font-medium">
                                        {t('aiChat.unlimited')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {messages.length > 0 && (
                            <button
                                onClick={handleClearHistory}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-[#C2C0B6] hover:text-red-400"
                                title={t('aiChat.clear_history_title')}
                            >
                                <FiTrash2 size={18} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-[#C2C0B6] hover:text-white"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                </div>

                {/* Premium Upgrade Card */}
                {!isPremium && messagesRemaining === 0 && (
                    <div className="px-4 pt-4">
                        <PremiumUpgradeCard 
                            titleKey="aiChat.premium_unlimited_messages"
                            buttonKey="aiChat.upgrade_to_premium"
                            icon={FiMessageSquare}
                        />
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && showPrompts ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#56a69f] to-[#01a87a] rounded-full flex items-center justify-center mb-4">
                                <FiMessageSquare className="text-white" size={32} />
                            </div>
                            <h3 
                                className="text-xl font-bold text-white mb-2 font-stratford"
                            >
                                {t('aiChat.welcome_title')}
                            </h3>
                            <p className="text-[#C2C0B6] mb-6 max-w-md">
                                {t('aiChat.welcome_description')}
                            </p>

                            <div className="w-full max-w-md space-y-2">
                                <p className="text-sm text-gray-500 mb-3">{t('aiChat.try_asking')}</p>
                                {suggestedPrompts.map((prompt, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePromptClick(prompt)}
                                        className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white text-sm"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                            message.role === 'user'
                                                ? 'bg-[#56a69f] text-white'
                                                : 'bg-gray-800 text-white'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-800 rounded-2xl px-4 py-3">
                                        <div className="flex items-center gap-2 text-[#C2C0B6]">
                                            <FiLoader className="animate-spin" />
                                            <span>{t('aiChat.thinking')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Limit Warning */}
                {!isPremium && messagesRemaining === 0 && (
                    <div className="px-4 py-3 bg-yellow-400/10 border-t border-yellow-400/20">
                        <div className="flex items-start gap-2 text-yellow-400">
                            <FiAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">{t('aiChat.limit_reached_title')}</p>
                                <p className="text-xs text-yellow-400/80 mt-1">
                                    {t('aiChat.limit_reached_message')}{' '}
                                    <Link to="/subscription" className="underline hover:text-yellow-300">
                                        {t('aiChat.upgrade_now')}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-gray-700">
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={
                                !isPremium && messagesRemaining === 0
                                    ? t('aiChat.input_placeholder_limit')
                                    : t('aiChat.input_placeholder')
                            }
                            disabled={loading || (!isPremium && messagesRemaining === 0)}
                            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#56a69f] disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!input.trim() || loading || (!isPremium && messagesRemaining === 0)}
                            className="bg-[#56a69f] text-white rounded-lg px-6 py-3 hover:bg-[#4A8F88] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? <FiLoader className="animate-spin" /> : <FiSend />}
                            {t('aiChat.send_button')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChat;
