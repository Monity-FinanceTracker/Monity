import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaCrown,
  FaTimes,
  FaRocket,
  FaChartLine,
  FaRobot,
  FaPiggyBank,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';
import api from '../../utils/api';

/**
 * SmartUpgradePrompt Component
 *
 * Shows contextual upgrade prompts based on user behavior and triggers
 * Uses backend tracking to ensure prompts are shown at optimal frequency
 */

// Prompt trigger types and their configurations
const PROMPT_CONFIGS = {
  // Triggered when user adds 10th transaction
  transaction_limit: {
    title: 'Você está usando muito o Monity!',
    subtitle: 'Já registrou 10 transações este mês',
    icon: <FaChartLine className="text-4xl" />,
    benefits: [
      'Transações ilimitadas',
      'Categorização automática com IA',
      'Relatórios avançados',
      'Exportação em Excel/PDF'
    ],
    cta: 'Liberar recursos premium',
    urgency: 'Economize tempo com IA'
  },

  // Triggered when user creates 3rd budget
  budget_limit: {
    title: 'Atingiu o limite de orçamentos gratuitos',
    subtitle: 'Crie orçamentos ilimitados com Premium',
    icon: <FaPiggyBank className="text-4xl" />,
    benefits: [
      'Orçamentos ilimitados',
      'Alertas personalizados',
      'Previsões inteligentes',
      'Análise comparativa'
    ],
    cta: 'Desbloquear orçamentos ilimitados',
    urgency: 'Controle total do seu dinheiro'
  },

  // Triggered when user tries to use AI features
  ai_feature: {
    title: 'Categorização com IA está disponível!',
    subtitle: 'Economize horas categorizando manualmente',
    icon: <FaRobot className="text-4xl" />,
    benefits: [
      'IA categoriza automaticamente',
      '95% de precisão',
      'Economia de 10h por mês',
      'Aprende com você'
    ],
    cta: 'Ativar IA agora',
    urgency: 'Economize 10h/mês'
  },

  // Triggered when user has been active for 7 days
  week_1_active: {
    title: 'Você está arrasando! 🎉',
    subtitle: 'Uma semana usando o Monity - que tal levar pro próximo nível?',
    icon: <FaRocket className="text-4xl" />,
    benefits: [
      'Todos os recursos premium',
      'Suporte prioritário',
      '7 dias grátis para testar',
      'Cancele quando quiser'
    ],
    cta: 'Começar teste grátis',
    urgency: 'Oferta especial: 7 dias grátis'
  },

  // Triggered when user tries to access cashflow
  cashflow_access: {
    title: 'Preveja seu futuro financeiro',
    subtitle: 'Veja 12 meses à frente com o Calendário de Fluxo de Caixa',
    icon: <FaCalendarAlt className="text-4xl" />,
    benefits: [
      'Previsão de 12 meses',
      'Alertas de déficit',
      'Planejamento de despesas',
      'Simulações de cenários'
    ],
    cta: 'Liberar Calendário',
    urgency: 'Evite surpresas financeiras'
  },

  // Triggered when user has saved R$X with budgets
  savings_milestone: {
    title: 'Você já economizou com o Monity!',
    subtitle: 'Imagine quanto mais pode economizar com Premium',
    icon: <FaPiggyBank className="text-4xl" />,
    benefits: [
      'Metas de economia ilimitadas',
      'Estratégias automáticas',
      'Previsões inteligentes',
      'Acompanhamento visual'
    ],
    cta: 'Economizar ainda mais',
    urgency: 'Dobre suas economias'
  }
};

/**
 * Smart Upgrade Prompt Component
 */
export const SmartUpgradePrompt = ({
  promptType,
  customData = {},
  onClose,
  position = 'center' // 'center', 'bottom', 'top'
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(7);
  const config = PROMPT_CONFIGS[promptType];

  if (!config) {
    console.error(`Unknown prompt type: ${promptType}`);
    return null;
  }

  // Auto-dismiss countdown (optional - only for non-critical prompts)
  useEffect(() => {
    if (position !== 'center') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleDismiss('auto');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [position]);

  const handleUpgrade = (action) => {
    // Track conversion
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('smart_prompt_converted', {
        prompt_type: promptType,
        action: action,
        custom_data: customData
      });
    }

    // Record conversion in backend
    recordPromptAction('upgraded', action);

    if (action === 'trial') {
      navigate('/subscription?trial=true');
    } else {
      navigate('/subscription');
    }

    onClose?.();
  };

  const handleDismiss = (dismissType = 'manual') => {
    // Track dismissal
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('smart_prompt_dismissed', {
        prompt_type: promptType,
        dismiss_type: dismissType,
        custom_data: customData
      });
    }

    // Record dismissal in backend (7-day snooze)
    recordPromptAction('dismissed', dismissType);

    onClose?.();
  };

  const recordPromptAction = async (action, actionType) => {
    try {
      await fetch('/api/v1/premium/prompt-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt_type: promptType,
          action_taken: action,
          action_type: actionType,
          context: customData
        })
      });
    } catch (error) {
      console.error('Error recording prompt action:', error);
    }
  };

  // Position variants
  const positionClasses = {
    center: 'items-center justify-center',
    bottom: 'items-end justify-center pb-6',
    top: 'items-start justify-center pt-6'
  };

  const sizeClasses = {
    center: 'max-w-2xl',
    bottom: 'max-w-lg',
    top: 'max-w-lg'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[9998] flex ${positionClasses[position]} bg-black/60 backdrop-blur-sm p-4`}
      onClick={() => position !== 'center' && handleDismiss('background')}
    >
      <motion.div
        initial={{ scale: 0.9, y: position === 'bottom' ? 50 : position === 'top' ? -50 : 0 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-gradient-to-br from-[#262624] to-[#1F1E1D] rounded-2xl ${sizeClasses[position]} w-full border-2 border-amber-500/40 shadow-2xl overflow-hidden`}
      >
        {/* Close button */}
        <button
          onClick={() => handleDismiss('close_button')}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes size={20} />
        </button>

        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-6 sm:p-8 border-b border-amber-500/30">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white">
              {config.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {config.title}
              </h2>
              <p className="text-gray-300">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Urgency badge */}
          {config.urgency && (
            <div className="mt-4">
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-400 px-3 py-2 rounded-lg text-sm font-semibold">
                <FaClock size={14} />
                <span>{config.urgency}</span>
              </div>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {config.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-2 bg-[#1F1E1D] p-3 rounded-lg border border-gray-700"
              >
                <FaCrown className="text-amber-400 mt-1 flex-shrink-0" size={14} />
                <span className="text-sm text-gray-300">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="p-6 sm:p-8 pt-0">
          <div className="space-y-3">
            {/* Primary CTA */}
            <button
              onClick={() => handleUpgrade('trial')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-4 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <FaRocket />
              <span>{config.cta}</span>
            </button>

            {/* Secondary options */}
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => handleUpgrade('view_plans')}
                className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                Ver todos os planos
              </button>
              {position !== 'center' && (
                <button
                  onClick={() => handleDismiss('remind_later')}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Lembrar depois ({countdown}s)
                </button>
              )}
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center space-x-4 pt-2 border-t border-gray-700 mt-4">
              <span className="text-xs text-gray-500">✓ 7 dias grátis</span>
              <span className="text-xs text-gray-500">✓ Sem cartão</span>
              <span className="text-xs text-gray-500">✓ Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Hook to manage smart upgrade prompts
 * Handles trigger logic and prompt frequency
 */
export const useSmartUpgradePrompt = () => {
  const [activePrompt, setActivePrompt] = useState(null);
  const [promptData, setPromptData] = useState({});

  // Check if prompt should be shown based on backend tracking
  const shouldShowPrompt = async (promptType) => {
    try {
      const response = await api.get(`/premium/should-show-prompt?type=${promptType}`);
      return response.data?.should_show || false;
    } catch (error) {
      console.error('Error checking prompt eligibility:', error);
      return false;
    }
  };

  // Show prompt if eligible
  const showPrompt = async (promptType, customData = {}) => {
    const eligible = await shouldShowPrompt(promptType);

    if (eligible) {
      setActivePrompt(promptType);
      setPromptData(customData);

      // Track prompt shown
      if (window.analytics && typeof window.analytics.track === 'function') {
        window.analytics.track('smart_prompt_shown', {
          prompt_type: promptType,
          custom_data: customData
        });
      }
    }
  };

  const hidePrompt = () => {
    setActivePrompt(null);
    setPromptData({});
  };

  return {
    activePrompt,
    promptData,
    showPrompt,
    hidePrompt
  };
};

export default SmartUpgradePrompt;
