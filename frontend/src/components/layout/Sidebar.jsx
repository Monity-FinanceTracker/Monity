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
  X,
  CalendarDays,
  MessageSquare
} from "lucide-react";

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen, isCollapsed, setIsCollapsed }) {
  const { t } = useTranslation();
  const { isAdmin, subscriptionTier } = useAuth();
  const premiumUser = subscriptionTier === 'premium';

  return (
    <>
      <aside className={`fixed top-0 left-0 h-screen bg-[#171717] text-white border-r border-[#262626] z-40 transform transition-[width,transform] duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'w-16' : 'w-64'} overflow-hidden`} style={{ willChange: 'transform, width' }}>
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className={`flex items-center h-[73px] px-4 border-b border-[#262626] flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 bg-[#01C38D] rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#232323]" />
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
          <div className="flex-1 py-6 px-[10px] overflow-y-auto min-h-0 custom-scrollbar">
            <nav className="space-y-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color] duration-200 group overflow-hidden ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] '
                    : 'text-gray-400 hover:text-white hover:bg-[#262626]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.dashboard') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{t('sidebar.dashboard')}</span>
              </NavLink>
              <NavLink
                to="/transactions"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color] duration-200 group overflow-hidden ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] '
                    : 'text-gray-400 hover:text-white hover:bg-[#262626]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.transactions') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{t('sidebar.transactions')}</span>
              </NavLink>
              <NavLink
                to="/groups"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color] duration-200 group overflow-hidden ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] '
                    : 'text-gray-400 hover:text-white hover:bg-[#262626]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.groups') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{t('sidebar.groups')}</span>
              </NavLink>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color] duration-200 group overflow-hidden ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] '
                    : 'text-gray-400 hover:text-white hover:bg-[#262626]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.categories') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{t('sidebar.categories')}</span>
              </NavLink>
              <NavLink
                to="/budgets"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color] duration-200 group overflow-hidden ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] '
                    : 'text-gray-400 hover:text-white hover:bg-[#262626]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.budgets') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <PieChart className="w-5 h-5" />
                </div>
                <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{t('sidebar.budgets')}</span>
              </NavLink>

              <NavLink
                to="/savings-goals"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color] duration-200 group overflow-hidden ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] '
                    : 'text-gray-400 hover:text-white hover:bg-[#262626]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.savings_goals') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{t('sidebar.savings_goals')}</span>
              </NavLink>

              <NavLink
                to="/financial-health"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color] duration-200 group overflow-hidden ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] '
                    : 'text-gray-400 hover:text-white hover:bg-[#262626]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.financial_health') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{t('sidebar.financial_health')}</span>
              </NavLink>

              <NavLink
                to="/ai-assistant"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color] duration-200 group overflow-hidden ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] '
                    : 'text-gray-400 hover:text-white hover:bg-[#262626]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.ai_assistant') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{t('sidebar.ai_assistant')}</span>
              </NavLink>

              {/* Cash Flow - Premium Only */}
              {premiumUser && (
                <NavLink
                  to="/cashflow"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color] duration-200 group overflow-hidden ${isActive
                      ? 'bg-[#01C38D]/10 text-[#01C38D] '
                      : 'text-gray-400 hover:text-white hover:bg-[#262626]'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? t('sidebar.cash_flow') : ''}
                >
                  <div className="w-5 h-5 flex-shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{t('sidebar.cash_flow')}</span>
                </NavLink>
              )}

            </nav>

            {/* Premium/Subscription Section */}
            {!premiumUser && (
              <div className="mt-6 overflow-hidden">
                <NavLink
                  to="/subscription"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color,border-color] duration-200 group ${isActive
                      ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                      : 'text-yellow-400 hover:bg-yellow-400/5 border border-yellow-400/10 hover:border-yellow-400/20'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? t('sidebar.go_premium') : ''}
                >
                  <div className="w-5 h-5 flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{t('sidebar.go_premium')}</span>
                </NavLink>
              </div>
            )}

            {premiumUser && (
              <div className="mt-6 overflow-hidden">
                <NavLink
                  to="/subscription"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color,border-color] duration-200 group ${isActive
                      ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                      : 'text-yellow-400 hover:bg-yellow-400/5 border border-yellow-400/10 hover:border-yellow-400/20'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? t('sidebar.premium') : ''}
                >
                  <div className="w-5 h-5 flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{t('sidebar.premium')}</span>
                </NavLink>
              </div>
            )}

          </div>

          {/* Admin and Settings at bottom */}
          <div className="border-t border-[#262626] px-[10px] py-4 flex-shrink-0">
            <div className="space-y-2">
              {/* Admin Dashboard first */}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color] duration-200 group overflow-hidden ${isActive
                      ? 'bg-[#01C38D]/10 text-[#01C38D] '
                      : 'text-gray-400 hover:text-white hover:bg-[#262626]'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? t('sidebar.admin_dashboard') : ''}
                >
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">eye_tracking</span>
                  </div>
                  <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{t('sidebar.admin_dashboard')}</span>
                </NavLink>
              )}
              
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color] duration-200 group overflow-hidden ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] '
                    : 'text-gray-400 hover:text-white hover:bg-[#262626]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.settings') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{t('sidebar.settings')}</span>
              </NavLink>
            </div>
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
