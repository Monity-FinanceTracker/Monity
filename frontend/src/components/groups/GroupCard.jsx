import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../utils/iconMapping';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
};

const formatDate = (dateString, t) => {
    if (!dateString) return t('groups.no_activity');
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('groups.today');
    if (diffDays === 1) return t('groups.yesterday');
    if (diffDays < 7) return t('groups.days_ago', { count: diffDays });
    if (diffDays < 30) return t('groups.weeks_ago', { count: Math.floor(diffDays / 7) });
    return date.toLocaleDateString();
};


const GroupCard = React.memo(({ group }) => {
    const { t } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const formattedTotal = useMemo(() => formatCurrency(group.totalSpent), [group.totalSpent]);
    const formattedPerMember = useMemo(() => formatCurrency(group.avgSpentPerMember), [group.avgSpentPerMember]);
    const formattedDate = useMemo(() => formatDate(group.lastActivity, t), [group.lastActivity, t]);

    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isClickOnButton = buttonRef.current && buttonRef.current.contains(event.target);
            const isClickOnDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
            
            if (!isClickOnButton && !isClickOnDropdown) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleDropdownToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="relative">
            <Link 
                to={`/groups/${group.id}`}
                className="block"
            >
                <div className="bg-[#1F1E1D] border border-[#262626] rounded-lg p-6 hover:border-[#3a3a3a] transition-all duration-200 aspect-square flex flex-col justify-between relative">
                    <div>
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white line-clamp-2 flex-1 pr-2">
                                {group.name}
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="text-[#56a69f] font-bold text-2xl mb-1">
                                {formattedTotal}
                            </div>
                            <div className="text-[#C2C0B6] text-xs">
                                {t('groups.total_spent')}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#56a69f] rounded-full flex items-center justify-center">
                                    <span className="text-[#1F1E1D] font-bold text-sm">
                                        {group.memberCount || 0}
                                    </span>
                                </div>
                                <span className="text-[#C2C0B6] text-xs">
                                    {t('groups.members')}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-white font-semibold text-sm">
                                    {group.expenseCount || 0}
                                </div>
                                <div className="text-[#C2C0B6] text-xs">
                                    {t('groups.expenses')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Dropdown Button */}
            <button
                ref={buttonRef}
                onClick={handleDropdownToggle}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#262626] transition-colors z-10"
                aria-label={t('groups.more_information')}
            >
                <Icon name="MoreVertical" size="sm" className="text-[#C2C0B6] hover:text-white" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div 
                    ref={dropdownRef}
                    className="absolute top-10 right-2 z-50 min-w-[200px] bg-[#1F1E1D] border-2 border-[#3a3a3a] rounded-lg shadow-lg p-4"
                >
                    <div className="space-y-3">
                        <div>
                            <div className="text-[#8B8A85] text-xs mb-1.5 font-medium">{t('groups.per_member')}</div>
                            <div className="text-white font-bold text-base">{formattedPerMember}</div>
                        </div>
                        
                        <div className="pt-3 border-t border-[#262626]">
                            <div className="text-[#8B8A85] text-xs mb-1.5 font-medium">{t('groups.last_activity')}</div>
                            <div className="text-white font-bold text-base">{formattedDate}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

GroupCard.displayName = 'GroupCard';

export default GroupCard;

