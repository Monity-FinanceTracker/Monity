import React, { useState } from 'react';
<<<<<<< HEAD
import { motion, AnimatePresence } from 'framer-motion';
=======
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
>>>>>>> 638ba468f69d08521c1f3c83b31a7312cd1828b1
import { useNavigate } from 'react-router-dom';
import {
  FaLock,
  FaCrown,
  FaTimes,
  FaRocket,
  FaChartLine,
  FaPiggyBank,
  FaRobot,
  FaCalendarAlt,
  FaUserFriends,
  FaFileExport,
  FaBell
} from 'react-icons/fa';

/**
 * PremiumFeatureTeaser Component
 *
 * Shows a locked feature with a teaser modal to encourage premium upgrade
 * Used for premium features like AI categorization, advanced budgets, cash flow, etc.
 */

const FEATURE_CONFIGS = {
  ai_categorization: {
    icon: <FaRobot className="text-3xl" />,
    title: 'Categorização Inteligente com IA',
    description: 'Deixe a IA categorizar suas transações automaticamente com precisão de 95%',
    benefits: [
      'Categorização automática em tempo real',
      'Aprendizado contínuo com suas preferências',
      'Economia de até 10 horas por mês',
      'Sugestões inteligentes de economia'
    ],
    savingsHighlight: 'Economize 10h/mês'
  },
  advanced_budgets: {
    icon: <FaChartLine className="text-3xl" />,
    title: 'Orçamentos Avançados',
    description: 'Crie orçamentos inteligentes com alertas personalizados e previsões',
    benefits: [
      'Orçamentos ilimitados por categoria',
      'Alertas personalizados em tempo real',
      'Previsões baseadas em histórico',
      'Análise comparativa mensal'
    ],
    savingsHighlight: 'Economize até 30% mais'
  },
  savings_goals: {
    icon: <FaPiggyBank className="text-3xl" />,
    title: 'Metas de Economia Avançadas',
    description: 'Defina e acompanhe múltiplas metas com estratégias personalizadas',
    benefits: [
      'Metas ilimitadas e personalizadas',
      'Estratégias automáticas de economia',
      'Acompanhamento visual de progresso',
      'Sugestões de otimização'
    ],
    savingsHighlight: 'Atinja metas 2x mais rápido'
  },
  cashflow_calendar: {
    icon: <FaCalendarAlt className="text-3xl" />,
    title: 'Calendário de Fluxo de Caixa',
    description: 'Visualize seu fluxo financeiro futuro e evite surpresas',
    benefits: [
      'Previsão de 12 meses à frente',
      'Alertas de possíveis déficits',
      'Planejamento de despesas futuras',
      'Simulações de cenários'
    ],
    savingsHighlight: 'Previna crises financeiras'
  },
  group_budgets: {
    icon: <FaUserFriends className="text-3xl" />,
    title: 'Orçamentos Compartilhados',
    description: 'Gerencie orçamentos em grupo com divisão automática',
    benefits: [
      'Divisão automática de despesas',
      'Orçamentos compartilhados ilimitados',
      'Relatórios de grupo detalhados',
      'Notificações em tempo real'
    ],
    savingsHighlight: 'Organize gastos em grupo'
  },
  export_reports: {
    icon: <FaFileExport className="text-3xl" />,
    title: 'Relatórios Exportáveis',
    description: 'Exporte seus dados em diversos formatos para análise',
    benefits: [
      'Exportação em PDF, Excel, CSV',
      'Relatórios personalizados',
      'Gráficos e visualizações',
      'Histórico completo'
    ],
    savingsHighlight: 'Controle total dos dados'
  },
  priority_support: {
    icon: <FaBell className="text-3xl" />,
    title: 'Suporte Prioritário',
    description: 'Atendimento prioritário via email e chat',
    benefits: [
      'Resposta em até 2 horas',
      'Suporte via chat em tempo real',
      'Consultoria financeira básica',
      'Acesso antecipado a novos recursos'
    ],
    savingsHighlight: 'Suporte quando precisar'
  }
};

/**
 * Premium Feature Card
 * Shows a locked feature card that opens teaser modal on click
 */
export const PremiumFeatureCard = ({
  featureId,
  className = '',
  variant = 'card' // 'card' or 'banner'
}) => {
  const [showTeaser, setShowTeaser] = useState(false);
  const config = FEATURE_CONFIGS[featureId];

  if (!config) {
    console.error(`Unknown feature ID: ${featureId}`);
    return null;
  }

  const handleClick = () => {
    setShowTeaser(true);

    // Track analytics
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('premium_feature_teaser_opened', {
        feature_id: featureId,
        feature_title: config.title
      });
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={handleClick}
          className={`relative overflow-hidden cursor-pointer bg-gradient-to-r from-[#56a69f]/20 to-[#4a8f88]/20 border-2 border-[#56a69f]/30 rounded-lg p-4 ${className}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-[#56a69f]">
                {config.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-white font-semibold">{config.title}</h4>
                  <FaCrown className="text-[#56a69f] text-sm" />
                </div>
                <p className="text-sm text-gray-300">{config.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-[#56a69f] bg-[#56a69f]/10 px-3 py-1 rounded-full">
                Premium
              </span>
              <FaLock className="text-[#56a69f]" />
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showTeaser && (
            <PremiumFeatureTeaser
              featureId={featureId}
              onClose={() => setShowTeaser(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // Card variant
  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        onClick={handleClick}
        className={`relative overflow-hidden cursor-pointer bg-gradient-to-br from-[#262624] to-[#1F1E1D] border-2 border-[#56a69f]/30 rounded-xl p-6 ${className}`}
      >
        {/* Premium badge */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-1 bg-[#56a69f]/20 text-[#56a69f] px-2 py-1 rounded-full text-xs font-semibold">
            <FaCrown size={10} />
            <span>Premium</span>
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FaLock className="text-[#56a69f] text-4xl" />
          </motion.div>
        </div>

        {/* Content (blurred) */}
        <div className="relative z-0 blur-sm">
          <div className="text-[#56a69f] mb-4">
            {config.icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {config.title}
          </h3>
          <p className="text-gray-400 text-sm">
            {config.description}
          </p>
        </div>

        {/* Hover hint */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="text-xs text-amber-400 font-medium">
            Clique para saber mais
          </span>
        </div>
      </motion.div>

      <AnimatePresence>
        {showTeaser && (
          <PremiumFeatureTeaser
            featureId={featureId}
            onClose={() => setShowTeaser(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * Premium Feature Teaser Modal
 * Full-screen modal showing feature benefits and upgrade CTA
 */
export const PremiumFeatureTeaser = ({ featureId, onClose }) => {
  const navigate = useNavigate();
  const config = FEATURE_CONFIGS[featureId];

  if (!config) return null;

  const handleUpgrade = (action) => {
    // Track analytics
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('premium_teaser_cta_clicked', {
        feature_id: featureId,
        feature_title: config.title,
        action: action // 'upgrade' or 'trial'
      });
    }

    if (action === 'trial') {
      navigate('/subscription?trial=true');
    } else {
      navigate('/subscription');
    }
  };

  const handleClose = () => {
    // Track dismissal
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('premium_teaser_dismissed', {
        feature_id: featureId,
        feature_title: config.title
      });
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-[#262624] to-[#1F1E1D] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#56a69f]/30 shadow-2xl"
      >
        {/* Header */}
        <div className="relative p-6 sm:p-8 border-b border-gray-700">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes size={20} />
          </button>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#56a69f] to-[#4a8f88] rounded-xl flex items-center justify-center text-white">
              {config.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {config.title}
                </h2>
                <FaCrown className="text-[#56a69f]" />
              </div>
              <p className="text-gray-300">
                {config.description}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            O que você ganha:
          </h3>
          <div className="space-y-3">
            {config.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-[#56a69f]/20 rounded-full flex items-center justify-center mt-0.5">
                  <FaRocket className="text-[#56a69f] text-xs" />
                </div>
                <p className="text-gray-300">{benefit}</p>
              </motion.div>
            ))}
          </div>

          {/* Savings highlight */}
          <div className="mt-6 p-4 bg-gradient-to-r from-[#56a69f]/10 to-[#4a8f88]/10 border border-[#56a69f]/20 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <FaPiggyBank className="text-[#56a69f] text-xl" />
              <span className="text-lg font-semibold text-[#56a69f]">
                {config.savingsHighlight}
              </span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="p-6 sm:p-8 bg-[#1F1E1D] border-t border-gray-700">
          <div className="space-y-3">
            {/* Primary CTA: Start Trial */}
            <button
              onClick={() => handleUpgrade('trial')}
              className="w-full bg-gradient-to-r from-[#56a69f] to-[#4a8f88] text-white font-semibold py-4 rounded-lg hover:from-[#4a8f88] hover:to-[#3d7a75] transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <FaRocket />
              <span>Começar Teste Grátis de 7 Dias</span>
            </button>

            {/* Secondary CTA: View Plans */}
            <button
              onClick={() => handleUpgrade('upgrade')}
              className="w-full bg-[#262626] text-white font-semibold py-3 rounded-lg hover:bg-[#3a3a3a] transition-all border border-[#3a3a3a]"
            >
              Ver Planos Premium
            </button>

            {/* Info text */}
            <p className="text-center text-xs text-gray-500 mt-2">
              Sem compromisso. Cancele quando quiser.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PremiumFeatureCard;
