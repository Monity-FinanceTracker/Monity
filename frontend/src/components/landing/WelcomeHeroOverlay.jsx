import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { X, TrendingUp, Users, Brain, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * WelcomeHeroOverlay Component
 * First impression overlay that appears for new visitors
 * Features glassmorphism design, social proof, and clear CTAs
 */
const WelcomeHeroOverlay = ({ onDismiss, variant = 'A' }) => {
  const navigate = useNavigate();
  const [autoDismissTimer, setAutoDismissTimer] = useState(10);

  const handleDismiss = useCallback(() => {
    // Track dismissal
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('hero_overlay_dismissed', {
        variant,
        time_on_screen: 10 - autoDismissTimer
      });
    }
    onDismiss();
  }, [onDismiss, variant, autoDismissTimer]);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoDismissTimer(prev => {
        if (prev <= 1) {
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleDismiss]);

  const handleSignup = () => {
    // Track CTA click
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('hero_cta_clicked', {
        cta_type: 'signup',
        variant
      });
    }
    navigate('/signup');
  };

  const handleDemo = () => {
    // Track demo mode activation
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('hero_cta_clicked', {
        cta_type: 'demo',
        variant
      });
      window.analytics.track('demo_mode_activated', { source: 'hero_overlay' });
    }
    navigate('/demo');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop with blur */}
        <motion.div
          initial={{ backdropFilter: 'blur(0px)' }}
          animate={{ backdropFilter: 'blur(12px)' }}
          exit={{ backdropFilter: 'blur(0px)' }}
          className="absolute inset-0 bg-black/60"
          onClick={handleDismiss}
        />

        {/* Hero Card with Glassmorphism */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative max-w-2xl w-full bg-gradient-to-br from-[#1F1E1D]/95 via-[#262624]/95 to-[#1F1E1D]/95 backdrop-blur-xl border border-[#56a69f]/20 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient Orbs Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#56a69f]/10 rounded-full filter blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4A8F88]/10 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#262624]/80 hover:bg-[#3a3a3a]/80 border border-[#3a3a3a] transition-all duration-200 group"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[#C2C0B6] group-hover:text-white" />
          </button>

          {/* Content */}
          <div className="relative p-8 md:p-12">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-8 h-8 text-[#56a69f]" />
                <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Stratford, sans-serif' }}>
                  Monity
                </h1>
              </motion.div>
            </div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-center text-white mb-4"
            >
              Seu Dinheiro, Sob Controle Total
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-center text-[#C2C0B6] mb-8"
            >
              Rastreie gastos, divida despesas e receba insights com IA - em segundos
            </motion.p>

            {/* Key Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              <div className="flex flex-col items-center text-center p-4 bg-[#232323]/50 rounded-xl border border-[#3a3a3a]/50">
                <Brain className="w-10 h-10 text-[#56a69f] mb-3" />
                <h3 className="text-white font-semibold mb-1">Categorização Inteligente com IA</h3>
                <p className="text-sm text-[#C2C0B6]">90% de precisão automática</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-[#232323]/50 rounded-xl border border-[#3a3a3a]/50">
                <Users className="w-10 h-10 text-[#56a69f] mb-3" />
                <h3 className="text-white font-semibold mb-1">Divisão de Despesas em Grupo</h3>
                <p className="text-sm text-[#C2C0B6]">Divida contas facilmente</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-[#232323]/50 rounded-xl border border-[#3a3a3a]/50">
                <TrendingUp className="w-10 h-10 text-[#56a69f] mb-3" />
                <h3 className="text-white font-semibold mb-1">Insights Financeiros Personalizados</h3>
                <p className="text-sm text-[#C2C0B6]">Economize mais, gaste melhor</p>
              </div>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mb-8 p-4 bg-[#56a69f]/10 rounded-xl border border-[#56a69f]/20"
            >
              <p className="text-[#56a69f] font-semibold">
                Junte-se a 10.000+ usuários gerenciando R$ 50M+ em transações
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-[#56a69f] to-[#4A8F88] border-2 border-[#262624] flex items-center justify-center text-xs font-bold text-white"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-[#C2C0B6]">+9.995 usuários</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={handleSignup}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-[#56a69f] to-[#4A8F88] hover:from-[#4a8f88] hover:to-[#3d7a75] text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                Começar Grátis
              </button>

              <button
                onClick={handleDemo}
                className="flex-1 px-8 py-4 bg-[#232323] hover:bg-[#2a2a2a] text-white font-semibold rounded-xl border-2 border-[#3a3a3a] hover:border-[#56a69f] transition-all duration-200"
              >
                Explorar Demo
              </button>
            </motion.div>

            {/* Auto-dismiss Timer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-6"
            >
              <p className="text-xs text-[#C2C0B6]">
                Fechando automaticamente em {autoDismissTimer}s
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeHeroOverlay;
