import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { isPremium } from "../../utils/premium";
import { useTranslation } from "react-i18next";
import { GiPayMoney, GiTakeMyMoney } from "react-icons/gi";
import { FaMoneyBillWave, FaCog, FaChartLine, FaUsers } from "react-icons/fa";

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { t } = useTranslation();
  const { isAdmin, subscriptionTier } = useAuth();
  const premiumUser = subscriptionTier === 'premium';

  return (
    <>
      <aside className={`fixed top-0 left-0 h-full bg-[#23263a] text-white w-64 border-r border-[#31344d] z-40 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[#31344d]">
            <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-8 h-8 bg-[#01C38D] rounded-lg flex items-center justify-center">
                <span className="text-[#191E29] text-lg font-bold">M</span>
              </div>
              <span className="text-xl font-bold text-white">Monity</span>
            </Link>
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
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="font-medium">{t('sidebar.dashboard')}</span>
              </NavLink>
              <NavLink
                to="/transactions"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-medium">{t('sidebar.transactions')}</span>
              </NavLink>
              <NavLink
                to="/groups"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium">{t('sidebar.groups')}</span>
              </NavLink>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-medium">{t('sidebar.categories')}</span>
              </NavLink>
              <NavLink
                to="/budgets"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5h2m-2 2h2m-2 2h2" />
                </svg>
                <span className="font-medium">{t('sidebar.budgets')}</span>
              </NavLink>

              <NavLink
                to="/savings-goals"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
                </svg>
                <span className="font-medium">{t('sidebar.savings_goals')}</span>
              </NavLink>

              <NavLink
                to="/financial-health"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                    : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">{t('sidebar.financial_health')}</span>
              </NavLink>

            </nav>

            {/* Premium/Subscription Section */}
            {!premiumUser && (
              <div className="mt-6 px-3">
                <NavLink
                  to="/subscription"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                      ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                      : 'text-yellow-400 hover:bg-yellow-400/5 border border-yellow-400/10 hover:border-yellow-400/20'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L13 12l2.293 2.293a1 1 0 01-1.414 1.414L12 13.414l-2.293 2.293a1 1 0 01-1.414-1.414L10.586 12 8.293 9.707a1 1 0 011.414-1.414L12 10.586l2.293-2.293a1 1 0 011.414 0z" />
                  </svg>
                  <span className="font-medium">{t('sidebar.go_premium')}</span>
                </NavLink>
              </div>
            )}

            {premiumUser && (
              <div className="mt-6 px-3">
                <NavLink
                  to="/premium"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                      ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                      : 'text-yellow-400 hover:bg-yellow-400/5 border border-yellow-400/10 hover:border-yellow-400/20'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L13 12l2.293 2.293a1 1 0 01-1.414 1.414L12 13.414l-2.293 2.293a1 1 0 01-1.414-1.414L10.586 12 8.293 9.707a1 1 0 011.414-1.414L12 10.586l2.293-2.293a1 1 0 011.414 0z" />
                  </svg>
                  <span className="font-medium">{t('sidebar.premium')}</span>
                </NavLink>
              </div>
            )}

            {/* Admin Section */}
            {isAdmin && (
              <div className="mt-6">
                <div className="px-3 mb-3">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('sidebar.admin')}</span>
                </div>
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
                >
                  <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium">{t('sidebar.admin_dashboard')}</span>
                </NavLink>
              </div>
            )}

          </div>

          {/* Settings at bottom */}
          <div className="border-t border-[#31344d] p-4">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                  ? 'bg-[#01C38D]/10 text-[#01C38D] border-r-2 border-[#01C38D]'
                  : 'text-gray-400 hover:text-white hover:bg-[#31344d]'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">{t('sidebar.settings')}</span>
            </NavLink>
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