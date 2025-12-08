import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
=======
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
>>>>>>> 638ba468f69d08521c1f3c83b31a7312cd1828b1
import Confetti from 'react-confetti';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  FaCheckCircle,
  FaChartLine,
  FaWallet,
  FaLightbulb,
  FaBell,
  FaTimes,
  FaArrowRight,
  FaArrowLeft
} from 'react-icons/fa';

/**
 * OnboardingWizard Component
 *
 * A 5-step full-screen wizard that guides new users through their first experience
 * Step 1: Welcome & Goal Setting
 * Step 2: Financial Context (income, categories)
 * Step 3: First Transaction (AHA MOMENT!)
 * Step 4: Smart Features Preview
 * Step 5: Notification Preferences
 */
const OnboardingWizard = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
<<<<<<< HEAD
  const navigate = useNavigate();
=======
>>>>>>> 638ba468f69d08521c1f3c83b31a7312cd1828b1

  // Form data for each step
  const [formData, setFormData] = useState({
    // Step 1: Goal
    primaryGoal: '',

    // Step 2: Financial Context
    estimatedIncome: '',
    preferredCategories: [],

    // Step 3: First Transaction
    transactionAdded: false,
    firstTransaction: null,

    // Step 5: Notifications
    emailNotifications: true,
    pushNotifications: false,
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Track wizard start
  useEffect(() => {
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('onboarding_wizard_started', {
        user_id: user?.id,
        started_at: new Date().toISOString()
      });
    }
  }, [user]);

  // Available goals for Step 1
  const goalOptions = [
    { id: 'save_money', label: 'Economizar Dinheiro', icon: '💰', description: 'Construir reservas e economizar para o futuro' },
    { id: 'track_expenses', label: 'Controlar Gastos', icon: '📊', description: 'Entender para onde vai meu dinheiro' },
    { id: 'pay_debt', label: 'Pagar Dívidas', icon: '💳', description: 'Eliminar dívidas e ficar livre' },
    { id: 'budget_better', label: 'Orçamento Inteligente', icon: '📈', description: 'Criar e seguir um orçamento realista' },
  ];

  // Available categories for Step 2
  const categoryOptions = [
    { id: 'food', label: 'Alimentação', icon: '🍔' },
    { id: 'transport', label: 'Transporte', icon: '🚗' },
    { id: 'housing', label: 'Moradia', icon: '🏠' },
    { id: 'entertainment', label: 'Lazer', icon: '🎬' },
    { id: 'healthcare', label: 'Saúde', icon: '💊' },
    { id: 'education', label: 'Educação', icon: '📚' },
    { id: 'shopping', label: 'Compras', icon: '🛍️' },
    { id: 'bills', label: 'Contas', icon: '📄' },
  ];

  // Handle step navigation
  const handleNext = async () => {
    if (currentStep === totalSteps) {
      await handleComplete();
      return;
    }

    // Track step completion
    await completeStepOnBackend(currentStep);

    setCurrentStep(prev => prev + 1);

    // Track analytics
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('onboarding_step_completed', {
        step: currentStep,
        step_name: getStepName(currentStep)
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('onboarding_wizard_skipped', {
        skipped_at_step: currentStep
      });
    }
    onSkip?.();
  };

  // Complete step on backend
  const completeStepOnBackend = async (step) => {
    try {
      const stepData = {};

      // Add relevant data based on step
      if (step === 1) {
        stepData.goal = formData.primaryGoal;
      } else if (step === 2) {
        stepData.estimatedIncome = formData.estimatedIncome;
        stepData.preferredCategories = formData.preferredCategories;
      } else if (step === 3) {
        stepData.transactionAdded = formData.transactionAdded;
      }

      await api.post('/onboarding/complete-step', {
        step,
        data: stepData
      });
    } catch (error) {
      console.error('Error saving step:', error);
    }
  };

  // Complete entire onboarding
  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      // Complete final step
      await completeStepOnBackend(currentStep);

      // Mark onboarding as complete
      await api.post('/onboarding/complete');

      // Show confetti
      setShowConfetti(true);

      // Track completion
      if (window.analytics && typeof window.analytics.track === 'function') {
        window.analytics.track('onboarding_wizard_completed', {
          completed_at: new Date().toISOString(),
          primary_goal: formData.primaryGoal
        });
      }

      // Wait for confetti, then complete
      setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, 3000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepName = (step) => {
    const names = ['goal_setting', 'financial_context', 'first_transaction', 'features_preview', 'notifications'];
    return names[step - 1];
  };

  // Check if current step can proceed
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.primaryGoal !== '';
      case 2:
        return formData.estimatedIncome !== '' && formData.preferredCategories.length > 0;
      case 3:
        return formData.transactionAdded;
      case 4:
      case 5:
        return true;
      default:
        return false;
    }
  };

  // Handle goal selection
  const handleGoalSelect = (goalId) => {
    setFormData(prev => ({ ...prev, primaryGoal: goalId }));
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const categories = prev.preferredCategories.includes(categoryId)
        ? prev.preferredCategories.filter(c => c !== categoryId)
        : [...prev.preferredCategories, categoryId];
      return { ...prev, preferredCategories: categories };
    });
  };

  // Handle transaction added (called from Step 3)
  const handleTransactionAdded = (transaction) => {
    setFormData(prev => ({
      ...prev,
      transactionAdded: true,
      firstTransaction: transaction
    }));
  };

  return (
    <>
      {/* Confetti on completion */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Full-screen modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#1F1E1D] z-[9999] overflow-y-auto"
      >
        <div className="min-h-screen flex flex-col">
          {/* Header with progress */}
          <div className="bg-[#262624] border-b border-[#56a69f]/20 sticky top-0 z-10">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-[#56a69f] font-semibold text-lg">
                    Monity
                  </div>
                  <span className="text-gray-400 text-sm">
                    Passo {currentStep} de {totalSteps}
                  </span>
                </div>

                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-gray-300 transition-colors text-sm flex items-center space-x-1"
                >
                  <span>Pular</span>
                  <FaTimes size={14} />
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#56a69f] to-[#4a8f89] rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
            <div className="max-w-2xl w-full">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <Step1Welcome
                    key="step1"
                    formData={formData}
                    goalOptions={goalOptions}
                    onGoalSelect={handleGoalSelect}
                  />
                )}
                {currentStep === 2 && (
                  <Step2FinancialContext
                    key="step2"
                    formData={formData}
                    categoryOptions={categoryOptions}
                    onIncomeChange={(value) => setFormData(prev => ({ ...prev, estimatedIncome: value }))}
                    onCategoryToggle={handleCategoryToggle}
                  />
                )}
                {currentStep === 3 && (
                  <Step3FirstTransaction
                    key="step3"
                    formData={formData}
                    onTransactionAdded={handleTransactionAdded}
                  />
                )}
                {currentStep === 4 && (
                  <Step4FeaturesPreview key="step4" />
                )}
                {currentStep === 5 && (
                  <Step5Notifications
                    key="step5"
                    formData={formData}
                    onEmailToggle={() => setFormData(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                    onPushToggle={() => setFormData(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer with navigation */}
          <div className="bg-[#262624] border-t border-[#56a69f]/20 sticky bottom-0">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    currentStep === 1
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <FaArrowLeft size={14} />
                  <span>Anterior</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    canProceed() && !isSubmitting
                      ? 'bg-[#56a69f] text-white hover:bg-[#4a8f89] shadow-lg'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>
                    {currentStep === totalSteps ? 'Concluir' : 'Próximo'}
                  </span>
                  {currentStep !== totalSteps && <FaArrowRight size={14} />}
                  {currentStep === totalSteps && <FaCheckCircle size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Step 1: Welcome & Goal Setting
const Step1Welcome = ({ formData, goalOptions, onGoalSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">👋</div>
        <h2 className="text-3xl font-bold text-white mb-3">
          Bem-vindo ao Monity!
        </h2>
        <p className="text-gray-400 text-lg">
          Vamos configurar sua conta em poucos passos simples
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white text-center mb-6">
          Qual é seu principal objetivo financeiro?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goalOptions.map((goal) => (
            <button
              key={goal.id}
              onClick={() => onGoalSelect(goal.id)}
              className={`p-5 rounded-xl border-2 transition-all text-left ${
                formData.primaryGoal === goal.id
                  ? 'border-[#56a69f] bg-[#56a69f]/10 shadow-lg'
                  : 'border-gray-600 hover:border-gray-500 bg-[#262624]'
              }`}
            >
              <div className="text-3xl mb-2">{goal.icon}</div>
              <div className="font-semibold text-white mb-1">{goal.label}</div>
              <div className="text-sm text-gray-400">{goal.description}</div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Step 2: Financial Context
const Step2FinancialContext = ({ formData, categoryOptions, onIncomeChange, onCategoryToggle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">💰</div>
        <h2 className="text-3xl font-bold text-white mb-3">
          Contexto Financeiro
        </h2>
        <p className="text-gray-400">
          Isso nos ajuda a personalizar sua experiência
        </p>
      </div>

      {/* Income estimation */}
      <div className="space-y-3">
        <label className="block text-white font-semibold">
          Qual sua renda mensal aproximada? (opcional)
        </label>
        <input
          type="number"
          value={formData.estimatedIncome}
          onChange={(e) => onIncomeChange(e.target.value)}
          placeholder="Ex: 5000"
          className="w-full px-4 py-3 bg-[#262624] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#56a69f] focus:outline-none transition-colors"
        />
        <p className="text-sm text-gray-500">
          Usaremos isso para sugestões personalizadas de orçamento
        </p>
      </div>

      {/* Category preferences */}
      <div className="space-y-3">
        <label className="block text-white font-semibold">
          Selecione suas principais categorias de gastos (mínimo 1)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categoryOptions.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryToggle(category.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.preferredCategories.includes(category.id)
                  ? 'border-[#56a69f] bg-[#56a69f]/10'
                  : 'border-gray-600 hover:border-gray-500 bg-[#262624]'
              }`}
            >
              <div className="text-2xl mb-1">{category.icon}</div>
              <div className="text-sm text-white font-medium">{category.label}</div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Step 3: First Transaction (AHA MOMENT!)
const Step3FirstTransaction = ({ formData, onTransactionAdded }) => {
  const [transaction, setTransaction] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: 'food'
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTransaction = async () => {
    if (!transaction.amount || !transaction.description) return;

    setIsAdding(true);

    try {
      const response = await api.post('/transactions', {
        ...transaction,
        amount: parseFloat(transaction.amount),
        date: new Date().toISOString()
      });

      onTransactionAdded(response.data);
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-3xl font-bold text-white mb-3">
          Adicione sua primeira transação!
        </h2>
        <p className="text-gray-400">
          Este é o primeiro passo para controlar suas finanças
        </p>
      </div>

      {!formData.transactionAdded ? (
        <div className="bg-[#262624] rounded-xl p-6 space-y-4 border border-gray-700">
          {/* Type selector */}
          <div className="flex space-x-2">
            <button
              onClick={() => setTransaction(prev => ({ ...prev, type: 'expense' }))}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                transaction.type === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              Despesa
            </button>
            <button
              onClick={() => setTransaction(prev => ({ ...prev, type: 'income' }))}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                transaction.type === 'income'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              Receita
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-white font-semibold mb-2">Valor</label>
            <input
              type="number"
              value={transaction.amount}
              onChange={(e) => setTransaction(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="R$ 0,00"
              className="w-full px-4 py-3 bg-[#1F1E1D] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#56a69f] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-semibold mb-2">Descrição</label>
            <input
              type="text"
              value={transaction.description}
              onChange={(e) => setTransaction(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Almoço no restaurante"
              className="w-full px-4 py-3 bg-[#1F1E1D] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#56a69f] focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-white font-semibold mb-2">Categoria</label>
            <select
              value={transaction.category}
              onChange={(e) => setTransaction(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 bg-[#1F1E1D] border border-gray-600 rounded-lg text-white focus:border-[#56a69f] focus:outline-none"
            >
              <option value="food">Alimentação</option>
              <option value="transport">Transporte</option>
              <option value="housing">Moradia</option>
              <option value="entertainment">Lazer</option>
              <option value="healthcare">Saúde</option>
              <option value="education">Educação</option>
              <option value="shopping">Compras</option>
              <option value="bills">Contas</option>
              <option value="other">Outros</option>
            </select>
          </div>

          <button
            onClick={handleAddTransaction}
            disabled={!transaction.amount || !transaction.description || isAdding}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              transaction.amount && transaction.description && !isAdding
                ? 'bg-[#56a69f] text-white hover:bg-[#4a8f89]'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isAdding ? 'Adicionando...' : 'Adicionar Transação'}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#56a69f]/10 border-2 border-[#56a69f] rounded-xl p-8 text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Parabéns!
          </h3>
          <p className="text-gray-300">
            Você adicionou sua primeira transação. Continue assim!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

// Step 4: Features Preview
const Step4FeaturesPreview = () => {
  const features = [
    {
      icon: <FaChartLine className="text-3xl text-[#56a69f]" />,
      title: 'Dashboard Inteligente',
      description: 'Visualize suas finanças de forma clara e organizada'
    },
    {
      icon: <FaWallet className="text-3xl text-[#56a69f]" />,
      title: 'Orçamentos Automáticos',
      description: 'Crie orçamentos e receba alertas quando ultrapassar'
    },
    {
      icon: <FaLightbulb className="text-3xl text-[#56a69f]" />,
      title: 'IA para Categorização',
      description: 'Categorização automática com inteligência artificial'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">✨</div>
        <h2 className="text-3xl font-bold text-white mb-3">
          Recursos que você vai adorar
        </h2>
        <p className="text-gray-400">
          Descubra o que o Monity pode fazer por você
        </p>
      </div>

      <div className="space-y-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#262624] rounded-xl p-6 border border-gray-700 flex items-start space-x-4"
          >
            <div className="flex-shrink-0">{feature.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Step 5: Notifications
const Step5Notifications = ({ formData, onEmailToggle, onPushToggle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🔔</div>
        <h2 className="text-3xl font-bold text-white mb-3">
          Fique por dentro
        </h2>
        <p className="text-gray-400">
          Configure suas preferências de notificação
        </p>
      </div>

      <div className="space-y-4">
        {/* Email notifications */}
        <div className="bg-[#262624] rounded-xl p-6 border border-gray-700 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Notificações por Email
            </h3>
            <p className="text-gray-400 text-sm">
              Receba resumos semanais e alertas importantes
            </p>
          </div>
          <button
            onClick={onEmailToggle}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              formData.emailNotifications ? 'bg-[#56a69f]' : 'bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: formData.emailNotifications ? 24 : 2 }}
              transition={{ duration: 0.2 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full"
            />
          </button>
        </div>

        {/* Push notifications */}
        <div className="bg-[#262624] rounded-xl p-6 border border-gray-700 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Notificações Push
            </h3>
            <p className="text-gray-400 text-sm">
              Receba alertas em tempo real no seu dispositivo
            </p>
          </div>
          <button
            onClick={onPushToggle}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              formData.pushNotifications ? 'bg-[#56a69f]' : 'bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: formData.pushNotifications ? 24 : 2 }}
              transition={{ duration: 0.2 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full"
            />
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Você pode alterar essas configurações a qualquer momento
        </p>
      </div>
    </motion.div>
  );
};

export default OnboardingWizard;
