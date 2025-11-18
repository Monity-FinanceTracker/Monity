import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/useAuth';
import {
    sendAIChatMessage,
    getAIChatHistory,
    getAIChatUsage,
    clearAIChatHistory
} from '../../utils/api';
import { FiArrowUp, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import MonityLogo from '../../assets/monity-logo-semFundo-Branca.png';

const AIAssistantPage = () => {
    const { t } = useTranslation();
    const { subscriptionTier, user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [usage, setUsage] = useState(null);
    const [showPrompts, setShowPrompts] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        loadChatHistory();
        loadUsage();
        inputRef.current?.focus();
    }, []);

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
        } finally {
            setIsInitialLoading(false);
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

    const handleNewChat = async () => {
        try {
            const response = await clearAIChatHistory();
            if (response.success) {
                setMessages([]);
                setShowPrompts(true);
                setInput('');
                inputRef.current?.focus();
                toast.success(t('ai.history_cleared') || 'Chat cleared successfully');
            }
        } catch (error) {
            console.error('Error clearing chat:', error);
            toast.error(t('ai.clear_failed') || 'Failed to clear chat');
        }
    };

    const handleSendMessage = async (messageText = null) => {
        const messageToSend = messageText || input.trim();

        if (!messageToSend) return;

        // Check if limit reached before sending
        if (subscriptionTier === 'free' && usage?.today?.messagesUsed >= 3) {
            toast.error(`${t('ai.daily_limit_reached')}. ${t('ai.upgrade_message')}`);
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
                toast.error(error.response.data.message || t('ai.daily_limit_reached'));
            } else if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error(t('ai.send_failed'));
            }

            // Remove the user message if it failed
            setMessages(prev => prev.filter(msg => msg !== userMessage));
        } finally {
            setLoading(false);
        }
    };


    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };


    const isPremium = subscriptionTier === 'premium';
    const messagesRemaining = isPremium ? null : Math.max(0, 3 - (usage?.today?.messagesUsed || 0));

    return (
        <div className="h-[calc(100vh-8rem)] max-w-5xl mx-auto flex flex-col overflow-hidden">
            {/* Header - Fixed at top */}
            <div className="flex items-center justify-between px-4 py-3" style={{ flexShrink: 0 }}>
                <button
                    onClick={handleNewChat}
                    className="text-[#56a69f] hover:text-[#4A8F88] transition-colors font-medium text-sm flex items-center gap-2"
                >
                    <span>+ New chat</span>
                </button>
            </div>

            {/* Messages Container - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
                {!isInitialLoading && messages.length === 0 && showPrompts ? (
                    <div className="h-full flex items-center justify-center p-6">
                        <div className="flex flex-col items-center gap-4">
                            <img 
                                src={MonityLogo} 
                                alt="Monity Logo" 
                                className="w-16 h-16"
                            />
                            <h3 
                                className="text-4xl font-stratford text-center"
                                style={{ color: '#C2C0B6' }}
                            >
                                How can I help you, {user?.user_metadata?.name || user?.user_metadata?.full_name || t('dashboard.user')}?
                            </h3>
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
                                            ? 'bg-[#141413] text-white'
                                            : 'bg-[#262624] text-white'
                                    }`}
                                >
                                    {message.role === 'assistant' ? (
                                        <div className="text-left prose-sm sm:prose-base">
                                            <ReactMarkdown
                                                components={{
                                                    p: (props) => <p className="mb-2 last:mb-0 text-white" {...props} />,
                                                    ul: (props) => <ul className="list-disc ml-4 mb-2 last:mb-0 text-white" {...props} />,
                                                    ol: (props) => <ol className="list-decimal ml-4 mb-2 last:mb-0 text-white" {...props} />,
                                                    li: (props) => <li className="mb-1 text-white" {...props} />,
                                                    strong: (props) => <strong className="font-bold text-white" {...props} />,
                                                    em: (props) => <em className="italic text-white" {...props} />,
                                                    h1: (props) => <h1 className="text-xl font-bold mb-2 mt-2 text-white" {...props} />,
                                                    h2: (props) => <h2 className="text-lg font-bold mb-2 mt-2 text-white" {...props} />,
                                                    h3: (props) => <h3 className="text-base font-bold mb-1 mt-1 text-white" {...props} />,
                                                    code: ({inline, ...props}) => 
                                                        inline ? (
                                                            <code className="bg-gray-700 px-1 py-0.5 rounded text-sm text-white" {...props} />
                                                        ) : (
                                                            <code className="block bg-gray-700 p-2 rounded my-2 text-sm overflow-x-auto text-white" {...props} />
                                                        ),
                                                    blockquote: (props) => <blockquote className="border-l-4 border-gray-600 pl-3 italic my-2 text-white" {...props} />,
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap text-sm sm:text-base">
                                            {message.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-[#262624] rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <FiLoader className="animate-spin" />
                                        <span>{t('ai.thinking')}</span>
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
                <div className="px-4 py-3 bg-yellow-400/10 border-t border-yellow-400/20" style={{ flexShrink: 0 }}>
                    <div className="flex items-start gap-2 text-yellow-400">
                        <FiAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">{t('ai.daily_limit_reached')}</p>
                            <p className="text-xs text-yellow-400/80 mt-1">
                                {t('ai.upgrade_message')}{' '}
                                <Link to="/subscription" className="underline hover:text-yellow-300">
                                    {t('ai.upgrade_now')}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Input - Fixed at bottom */}
            <div className="p-4 border-t border-[#262626] bg-[#262624]" style={{ flexShrink: 0 }}>
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                            !isPremium && messagesRemaining === 0
                                ? t('ai.placeholder_limit')
                                : t('ai.placeholder')
                        }
                        disabled={loading || (!isPremium && messagesRemaining === 0)}
                        className="flex-1 bg-[#30302E] text-white rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#56a69f] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || loading || (!isPremium && messagesRemaining === 0)}
                        className="bg-[#56a69f] text-white rounded-lg px-4 py-3 hover:bg-[#4A8F88] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? <FiLoader className="animate-spin" /> : <FiArrowUp />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAssistantPage;
