import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../../../color';

const BlockingAuthModal = () => {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="rounded-2xl p-8 max-w-md w-full text-center shadow-2xl" style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.border, borderWidth: '1px', borderStyle: 'solid' }}>
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: COLORS.accentLight }}>
            <svg className="w-8 h-8" style={{ color: COLORS.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
            Login Necessário
          </h3>
          <p style={{ color: COLORS.textSecondary }}>
            Faça login para acessar todas as funcionalidades do Monity.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/login"
            className="flex-1 font-bold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            style={{ backgroundColor: COLORS.accent, color: COLORS.textPrimary }}
            onMouseEnter={(e) => e.target.style.backgroundColor = COLORS.accentHover}
            onMouseLeave={(e) => e.target.style.backgroundColor = COLORS.accent}
          >
            Entrar
          </Link>
          <Link
            to="/signup"
            className="flex-1 font-bold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            style={{ backgroundColor: COLORS.cardBg, color: COLORS.textPrimary, borderColor: COLORS.border, borderWidth: '1px', borderStyle: 'solid' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = COLORS.border}
            onMouseLeave={(e) => e.target.style.backgroundColor = COLORS.cardBg}
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlockingAuthModal;

