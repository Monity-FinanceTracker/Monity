import React from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, Star, Shield } from 'lucide-react';

/**
 * SocialProofBanner Component
 * Displays trust signals and metrics for unauthenticated users
 * Appears subtly at the bottom of the dashboard in demo mode
 */
const SocialProofBanner = ({ className = '' }) => {
  const stats = [
    {
      icon: Users,
      value: '10.000+',
      label: 'usuários ativos',
      color: 'text-[#56a69f]'
    },
    {
      icon: DollarSign,
      value: 'R$ 50M+',
      label: 'gerenciados',
      color: 'text-[#4A8F88]'
    },
    {
      icon: Star,
      value: '4.8★',
      label: 'de 1.200+ avaliações',
      color: 'text-yellow-500'
    },
    {
      icon: Shield,
      value: '🔒',
      label: 'Criptografia de nível bancário',
      color: 'text-green-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-r from-[#1F1E1D]/95 via-[#262624]/95 to-[#1F1E1D]/95 backdrop-blur-sm border-t border-[#3a3a3a]/50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center gap-3 p-3 bg-[#232323]/50 rounded-lg border border-[#3a3a3a]/30 hover:border-[#56a69f]/30 transition-colors duration-200"
            >
              {stat.icon ? (
                <stat.icon className={`w-5 h-5 ${stat.color} flex-shrink-0`} />
              ) : (
                <span className="text-2xl flex-shrink-0">{stat.value}</span>
              )}
              <div className="text-left min-w-0">
                <p className={`font-bold text-sm ${stat.icon ? stat.color : 'text-white'} whitespace-nowrap overflow-hidden text-ellipsis`}>
                  {stat.icon ? stat.value : ''}
                </p>
                <p className="text-xs text-[#C2C0B6] whitespace-nowrap overflow-hidden text-ellipsis">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SocialProofBanner;
