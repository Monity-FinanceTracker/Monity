import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { isPremium } from "../../utils/premium";
import { useTranslation } from "react-i18next";
import CloseButton from "../ui/CloseButton";
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
  Search,
  CalendarDays,
  MessageSquare,
  ArrowUpCircle,
  ArrowDownCircle,
  List,
  DollarSign
} from "lucide-react";

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen, isCollapsed, setIsCollapsed }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin, subscriptionTier } = useAuth();
  const premiumUser = subscriptionTier === 'premium';
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSearchOpen]);

  return (
    <>
      <aside className={`fixed top-0 left-0 h-screen bg-[#171717] text-white border-r border-[#262626] z-40 transform transition-[width,transform] duration-200 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'w-20' : 'w-72'} overflow-hidden`} style={{ willChange: 'transform, width' }}>
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="flex items-center h-[73px] border-b border-[#262626] flex-shrink-0">
            <div className="px-[18px]">
              {/* Menu Toggle - alinhado exatamente com os ícones da navegação */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color] duration-200 group overflow-hidden text-gray-400 hover:text-white hover:bg-[#262626]"
                style={{ 
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  margin: 0,
                  padding: '0.625rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  width: 'auto'
                }}
                title="Toggle Menu"
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <Menu className="w-5 h-5" style={{ color: 'white', stroke: 'white' }} />
                </div>
              </button>
            </div>
            
            {!isCollapsed && (
              <div className="flex items-center flex-1 justify-end pr-4">
                {/* Ícone de Pesquisa - alinhado à direita */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center justify-center p-2 transition-colors rounded-lg hover:bg-[#262626]"
                  style={{ 
                    background: 'transparent', 
                    border: 'none',
                    outline: 'none'
                  }}
                  title="Pesquisa Rápida"
                >
                  <Search className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 py-6 px-[18px] overflow-y-auto min-h-0 custom-scrollbar">
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
                <span className={`font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 ml-4 translate-x-0'}`}>{t('sidebar.dashboard')}</span>
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
                <span className={`font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 ml-4 translate-x-0'}`}>{t('sidebar.transactions')}</span>
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
                <span className={`font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 ml-4 translate-x-0'}`}>{t('sidebar.groups')}</span>
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
                <span className={`font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 ml-4 translate-x-0'}`}>{t('sidebar.categories')}</span>
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
                <span className={`font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 ml-4 translate-x-0'}`}>{t('sidebar.budgets')}</span>
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
                <span className={`font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 ml-4 translate-x-0'}`}>{t('sidebar.savings_goals')}</span>
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
                <span className={`font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 ml-4 translate-x-0'}`}>{t('sidebar.financial_health')}</span>
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
                <span className={`font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 ml-4 translate-x-0'}`}>{t('sidebar.ai_assistant')}</span>
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
                  <span className={`font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 ml-4 translate-x-0'}`}>{t('sidebar.cash_flow')}</span>
                </NavLink>
              )}

            </nav>

            {/* Premium/Subscription Section */}
            {!premiumUser && (
              <div className="mt-6">
                <NavLink
                  to="/subscription"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color,border-color] duration-200 group overflow-hidden transform-gpu ${isActive
                      ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                      : 'text-yellow-400 hover:bg-yellow-400/5 border border-yellow-400/10 hover:border-yellow-400/20'
                    }`
                  }
                  style={{ 
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'antialiased'
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? t('sidebar.go_premium') : ''}
                >
                  <div className="w-5 h-5 flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className={`font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 ml-4 translate-x-0'}`}>{t('sidebar.go_premium')}</span>
                </NavLink>
              </div>
            )}

            {premiumUser && (
              <div className="mt-6">
                <NavLink
                  to="/subscription"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-[background-color,color,border-color] duration-200 group overflow-hidden transform-gpu ${isActive
                      ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                      : 'text-yellow-400 hover:bg-yellow-400/5 border border-yellow-400/10 hover:border-yellow-400/20'
                    }`
                  }
                  style={{ 
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'antialiased'
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? t('sidebar.premium') : ''}
                >
                  <div className="w-5 h-5 flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className={`font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 ml-4 translate-x-0'}`}>{t('sidebar.premium')}</span>
                </NavLink>
              </div>
            )}

          </div>

          {/* Admin and Settings at bottom */}
          <div className="border-t border-[#262626] px-[18px] py-4 flex-shrink-0">
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
                  <span className={`font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 ml-4 translate-x-0'}`}>{t('sidebar.admin_dashboard')}</span>
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
                <span className={`font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 ml-4 translate-x-0'}`}>{t('sidebar.settings')}</span>
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

      {/* Search Modal */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="bg-[#171717] rounded-lg border border-[#262626] w-full max-w-2xl mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão X no canto superior direito */}
            <CloseButton 
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 z-10"
            />

            {/* Header com campo de busca */}
            <div className="flex items-center gap-3 p-4 pr-16 border-b border-[#262626]">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('topbar.quick_search') || 'Pesquisa rápida...'}
                autoFocus
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
              />
            </div>

            {/* Lista de ações rápidas */}
            <div className="max-h-96 overflow-y-auto">
              <div className="p-2">
                {/* Add Expense */}
                <button
                  onClick={() => {
                    navigate('/transactions?type=expense');
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#262626] transition-colors text-left"
                  style={{ background: 'transparent', border: 'none', outline: 'none' }}
                >
                  <ArrowDownCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Adicionar Despesa</div>
                    <div className="text-gray-400 text-xs">Registrar nova despesa</div>
                  </div>
                </button>

                {/* Add Income */}
                <button
                  onClick={() => {
                    navigate('/transactions?type=income');
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#262626] transition-colors text-left"
                  style={{ background: 'transparent', border: 'none', outline: 'none' }}
                >
                  <ArrowUpCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Adicionar Receita</div>
                    <div className="text-gray-400 text-xs">Registrar nova receita</div>
                  </div>
                </button>

                {/* View Transactions */}
                <button
                  onClick={() => {
                    navigate('/transactions');
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#262626] transition-colors text-left"
                  style={{ background: 'transparent', border: 'none', outline: 'none' }}
                >
                  <List className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Ver Transações</div>
                    <div className="text-gray-400 text-xs">Histórico de transações</div>
                  </div>
                </button>

                {/* Budgets */}
                <button
                  onClick={() => {
                    navigate('/budgets');
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#262626] transition-colors text-left"
                  style={{ background: 'transparent', border: 'none', outline: 'none' }}
                >
                  <DollarSign className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Orçamentos</div>
                    <div className="text-gray-400 text-xs">Gerenciar orçamentos</div>
                  </div>
                </button>

                {/* Groups */}
                <button
                  onClick={() => {
                    navigate('/groups');
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#262626] transition-colors text-left"
                  style={{ background: 'transparent', border: 'none', outline: 'none' }}
                >
                  <Users className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Grupos</div>
                    <div className="text-gray-400 text-xs">Ver e gerenciar grupos</div>
                  </div>
                </button>

                {/* Categories */}
                <button
                  onClick={() => {
                    navigate('/categories');
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#262626] transition-colors text-left"
                  style={{ background: 'transparent', border: 'none', outline: 'none' }}
                >
                  <Tag className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Categorias</div>
                    <div className="text-gray-400 text-xs">Gerenciar categorias</div>
                  </div>
                </button>

                {/* Settings */}
                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#262626] transition-colors text-left"
                  style={{ background: 'transparent', border: 'none', outline: 'none' }}
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Configurações</div>
                    <div className="text-gray-400 text-xs">Preferências e perfil</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer dica */}
            <div className="px-4 py-3 border-t border-[#262626] text-xs text-gray-400">
              Pressione <kbd className="px-2 py-1 bg-[#262626] rounded">ESC</kbd> para fechar
            </div>
          </div>
        </div>
      )}
    </>
  );
}
