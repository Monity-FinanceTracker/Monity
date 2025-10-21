import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
    sendAIChatMessage,
    getAIChatHistory,
    getAIChatUsage,
    clearAIChatHistory,
    getAIChatPrompts
} from '../../utils/api';
import { FiSend, FiTrash2, FiMessageSquare, FiX, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AIChat = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { subscriptionTier } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [usage, setUsage] = useState(null);
    const [suggestedPrompts, setSuggestedPrompts] = useState([]);
    const [showPrompts, setShowPrompts] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            loadChatHistory();
            loadUsage();
            loadSuggestedPrompts();
            // Focus input when chat opens
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#01C38D] to-[#01a87a] rounded-full flex items-center justify-center">
                            <FiMessageSquare className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{t('aiChat.title')}</h2>
                            {usage && (
                                <p className="text-sm text-gray-400">
                                    {isPremium ? (
                                        <span className="text-[#01C38D]">{t('aiChat.unlimited_messages')}</span>
                                    ) : (
                                        <span>
                                            {messagesRemainingText}
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {messages.length > 0 && (
                            <button
                                onClick={handleClearHistory}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                                title={t('aiChat.clear_history_title')}
                            >
                                <FiTrash2 size={18} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && showPrompts ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#01C38D] to-[#01a87a] rounded-full flex items-center justify-center mb-4">
                                <FiMessageSquare className="text-white" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {t('aiChat.welcome_title')}
                            </h3>
                            <p className="text-gray-400 mb-6 max-w-md">
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
                                                ? 'bg-[#01C38D] text-white'
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
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <FiLoader className="animate-spin" />
                                            <span>{t('aiChat.thinking')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
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
                            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#01C38D] disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!input.trim() || loading || (!isPremium && messagesRemaining === 0)}
                            className="bg-[#01C38D] text-white rounded-lg px-6 py-3 hover:bg-[#01a87a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
