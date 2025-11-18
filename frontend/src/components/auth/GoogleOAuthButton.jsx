import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function GoogleOAuthButton({ onError }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            // Redirecionar para o endpoint de OAuth do backend
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
            window.location.href = `${apiUrl}/auth/google`;
        } catch (error) {
            console.error('Google OAuth error:', error);
            setLoading(false);
            if (onError) {
                onError(error.message || 'Erro ao conectar com Google');
            }
        }
    };

    return (
        <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-[#1F1E1C] hover:bg-[#252421] text-white py-3.5 rounded-xl font-semibold border border-[#9C9A92] hover:border-[#9C9A92] focus:ring-2 focus:ring-[#1F1E1C]/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
            <div className="flex items-center justify-center">
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('common.loading') || 'Carregando...'}
                    </>
                ) : (
                    <>
                        {/* Google Icon SVG */}
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        {t('common.continue_with_google') || 'Continuar com Google'}
                    </>
                )}
            </div>
        </button>
    );
}

export default GoogleOAuthButton;

