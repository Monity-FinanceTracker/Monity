import React from 'react';
import { Link } from 'react-router-dom';

const AuthOverlay = ({ onClose }) => {

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1F1E1D] border border-[#262626] rounded-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-[#56a69f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#56a69f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Login Necessário
          </h3>
          <p className="text-[#C2C0B6]">
            Você precisa fazer login para realizar esta ação.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/login"
            className="flex-1 bg-[#56a69f] hover:bg-[#4a8f88] text-[#1F1E1D] font-bold px-6 py-3 rounded-lg transition-all duration-200"
          >
            Entrar
          </Link>
          <Link
            to="/signup"
            className="flex-1 bg-[#1F1E1D] hover:bg-[#262626] text-white border border-[#262626] font-bold px-6 py-3 rounded-lg transition-all duration-200"
          >
            Criar Conta
          </Link>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 text-[#C2C0B6] hover:text-white text-sm transition-colors"
          >
            Continuar visualizando
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthOverlay;

