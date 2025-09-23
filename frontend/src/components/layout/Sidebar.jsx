import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { isPremium } from "../../utils/premium";
import { useTranslation } from "react-i18next";
import { 
  LayoutDashboard,
  CreditCard,
  Target,
  Users,
  PieChart,
  Settings,
  TrendingUp,
  Wallet,
  Sparkles,
  Tag,
  Menu,
  X
} from "lucide-react";

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen, isCollapsed, setIsCollapsed }) {
  const { t } = useTranslation();
  const { isAdmin, subscriptionTier } = useAuth();
  const premiumUser = subscriptionTier === 'premium';

  return (
    <>
      <aside className={`fixed top-0 left-0 h-screen bg-[#23263a] text-white border-r border-[#31344d] z-40 transform transition-all duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'w-16' : 'w-64'}`} style={{ willChange: 'transform' }}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center p-4 border-b border-[#31344d] ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 bg-[#01C38D] rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#191E29]" />
                </div>
                <span className="text-lg font-semibold text-white">Monity</span>
              </Link>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:block border-0 outline-none focus:outline-none bg-transparent p-0 m-0 text-white hover:text-gray-300 transition-colors"
              style={{ 
                border: 'none', 
                outline: 'none', 
                background: 'transparent'
              }}
            >
              {isCollapsed ? <Menu className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-6 px-4">
            <nav className="space-y-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.dashboard') : ''}
              >
                <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium truncate">{t('sidebar.dashboard')}</span>}
              </NavLink>
              <NavLink
                to="/transactions"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.transactions') : ''}
              >
                <CreditCard className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium truncate">{t('sidebar.transactions')}</span>}
              </NavLink>
              <NavLink
                to="/groups"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.groups') : ''}
              >
                <Users className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium truncate">{t('sidebar.groups')}</span>}
              </NavLink>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.categories') : ''}
              >
                <Tag className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium truncate">{t('sidebar.categories')}</span>}
              </NavLink>
              <NavLink
                to="/budgets"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.budgets') : ''}
              >
                <PieChart className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium truncate">{t('sidebar.budgets')}</span>}
              </NavLink>

              <NavLink
                to="/savings-goals"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.savings_goals') : ''}
              >
                <Target className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium truncate">{t('sidebar.savings_goals')}</span>}
              </NavLink>

              <NavLink
                to="/financial-health"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.financial_health') : ''}
              >
                <TrendingUp className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium truncate">{t('sidebar.financial_health')}</span>}
              </NavLink>

            </nav>

            {/* Premium/Subscription Section */}
            {!premiumUser && !isCollapsed && (
              <div className="mt-6 px-3">
                <NavLink
                  to="/subscription"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                      ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                      : 'text-yellow-400 hover:bg-yellow-400/5 border border-yellow-400/10 hover:border-yellow-400/20'
                    } ${isCollapsed ? 'justify-center' : ''}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Sparkles className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium truncate">{t('sidebar.go_premium')}</span>
                </NavLink>
              </div>
            )}

            {premiumUser && !isCollapsed && (
              <div className="mt-6 px-3">
                <NavLink
                  to="/premium"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                      ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                      : 'text-yellow-400 hover:bg-yellow-400/5 border border-yellow-400/10 hover:border-yellow-400/20'
                    } ${isCollapsed ? 'justify-center' : ''}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Sparkles className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium truncate">{t('sidebar.premium')}</span>
                </NavLink>
              </div>
            )}

          </div>

          {/* Settings and Admin at bottom */}
          <div className="border-t border-[#31344d] p-4 space-y-2">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                  ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                  : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
              title={isCollapsed ? t('sidebar.settings') : ''}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium truncate">{t('sidebar.settings')}</span>}
            </NavLink>
            
            {/* Admin Dashboard at very bottom */}
            {isAdmin && (
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.admin_dashboard') : ''}
              >
                <span className="material-symbols-outlined text-lg">eye_tracking</span>
                {!isCollapsed && <span className="font-medium truncate">{t('sidebar.admin_dashboard')}</span>}
              </NavLink>
            )}
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
} 