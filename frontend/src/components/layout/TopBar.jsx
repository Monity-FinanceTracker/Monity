import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Icon } from "../../utils/iconMapping.jsx";

export default function TopBar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { t } = useTranslation();
  const { user, subscriptionTier } = useAuth();

  return (
    <header className="md:hidden sticky top-0 bg-[#0A0A0A] p-4 z-30 flex items-center justify-between shadow-md">
      {/* Mobile menu toggle */}
      <button 
        className="text-white bg-transparent border-none p-0 m-0"
        style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={t('topbar.toggle_menu')}
        aria-expanded={isMobileMenuOpen}
      >
        <Icon name="Menu" size="lg" className="text-white" />
      </button>

      <div className="flex items-center gap-3">
        <span className="text-white font-medium text-sm hidden sm:block">
          {user?.user_metadata?.name || t('topbar.user')}
        </span>
        
        {/* PRO Badge - Only for premium users */}
        {subscriptionTier === 'premium' && (
          <div className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs font-bold">
            PRO
          </div>
        )}
        
        {/* Profile Picture */}
        <div className="w-8 h-8 bg-[#01C38D] rounded-full flex items-center justify-center shadow-md">
          <span className="text-[#191E29] text-lg font-bold">
            {user?.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : (
              <Icon name="User" size="sm" className="text-[#191E29]" />
            )}
          </span>
        </div>
      </div>
    </header>
  );
} 