import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../context/useAuth";
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import {
  FiCheck,
  FiX,
  FiZap,
  FiMessageSquare,
  FiTrendingUp,
  FiTarget,
  FiPieChart,
  FiLock,
  FiStar,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiCrown,
  FiClock
} from "react-icons/fi";

/**
 * Enhanced Subscription Page
 * With comparison table, testimonials, FAQ, and trial integration
 */
const EnhancedSubscription = () => {
  const { t } = useTranslation();
  const { subscriptionTier } = useAuth();
  const [searchParams] = useSearchParams();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [showTrial, setShowTrial] = useState(false);

  const trialParam = searchParams.get('trial');

  useEffect(() => {
    if (trialParam === 'true') {
      setShowTrial(true);
    }
  }, [trialParam]);

  // Load Stripe buy button script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const handleUpgrade = async (isTrial = false) => {
    setIsUpgrading(true);

    // Track analytics
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('subscription_upgrade_clicked', {
        tier: 'premium',
        is_trial: isTrial,
        source: 'subscription_page'
      });
    }

    try {
      // Use different URL for trial vs direct purchase
      const checkoutUrl = isTrial
        ? "https://buy.stripe.com/trial-link-here" // Replace with actual trial link
        : "https://buy.stripe.com/28E00i8dS5CTaZA5h50Fi01";

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Upgrade failed", error);
      alert("Failed to redirect to checkout");
    } finally {
      setIsUpgrading(false);
    }
  };

  const comparisonFeatures = [
    { name: 'Transações', free: '100/mês', premium: 'Ilimitadas' },
    { name: 'Categorização com IA', free: false, premium: true },
    { name: 'Orçamentos', free: '2', premium: 'Ilimitados' },
    { name: 'Metas de Economia', free: '2', premium: 'Ilimitadas' },
    { name: 'Chat IA', free: '3 mensagens/dia', premium: 'Ilimitado' },
    { name: 'Calendário Fluxo de Caixa', free: false, premium: true },
    { name: 'Relatórios Exportáveis', free: 'Limitado', premium: 'PDF, Excel, CSV' },
    { name: 'Calculadora Investimento', free: '2 simulações/mês', premium: 'Ilimitado' },
    { name: 'Grupos Compartilhados', free: '1 grupo', premium: 'Ilimitados' },
    { name: 'Suporte Prioritário', free: false, premium: true },
    { name: 'Acesso Antecipado', free: false, premium: true }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Freelancer',
      avatar: '👩‍💼',
      text: 'Com o Premium, economizo 10 horas por mês na categorização. A IA é incrível!',
      savings: 'R$ 2.400 economizados'
    },
    {
      name: 'João Santos',
      role: 'Empresário',
      avatar: '👨‍💼',
      text: 'O calendário de fluxo de caixa me salvou de uma crise financeira. Vale cada centavo.',
      savings: 'Previsão de 12 meses'
    },
    {
      name: 'Ana Costa',
      role: 'Estudante',
      avatar: '👩‍🎓',
      text: 'Consegui economizar R$ 5.000 em 6 meses com as metas inteligentes!',
      savings: 'R$ 5.000 economizados'
    }
  ];

  const faqs = [
    {
      q: 'Como funciona o teste grátis de 7 dias?',
      a: 'Você tem acesso total ao Premium por 7 dias, sem cobrança. Cancele quando quiser antes do fim do período e não será cobrado.'
    },
    {
      q: 'Preciso cadastrar cartão para o teste grátis?',
      a: 'Não! O teste grátis não requer cartão de crédito. Você só adiciona um método de pagamento se decidir continuar após o período de teste.'
    },
    {
      q: 'Posso cancelar a qualquer momento?',
      a: 'Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas ou multas. O acesso continua até o fim do período pago.'
    },
    {
      q: 'Meus dados estão seguros?',
      a: 'Absolutamente! Usamos criptografia de ponta a ponta e nunca compartilhamos seus dados financeiros com terceiros.'
    },
    {
      q: 'Posso fazer upgrade/downgrade depois?',
      a: 'Sim! Você pode mudar entre planos a qualquer momento. Ajustamos o valor proporcionalmente.'
    },
    {
      q: 'Tem desconto para pagamento anual?',
      a: 'Sim! No plano anual você economiza 20% (R$ 95.00/ano vs R$ 118.80/ano no mensal).'
    }
  ];

  if (subscriptionTier === null) {
    return (
      <div className="min-h-screen bg-[#262624] flex items-center justify-center">
        <div className="text-[#C2C0B6]">{t('subscription.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#262624] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-4"
          >
            {showTrial ? (
              <>
                <FiClock className="text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">
                  7 Dias Grátis - Sem Cartão
                </span>
              </>
            ) : (
              <>
                <FiStar className="text-[#56a69f]" />
                <span className="text-[#56a69f] text-sm font-medium">
                  {subscriptionTier === 'premium' ? t('subscription.premium_member') : t('subscription.upgrade_available')}
                </span>
              </>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            {subscriptionTier === 'premium'
              ? t('subscription.premium_title')
              : showTrial
                ? 'Teste Grátis Premium'
                : t('subscription.upgrade_title')
            }
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[#C2C0B6] max-w-2xl mx-auto"
          >
            {subscriptionTier === 'premium'
              ? t('subscription.premium_subtitle')
              : showTrial
                ? 'Experimente todos os recursos Premium por 7 dias, completamente grátis. Sem cartão de crédito.'
                : t('subscription.upgrade_subtitle')
            }
          </motion.p>
        </div>

        {/* Pricing Cards */}
        {subscriptionTier === 'free' && (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1F1E1D] border border-[#262626] rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Grátis</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">R$ 0</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <FiCheck className="text-green-400 mr-2" />
                  100 transações/mês
                </li>
                <li className="flex items-center text-gray-300">
                  <FiCheck className="text-green-400 mr-2" />
                  2 orçamentos
                </li>
                <li className="flex items-center text-gray-300">
                  <FiCheck className="text-green-400 mr-2" />
                  3 mensagens IA/dia
                </li>
                <li className="flex items-center text-gray-500">
                  <FiX className="text-gray-600 mr-2" />
                  Sem categorização IA
                </li>
                <li className="flex items-center text-gray-500">
                  <FiX className="text-gray-600 mr-2" />
                  Sem fluxo de caixa
                </li>
              </ul>
              <button
                disabled
                className="w-full bg-gray-700 text-gray-400 font-semibold py-3 rounded-lg cursor-not-allowed"
              >
                Plano Atual
              </button>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 rounded-2xl p-8 relative"
            >
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <FiCrown size={14} />
                  <span>Mais Popular</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">R$ 9,90</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <FiCheck className="text-amber-400 mr-2" />
                  Transações ilimitadas
                </li>
                <li className="flex items-center text-gray-300">
                  <FiCheck className="text-amber-400 mr-2" />
                  Orçamentos ilimitados
                </li>
                <li className="flex items-center text-gray-300">
                  <FiCheck className="text-amber-400 mr-2" />
                  IA ilimitada
                </li>
                <li className="flex items-center text-gray-300">
                  <FiCheck className="text-amber-400 mr-2" />
                  Categorização automática
                </li>
                <li className="flex items-center text-gray-300">
                  <FiCheck className="text-amber-400 mr-2" />
                  Fluxo de caixa 12 meses
                </li>
                <li className="flex items-center text-gray-300">
                  <FiCheck className="text-amber-400 mr-2" />
                  Exportação PDF/Excel
                </li>
                <li className="flex items-center text-gray-300">
                  <FiCheck className="text-amber-400 mr-2" />
                  Suporte prioritário
                </li>
              </ul>

              {showTrial ? (
                <button
                  onClick={() => handleUpgrade(true)}
                  disabled={isUpgrading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-4 rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {isUpgrading ? 'Processando...' : '🚀 Começar Teste Grátis'}
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(false)}
                  disabled={isUpgrading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-4 rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {isUpgrading ? 'Processando...' : '⚡ Fazer Upgrade'}
                </button>
              )}

              <p className="text-center text-xs text-gray-500 mt-3">
                {showTrial ? '7 dias grátis, depois R$ 9,90/mês' : 'Cancele quando quiser'}
              </p>
            </motion.div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Comparação Completa
          </h2>
          <div className="bg-[#1F1E1D] border border-[#262626] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#262624]">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-semibold">Recurso</th>
                  <th className="text-center p-4 text-gray-400 font-semibold">Grátis</th>
                  <th className="text-center p-4 text-amber-400 font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, idx) => (
                  <tr key={idx} className="border-t border-[#262626]">
                    <td className="p-4 text-white">{feature.name}</td>
                    <td className="p-4 text-center">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? (
                          <FiCheck className="text-green-400 mx-auto" />
                        ) : (
                          <FiX className="text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-400">{feature.free}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof feature.premium === 'boolean' ? (
                        feature.premium ? (
                          <FiCheck className="text-amber-400 mx-auto" />
                        ) : (
                          <FiX className="text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-amber-400 font-medium">{feature.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            O que dizem nossos usuários Premium
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                <div className="inline-block bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                  {testimonial.savings}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#1F1E1D] border border-[#262626] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-[#262624] transition-colors"
                >
                  <span className="font-semibold text-white pr-4">{faq.q}</span>
                  {openFaq === idx ? (
                    <FiChevronUp className="text-amber-400 flex-shrink-0" />
                  ) : (
                    <FiChevronDown className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-gray-400 border-t border-[#262626]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        {subscriptionTier === 'free' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Pronto para economizar mais?
              </h3>
              <p className="text-gray-300 mb-6">
                Junte-se a milhares de usuários que já transformaram suas finanças
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {showTrial && (
                  <button
                    onClick={() => handleUpgrade(true)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                  >
                    🚀 Testar Grátis por 7 Dias
                  </button>
                )}
                <button
                  onClick={() => handleUpgrade(false)}
                  className={`${
                    showTrial
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  } text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg transition-all`}
                >
                  ⚡ {showTrial ? 'Assinar Direto' : 'Fazer Upgrade Agora'}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-4">
                Cancele quando quiser • Sem taxas ocultas • Suporte prioritário
              </p>
            </div>
          </div>
        )}

        {/* Support */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Dúvidas? Entre em contato: <a href="mailto:suporte@monity.com" className="text-amber-400 hover:underline">suporte@monity.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSubscription;
