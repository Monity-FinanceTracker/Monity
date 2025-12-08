<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
=======
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
>>>>>>> 638ba468f69d08521c1f3c83b31a7312cd1828b1
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  FaCheckCircle,
  FaCircle,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaPlus,
  FaChartPie,
  FaPiggyBank,
  FaRobot,
  FaUsers,
  FaFileDownload
} from 'react-icons/fa';

/**
 * GettingStartedChecklist Component
 *
 * A collapsible checklist that helps new users discover key features
 * Shows 7 essential tasks to complete during their first week
 * Progress is tracked and synced with the backend
 * Dismissible after 50% completion
 */
const GettingStartedChecklist = ({ userId }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [checklistData, setChecklistData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Checklist items definition
  const checklistItems = [
    {
      id: 'create_account',
      label: 'Criar sua conta',
      description: 'Bem-vindo! Sua conta foi criada com sucesso.',
      icon: <FaCheckCircle className="text-[#56a69f]" />,
      autoComplete: true, // This is auto-completed on signup
      autoDetect: true, // Automatically detected
      link: null
    },
    {
      id: 'add_first_transaction',
      label: 'Adicionar primeira transação',
      description: 'Registre seu primeiro gasto ou receita',
      icon: <FaPlus className="text-[#56a69f]" />,
      autoDetect: true, // Automatically detected
      link: '/add-expense'
    },
    {
      id: 'set_up_budget',
      label: 'Criar um orçamento',
      description: 'Defina limites para suas categorias de gastos',
      icon: <FaChartPie className="text-[#56a69f]" />,
      autoDetect: true, // Automatically detected
      link: '/budgets'
    },
    {
      id: 'create_savings_goal',
      label: 'Definir meta de economia',
      description: 'Estabeleça objetivos financeiros e acompanhe progresso',
      icon: <FaPiggyBank className="text-[#56a69f]" />,
      autoDetect: true, // Automatically detected
      link: '/savings-goals'
    },
    {
      id: 'explore_ai_categorization',
      label: 'Explorar categorização IA',
      description: 'Veja como a IA organiza suas transações automaticamente',
      icon: <FaRobot className="text-[#56a69f]" />,
      autoDetect: true, // Automatically detected
      link: '/add-expense'
    },
    {
      id: 'invite_to_group',
      label: 'Criar ou participar de grupo',
      description: 'Compartilhe despesas com família ou amigos',
      icon: <FaUsers className="text-[#56a69f]" />,
      autoDetect: true, // Automatically detected
      link: '/groups'
    },
    {
      id: 'download_report',
      label: 'Baixar relatório',
      description: 'Exporte suas transações para análise',
      icon: <FaFileDownload className="text-[#56a69f]" />,
      autoDetect: false, // Manual - user must mark this
      link: '/transactions'
    }
  ];

  // Update a checklist item
  const updateChecklistItem = async (itemId, completed) => {
    try {
      const response = await api.post('/onboarding/checklist', {
        item: itemId,
        completed
      });

      const data = response.data;
      setChecklistData(data.data.checklist_progress);

      // Track analytics
      if (window.analytics && typeof window.analytics.track === 'function') {
        window.analytics.track('checklist_item_completed', {
          item_id: itemId,
          progress_percentage: data.data.percentage
        });
      }

      // If 100% complete, show celebration
      if (data.data.percentage === 100) {
        setTimeout(() => {
          if (window.analytics && typeof window.analytics.track === 'function') {
            window.analytics.track('checklist_fully_completed', {
              completed_at: new Date().toISOString()
            });
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  // Fetch checklist progress from backend
<<<<<<< HEAD
  const fetchProgress = async () => {
=======
  const fetchProgress = useCallback(async () => {
>>>>>>> 638ba468f69d08521c1f3c83b31a7312cd1828b1
    try {
      const response = await api.get('/onboarding/progress');
      const data = response.data;
      
      setChecklistData(data.data.checklist_progress || {});

      // Auto-complete create_account if not set
      if (!data.data.checklist_progress?.create_account) {
        await updateChecklistItem('create_account', true);
      }
    } catch (error) {
      console.error('Error fetching checklist progress:', error);
      setChecklistData({});
    } finally {
      setIsLoading(false);
    }
<<<<<<< HEAD
  };
=======
  }, []);
>>>>>>> 638ba468f69d08521c1f3c83b31a7312cd1828b1

  useEffect(() => {
    // Check if user has dismissed the checklist
    const dismissed = localStorage.getItem('monity_checklist_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Check if collapsed preference is saved
    const collapsed = localStorage.getItem('monity_checklist_collapsed');
    setIsCollapsed(collapsed === 'true');

    fetchProgress();

    // Set up periodic refresh (every 30 seconds)
    const refreshInterval = setInterval(() => {
      fetchProgress();
    }, 30000);

    // Refresh when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProgress();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
<<<<<<< HEAD
  }, [userId]);
=======
  }, [userId, fetchProgress]);
>>>>>>> 638ba468f69d08521c1f3c83b31a7312cd1828b1

  // Toggle checklist item (only for manual items)
  const handleToggleItem = (itemId, currentState) => {
    // Don't allow unchecking create_account
    if (itemId === 'create_account') return;

    // Don't allow toggling auto-detectable items
    const item = checklistItems.find(i => i.id === itemId);
    if (item && item.autoDetect) {
      return; // Auto-detectable items cannot be manually toggled
    }

    const newState = !currentState;
    updateChecklistItem(itemId, newState);
  };

  // Navigate to feature
  const handleNavigate = (link) => {
    if (link) {
      navigate(link);
    }
  };

  // Toggle collapse state
  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('monity_checklist_collapsed', String(newState));

    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('checklist_toggled', {
        collapsed: newState
      });
    }
  };

  // Dismiss checklist
  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('monity_checklist_dismissed', 'true');

    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('checklist_dismissed', {
        progress_percentage: progressPercentage
      });
    }
  };

  if (isLoading || isDismissed) {
    return null;
  }

  // Calculate progress
  const completedCount = checklistItems.filter(item =>
    checklistData?.[item.id] === true
  ).length;
  const totalCount = checklistItems.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);
  const canDismiss = progressPercentage >= 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-[#262624] to-[#1F1E1D] rounded-xl border-2 border-[#56a69f]/30 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#56a69f]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#56a69f]/20 flex items-center justify-center">
              <FaCheckCircle className="text-[#56a69f] text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg">
                Primeiros Passos
              </h3>
              <p className="text-gray-400 text-sm">
                {completedCount} de {totalCount} concluídos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Dismiss button (only if >= 50% complete) */}
            {canDismiss && (
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-300 transition-colors p-2"
                title="Dispensar checklist"
              >
                <FaTimes size={16} />
              </button>
            )}

            {/* Collapse/Expand button */}
            <button
              onClick={handleToggleCollapse}
              className="text-gray-400 hover:text-[#56a69f] transition-colors p-2"
            >
              {isCollapsed ? <FaChevronDown size={18} /> : <FaChevronUp size={18} />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Progresso</span>
            <span className="text-xs font-semibold text-[#56a69f]">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#56a69f] to-[#4a8f89] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 space-y-2">
              {checklistItems.map((item, index) => {
                const isCompleted = checklistData?.[item.id] === true;
                const isAutoComplete = item.autoComplete;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      className={`group flex items-start space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-[#56a69f]/10 border border-[#56a69f]/30'
                          : 'bg-[#1F1E1D] border border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => {
                        if (!isCompleted && item.link) {
                          handleNavigate(item.link);
                        }
                      }}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Only allow manual toggle for non-auto-detectable items
                          if (!isAutoComplete && !item.autoDetect) {
                            handleToggleItem(item.id, isCompleted);
                          }
                        }}
                        className={`flex-shrink-0 mt-0.5 ${
                          (isAutoComplete || item.autoDetect) ? 'cursor-default' : 'cursor-pointer'
                        }`}
                        title={item.autoDetect ? 'Completado automaticamente' : undefined}
                      >
                        {isCompleted ? (
                          <FaCheckCircle className="text-[#56a69f] text-xl" />
                        ) : (
                          <FaCircle className="text-gray-600 text-xl group-hover:text-gray-500 transition-colors" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${
                          isCompleted ? 'text-gray-400 line-through' : 'text-white'
                        }`}>
                          {item.label}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {item.description}
                        </div>
                      </div>

                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {item.icon}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer message */}
            {progressPercentage === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 sm:p-5 bg-[#56a69f]/10 border-t border-[#56a69f]/20"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">🎉</div>
                  <div>
                    <div className="text-white font-semibold">
                      Parabéns! Você completou todas as tarefas!
                    </div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      Agora você está pronto para aproveitar ao máximo o Monity
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {canDismiss && progressPercentage < 100 && (
              <div className="p-4 sm:p-5 bg-[#1F1E1D] border-t border-gray-700">
                <p className="text-xs text-gray-500 text-center">
                  Você pode dispensar este checklist a qualquer momento clicando no × acima
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GettingStartedChecklist;
