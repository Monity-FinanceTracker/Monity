import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { useTranslation } from "react-i18next";
import CloseButton from "../ui/CloseButton";
import {
  House,
  ArrowLeftRight,
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
  MessageCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  List,
  DollarSign,
  Calculator
} from "lucide-react";

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen, isCollapsed, setIsCollapsed }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin, subscriptionTier } = useAuth();
  const premiumUser = subscriptionTier === 'premium';
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Estilos de transição consistentes para os NavLinks
  const navLinkTransition = {
    transition: 'background-color 200ms ease, color 200ms ease'
  };

  const navLinkTextTransition = {};

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
      <aside 
        className={`fixed top-0 left-0 h-screen bg-[#1F1E1D] border-r border-[#262626] z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'w-16' : 'w-72'} overflow-hidden`} 
        style={{ 
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased'
        }}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className={`flex items-center h-[73px] border-b border-[#262626] flex-shrink-0 ${isCollapsed ? 'justify-center' : ''}`}>
            {isCollapsed ? (
              /* Botão centralizado quando collapsed */
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center px-2 py-1.5 rounded-lg group hover:bg-[#262626]"
                style={{ 
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 200ms ease'
                }}
                title="Toggle Menu"
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <Menu 
                    className="w-5 h-5" 
                    style={{ 
                      color: 'white', 
                      stroke: 'white'
                    }} 
                  />
                </div>
              </button>
            ) : (
              /* Layout normal quando expandido */
              <div 
                className="flex items-center gap-3 px-[18px]"
              >
                {/* Menu Toggle - alinhado exatamente com os ícones da navegação */}
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="flex items-center px-1.5 py-1.5 rounded-lg group hover:bg-[#262626]"
                  style={{ 
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    width: 'auto',
                    transition: 'background-color 200ms ease'
                  }}
                  title="Toggle Menu"
                >
                  <div className="w-5 h-5 flex-shrink-0">
                    <Menu 
                      className="w-5 h-5" 
                      style={{ 
                        color: 'white', 
                        stroke: 'white'
                      }} 
                    />
                  </div>
                </button>
                {/* Monity Text - aparece apenas quando não está collapsed */}
                <span 
                  className="text-white text-2xl whitespace-nowrap"
                  style={{ 
                    fontFamily: 'Stratford, sans-serif'
                  }}
                >
                  Monity
                </span>
              </div>
            )}
            
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
          <div className="flex-1 relative min-h-0">
            <div 
              className={`absolute inset-0 pt-3 pb-6 overflow-y-auto custom-scrollbar ${isCollapsed ? 'px-0' : 'px-[18px]'}`}
            >
              <nav 
                className={`space-y-0.5 ${isCollapsed ? 'flex flex-col items-center px-2' : ''}`}
              >
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden ${isActive
                    ? 'bg-[#000000] text-[#FAF9F5]'
                    : 'text-[#C2C0B6] hover:text-[#FAF9F5] hover:bg-[#141413]'
                  }`
                }
                style={navLinkTransition}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.dashboard') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0 [&>svg]:stroke-current">
                  <House className="w-5 h-5" stroke="currentColor" />
                </div>
                <span 
                  className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`} 
                  style={{ color: 'inherit', ...navLinkTextTransition }}
                >
                  {t('sidebar.dashboard')}
                </span>
              </NavLink>
              <NavLink
                to="/transactions"
                className={({ isActive }) =>
                  `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden ${isActive
                    ? 'bg-[#000000] text-[#FAF9F5]'
                    : 'text-[#C2C0B6] hover:text-[#FAF9F5] hover:bg-[#141413]'
                  }`
                }
                style={navLinkTransition}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.transactions') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0 [&>svg]:stroke-current">
                  <ArrowLeftRight className="w-5 h-5" stroke="currentColor" />
                </div>
                <span className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`} style={{ color: 'inherit', ...navLinkTextTransition }}>{t('sidebar.transactions')}</span>
              </NavLink>
              <NavLink
                to="/groups"
                className={({ isActive }) =>
                  `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden ${isActive
                    ? 'bg-[#000000] text-[#FAF9F5]'
                    : 'text-[#C2C0B6] hover:text-[#FAF9F5] hover:bg-[#141413]'
                  }`
                }
                style={navLinkTransition}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.groups') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0 [&>svg]:stroke-current">
                  <Users className="w-5 h-5" stroke="currentColor" />
                </div>
                <span className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`} style={{ color: 'inherit', ...navLinkTextTransition }}>{t('sidebar.groups')}</span>
              </NavLink>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden ${isActive
                    ? 'bg-[#000000] text-[#FAF9F5]'
                    : 'text-[#C2C0B6] hover:text-[#FAF9F5] hover:bg-[#141413]'
                  }`
                }
                style={navLinkTransition}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.categories') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0 [&>svg]:stroke-current">
                  <Tag className="w-5 h-5" stroke="currentColor" />
                </div>
                <span className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`} style={{ color: 'inherit', ...navLinkTextTransition }}>{t('sidebar.categories')}</span>
              </NavLink>
              <NavLink
                to="/budgets"
                className={({ isActive }) =>
                  `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden ${isActive
                    ? 'bg-[#000000] text-[#FAF9F5]'
                    : 'text-[#C2C0B6] hover:text-[#FAF9F5] hover:bg-[#141413]'
                  }`
                }
                style={navLinkTransition}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.budgets') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0 [&>svg]:stroke-current">
                  <PieChart className="w-5 h-5" stroke="currentColor" />
                </div>
                <span className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`} style={{ color: 'inherit', ...navLinkTextTransition }}>{t('sidebar.budgets')}</span>
              </NavLink>

              <NavLink
                to="/savings-goals"
                className={({ isActive }) =>
                  `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden ${isActive
                    ? 'bg-[#000000] text-[#FAF9F5]'
                    : 'text-[#C2C0B6] hover:text-[#FAF9F5] hover:bg-[#141413]'
                  }`
                }
                style={navLinkTransition}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.savings_goals') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0 [&>svg]:stroke-current">
                  <Target className="w-5 h-5" stroke="currentColor" />
                </div>
                <span className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`} style={{ color: 'inherit', ...navLinkTextTransition }}>{t('sidebar.savings_goals')}</span>
              </NavLink>

              <NavLink
                to="/financial-health"
                className={({ isActive }) =>
                  `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden ${isActive
                    ? 'bg-[#000000] text-[#FAF9F5]'
                    : 'text-[#C2C0B6] hover:text-[#FAF9F5] hover:bg-[#141413]'
                  }`
                }
                style={navLinkTransition}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.financial_health') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0 [&>svg]:stroke-current">
                  <TrendingUp className="w-5 h-5" stroke="currentColor" />
                </div>
                <span className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`} style={{ color: 'inherit', ...navLinkTextTransition }}>{t('sidebar.financial_health')}</span>
              </NavLink>

              {/* Cash Flow - Premium Only */}
              {premiumUser && (
                <NavLink
                  to="/cashflow"
                  className={({ isActive }) =>
                    `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden ${isActive
                      ? 'bg-[#000000] text-[#FAF9F5]'
                      : 'text-[#C2C0B6] hover:text-[#FAF9F5] hover:bg-[#141413]'
                    }`
                  }
                  style={navLinkTransition}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? t('sidebar.cash_flow') : ''}
                >
                  <div className="w-5 h-5 flex-shrink-0 [&>svg]:stroke-current">
                    <CalendarDays className="w-5 h-5" stroke="currentColor" />
                  </div>
                  <span className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`} style={{ color: 'inherit', ...navLinkTextTransition }}>{t('sidebar.cash_flow')}</span>
                </NavLink>
              )}

              <NavLink
                to="/ai-assistant"
                className={({ isActive }) =>
                  `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden ${isActive
                    ? 'bg-[#000000] text-[#FAF9F5]'
                    : 'text-[#C2C0B6] hover:text-[#FAF9F5] hover:bg-[#141413]'
                  }`
                }
                style={navLinkTransition}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.ai_assistant') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0 [&>svg]:stroke-current">
                  <MessageCircle className="w-5 h-5" stroke="currentColor" />
                </div>
                <span className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`} style={{ color: 'inherit', ...navLinkTextTransition }}>{t('sidebar.ai_assistant')}</span>
              </NavLink>

              {/* Investment Calculator */}
              <NavLink
                to="/investment-calculator"
                className={({ isActive }) =>
                  `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden ${isActive
                    ? 'bg-[#000000] text-[#FAF9F5]'
                    : 'text-[#C2C0B6] hover:text-[#FAF9F5] hover:bg-[#141413]'
                  }`
                }
                style={navLinkTransition}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.investment_calculator') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0 [&>svg]:stroke-current">
                  <Calculator className="w-5 h-5" stroke="currentColor" />
                </div>
                <span className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`} style={{ color: 'inherit', ...navLinkTextTransition }}>{t('sidebar.investment_calculator')}</span>
              </NavLink>

            {/* Premium/Subscription Section */}
            {!premiumUser && (
              <div className="mt-6">
                <NavLink
                  to="/subscription"
                  className={({ isActive }) =>
                    `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden transform-gpu ${isActive
                      ? 'border'
                      : 'border hover:border-[#4A8F88]/20'
                    }`
                  }
                  style={({ isActive }) => ({ 
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'antialiased',
                    transition: 'background-color 200ms ease, color 200ms ease, border-color 200ms ease',
                    color: '#4A8F88',
                    backgroundColor: isActive ? 'rgba(74, 143, 136, 0.1)' : 'transparent',
                    borderColor: isActive ? 'rgba(74, 143, 136, 0.2)' : 'rgba(74, 143, 136, 0.1)'
                  })}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(74, 143, 136, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = e.currentTarget.classList.contains('active') ? 'rgba(74, 143, 136, 0.1)' : 'transparent'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? t('sidebar.go_premium') : ''}
                >
                  <div className="w-5 h-5 flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span 
                    className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`}
                    style={navLinkTextTransition}
                  >
                    {t('sidebar.go_premium')}
                  </span>
                </NavLink>
              </div>
            )}

            {premiumUser && (
              <div className="mt-6">
                <NavLink
                  to="/subscription"
                  className={({ isActive }) =>
                    `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden transform-gpu ${isActive
                      ? 'border'
                      : 'border hover:border-[#4A8F88]/20'
                    }`
                  }
                  style={({ isActive }) => ({ 
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'antialiased',
                    transition: 'background-color 200ms ease, color 200ms ease, border-color 200ms ease',
                    color: '#4A8F88',
                    backgroundColor: isActive ? 'rgba(74, 143, 136, 0.1)' : 'transparent',
                    borderColor: isActive ? 'rgba(74, 143, 136, 0.2)' : 'rgba(74, 143, 136, 0.1)'
                  })}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(74, 143, 136, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = e.currentTarget.classList.contains('active') ? 'rgba(74, 143, 136, 0.1)' : 'transparent'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? t('sidebar.premium') : ''}
                >
                  <div className="w-5 h-5 flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span 
                    className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`}
                    style={navLinkTextTransition}
                  >
                    {t('sidebar.premium')}
                  </span>
                </NavLink>
              </div>
            )}

            </nav>
          </div>
          
          {/* Fade effect at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#1F1E1D] to-transparent pointer-events-none z-10"></div>
        </div>

          {/* Admin and Settings at bottom */}
          <div className={`border-t border-[#262626] py-4 flex-shrink-0 bg-[#1F1E1D] relative z-20 ${isCollapsed ? 'px-0' : 'px-[18px]'}`}>
            <div className={`space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
              {/* Admin Dashboard First */}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden ${isActive
                      ? 'bg-[#000000] text-[#FAF9F5]'
                      : 'text-[#C2C0B6] hover:text-[#FAF9F5] hover:bg-[#141413]'
                    }`
                  }
                  style={navLinkTransition}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? t('sidebar.admin_dashboard') : ''}
                >
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center [&>span]:text-current">
                    <span className="material-symbols-outlined text-base">eye_tracking</span>
                  </div>
                  <span className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`} style={{ color: 'inherit', ...navLinkTextTransition }}>{t('sidebar.admin_dashboard')}</span>
                </NavLink>
              )}
              
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center px-1.5 py-1.5 rounded-lg group overflow-hidden ${isActive
                    ? 'bg-[#000000] text-[#FAF9F5]'
                    : 'text-[#C2C0B6] hover:text-[#FAF9F5] hover:bg-[#141413]'
                  }`
                }
                style={navLinkTransition}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? t('sidebar.settings') : ''}
              >
                <div className="w-5 h-5 flex-shrink-0 [&>svg]:stroke-current">
                  <Settings className="w-5 h-5" stroke="currentColor" />
                </div>
                <span className={`text-[14px] font-medium whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-2.5'}`} style={{ color: 'inherit', ...navLinkTextTransition }}>{t('sidebar.settings')}</span>
              </NavLink>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="bg-[#1F1E1D] rounded-lg border border-[#262626] w-full max-w-2xl mx-4 relative transition-all duration-300 ease-in-out transform scale-100"
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
                    navigate('/add-expense');
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#262626] transition-colors text-left"
                  style={{ background: 'transparent', border: 'none', outline: 'none' }}
                >
                  <ArrowDownCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="text-white text-sm font-medium">Adicionar Despesa</div>
                    <div className="text-gray-400 text-xs">Registrar nova despesa</div>
                  </div>
                </button>

                {/* Add Income */}
                <button
                  onClick={() => {
                    navigate('/add-income');
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
