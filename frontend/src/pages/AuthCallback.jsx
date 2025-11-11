import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/useAuth';
import monityLogo from '../assets/Logo-Escrito-Branca.png';

function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshSubscription } = useAuth();
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Verificar se há erro nos parâmetros
                const errorParam = searchParams.get('error');
                if (errorParam) {
                    setError(errorParam);
                    setProcessing(false);
                    return;
                }

                // Obter a sessão do hash da URL (Supabase OAuth)
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    throw sessionError;
                }

                if (session) {
                    // Refresh subscription para o novo usuário
                    await refreshSubscription();
                    
                    // Redirecionar para dashboard
                    navigate('/', { replace: true });
                } else {
                    setError('Não foi possível completar o login com Google');
                    setProcessing(false);
                }
            } catch (err) {
                console.error('Callback error:', err);
                setError(err.message || 'Erro ao processar login');
                setProcessing(false);
            }
        };

        handleCallback();
    }, [searchParams, navigate, refreshSubscription]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#01C38D]/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#01C38D]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md mx-auto">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center justify-center">
                    <img src={monityLogo} alt="Monity Logo" className="w-auto scale-[0.6] -mb-5" />
                </div>

                {/* Card */}
                <div className="bg-[#171717] backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#262626]">
                    {processing ? (
                        <div className="text-center">
                            {/* Loading Spinner */}
                            <div className="flex justify-center mb-6">
                                <svg className="animate-spin h-12 w-12 text-[#01C38D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Processando Login</h2>
                            <p className="text-gray-400">Aguarde enquanto completamos seu login com Google...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center">
                            {/* Error Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Erro no Login</h2>
                            <p className="text-red-400 mb-6">{error}</p>
                            
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-gradient-to-r from-[#01C38D] to-[#01C38D]/80 text-white py-3 rounded-xl font-semibold hover:from-[#01C38D]/90 hover:to-[#01C38D]/70 transition-all duration-300"
                            >
                                Voltar para Login
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default AuthCallback;

