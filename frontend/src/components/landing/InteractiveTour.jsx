import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * InteractiveTour Component
 * Custom spotlight tour for React 19 compatibility
 * Guides users through key features of the dashboard
 */
const InteractiveTour = ({ steps, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const targetRef = useRef(null);

  const currentStepData = steps[currentStep];

  // Calculate target element position
  useEffect(() => {
    if (!currentStepData) return;

    const updateTargetPosition = () => {
      const element = document.querySelector(currentStepData.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateTargetPosition();

    // Update on resize or scroll
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [currentStep, currentStepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);

      // Track step completion
      if (window.analytics && typeof window.analytics.track === 'function') {
        window.analytics.track('interactive_tour_step_completed', {
          step: currentStep + 1,
          stepName: currentStepData.name
        });
      }
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    // Track skip
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('interactive_tour_skipped', {
        at_step: currentStep + 1
      });
    }
    if (onSkip) onSkip();
  };

  const handleComplete = () => {
    // Track completion
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('interactive_tour_completed', {
        steps_completed: steps.length
      });
    }
    if (onComplete) onComplete();
  };

  if (!currentStepData || !targetRect) return null;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    const placement = currentStepData.placement || 'bottom';
    const padding = 20;

    switch (placement) {
      case 'top':
        return {
          top: targetRect.top - padding,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: targetRect.top + targetRect.height + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - padding,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left + targetRect.width + padding,
          transform: 'translate(0, -50%)'
        };
      case 'center':
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  const tooltipStyle = getTooltipPosition();

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]">
        {/* Backdrop with spotlight effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70" />

          {/* Spotlight cutout */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 30px rgba(86, 166, 159, 0.5)',
                borderRadius: '12px',
                pointerEvents: 'none'
              }}
            />
          )}
        </motion.div>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="absolute max-w-md"
          style={{
            ...tooltipStyle,
            zIndex: 10000
          }}
        >
          <div className="bg-[#1F1E1D] border-2 border-[#56a69f] rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#56a69f] to-[#4A8F88] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-lg">{currentStepData.title}</span>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white font-semibold">
                    {currentStep + 1}/{steps.length}
                  </span>
                </div>
                <button
                  onClick={handleSkip}
                  className="text-white hover:bg-white/10 rounded-full p-1 transition-colors"
                  aria-label="Skip tour"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-[#C2C0B6] leading-relaxed">
                {currentStepData.content}
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#262624] flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-[#C2C0B6] hover:text-white text-sm font-medium transition-colors"
              >
                Pular Tour
              </button>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-4 py-2 bg-[#232323] hover:bg-[#2a2a2a] text-white rounded-lg border border-[#3a3a3a] hover:border-[#56a69f] transition-all duration-200 flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-gradient-to-r from-[#56a69f] to-[#4A8F88] hover:from-[#4a8f88] hover:to-[#3d7a75] text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  {currentStep < steps.length - 1 ? (
                    <>
                      Próximo
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    'Concluir'
                  )}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-[#232323]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-[#56a69f] to-[#4A8F88]"
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

// Hook to manage tour state
export const useTour = (tourId = 'default_tour') => {
  const [isActive, setIsActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    // Check if tour was already completed
    const completed = localStorage.getItem(`monity_tour_${tourId}_completed`);
    setHasCompletedTour(completed === 'true');
  }, [tourId]);

  const startTour = () => {
    if (!hasCompletedTour) {
      setIsActive(true);

      // Track tour start
      if (window.analytics && typeof window.analytics.track === 'function') {
        window.analytics.track('interactive_tour_started', { tourId });
      }
    }
  };

  const completeTour = () => {
    setIsActive(false);
    setHasCompletedTour(true);
    localStorage.setItem(`monity_tour_${tourId}_completed`, 'true');
  };

  const skipTour = () => {
    setIsActive(false);
    setHasCompletedTour(true);
    localStorage.setItem(`monity_tour_${tourId}_completed`, 'true');
  };

  const resetTour = () => {
    localStorage.removeItem(`monity_tour_${tourId}_completed`);
    setHasCompletedTour(false);
  };

  return {
    isActive,
    hasCompletedTour,
    startTour,
    completeTour,
    skipTour,
    resetTour
  };
};

// Default tour steps for dashboard
export const defaultDashboardSteps = [
  {
    name: 'dashboard_overview',
    target: '.dashboard-overview',
    title: 'Bem-vindo ao Dashboard',
    content: 'Visualize todas as suas finanças em tempo real. Aqui você tem uma visão completa do seu saldo, gastos e economias.',
    placement: 'center'
  },
  {
    name: 'add_transaction',
    target: '[data-tour="add-transaction"]',
    title: 'Adicionar Transações',
    content: 'Adicione receitas e despesas em segundos. Nossa IA categorizará automaticamente para você!',
    placement: 'bottom'
  },
  {
    name: 'ai_insights',
    target: '[data-tour="ai-assistant"]',
    title: 'Assistente com IA',
    content: 'Receba insights personalizados sobre seus gastos e pergunte qualquer coisa sobre suas finanças.',
    placement: 'left'
  },
  {
    name: 'budgets',
    target: '[data-tour="budgets"]',
    title: 'Orçamentos Inteligentes',
    content: 'Defina e acompanhe orçamentos por categoria. Receba alertas quando estiver próximo do limite.',
    placement: 'right'
  },
  {
    name: 'groups',
    target: '[data-tour="groups"]',
    title: 'Divisão de Despesas',
    content: 'Divida contas com amigos e familiares. Acompanhe quem deve o quê de forma simples e transparente.',
    placement: 'right'
  }
];

export default InteractiveTour;
