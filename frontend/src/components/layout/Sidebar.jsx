import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  House,
  ArrowLeftRight,
  Target,
  Users,
  PieChart,
  Settings,
  TrendingUp,
  Sparkles,
  Tag,
  Menu,
  CalendarDays,
  MessageCircle,
  Calculator
} from "lucide-react";
import sidebarIcon from "../../../Sidebar-Icon.png";
import sidebarArrow from "../../../sidebarArrow.png";

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen, isCollapsed, setIsCollapsed }) {
  const { t } = useTranslation();
  const { isAdmin, subscriptionTier } = useAuth();
  const premiumUser = subscriptionTier === 'premium';
  const [isHovering, setIsHovering] = useState(false);
  const [isCollapsedHovering, setIsCollapsedHovering] = useState(false);

  // Estilos de transição consistentes para os NavLinks
  const navLinkTransition = {
    transition: 'background-color 200ms ease, color 200ms ease'
  };

  const navLinkTextTransition = {};

  return (
    <>
      <aside 
        className={`fixed top-0 left-0 h-screen ${isCollapsed ? 'bg-[#262624]' : 'bg-[#1F1E1D]'} border-r-[0.1px] border-[#4A4A4A] z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'w-16' : 'w-72'} overflow-hidden`} 
        style={{ 
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased'
        }}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className={`flex items-center h-[73px] flex-shrink-0 ${isCollapsed ? 'justify-center' : ''}`}>
            {isCollapsed ? (
              /* Botão centralizado quando collapsed */
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                onMouseEnter={() => setIsCollapsedHovering(true)}
                onMouseLeave={() => setIsCollapsedHovering(false)}
                className="flex items-center px-2 py-1.5 rounded-lg group"
                style={{ 
                  border: 'none',
                  outline: 'none',
                  background: isCollapsedHovering ? '#141414' : 'transparent',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 200ms ease'
                }}
                title="Toggle Menu"
              >
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  {/* Ícone de dois painéis quando collapsed */}
                  <img 
                    src={sidebarIcon} 
                    alt="Toggle sidebar" 
                    className="h-8 w-auto object-contain"
                    style={{ transform: 'scale(2.3)' }}
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
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="flex items-center px-1.5 py-1.5 rounded-lg group"
                  style={{ 
                    border: 'none',
                    outline: 'none',
                    background: isHovering ? '#141414' : 'transparent',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    width: 'auto',
                    transition: 'background-color 200ms ease'
                  }}
                  title="Toggle Menu"
                >
                  <div className="w-5 h-6 flex-shrink-0 flex items-center">
                    {isHovering ? (
                      /* Ícone de seta com barra quando hover e expandido */
                      <img 
                        src={sidebarArrow} 
                        alt="Collapse sidebar" 
                        className="h-8 w-auto object-contain"
                        style={{ transform: 'scale(1.7)' }}
                      />
                    ) : (
                      /* Ícone de dois painéis quando expandido sem hover */
                      <div className="w-5 h-5 flex items-center justify-center">
                        <img 
                          src={sidebarIcon} 
                          alt="Toggle sidebar" 
                          className="h-8 w-auto object-contain"
                          style={{ transform: 'scale(2.3)' }}
                        />
                      </div>
                    )}
                  </div>
                </button>
                {/* Monity Text - aparece apenas quando não está collapsed */}
                <span 
                  className="text-white text-2xl whitespace-nowrap font-stratford"
                  style={{ marginTop: '2px' }}
                >
                  Monity
                </span>
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

            {/* Premium/Subscription Section - Only show for non-premium users */}
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

            </nav>
          </div>
          
          {/* Fade effect at bottom */}
          <div className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t ${isCollapsed ? 'from-[#262624]' : 'from-[#1F1E1D]'} to-transparent pointer-events-none z-10`}></div>
        </div>

          {/* Admin and Settings at bottom */}
          <div className={`py-4 flex-shrink-0 ${isCollapsed ? 'bg-[#262624]' : 'bg-[#1F1E1D]'} relative z-20 ${isCollapsed ? 'px-0' : 'px-[18px]'}`}>
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
    </>
  );
}
