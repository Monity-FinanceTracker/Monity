import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Smart button that allows users to quickly accept AI category suggestions
 */
const SmartCategoryButton = ({ suggestion, onAccept, isVisible }) => {
    const { t } = useTranslation();

    if (!isVisible || !suggestion) return null;

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return 'bg-green-500';
        if (confidence >= 0.6) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    const getConfidenceText = (confidence) => {
        if (confidence >= 0.8) return t('smartCategorization.high_confidence');
        if (confidence >= 0.6) return t('smartCategorization.medium_confidence');
        return t('smartCategorization.low_confidence');
    };

    return (
        <div className="mt-2 p-3 bg-[#1F1E1D] border border-[#56a69f]/30 rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getConfidenceColor(suggestion.confidence)}`}></div>
                        <span className="text-white font-medium">{suggestion.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#C2C0B6]">
                            {Math.round(suggestion.confidence * 100)}% • {getConfidenceText(suggestion.confidence)}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => onAccept(suggestion)}
                    className="px-4 py-2 bg-[#56a69f] text-white text-sm font-medium rounded-lg hover:bg-[#4A8F88] transition-colors"
                >
                    ✓ {t('smartCategorization.accept_suggestion')}
                </button>
            </div>
            <div className="mt-2 text-xs text-[#C2C0B6]">
                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {t('smartCategorization.auto_create_hint')}
            </div>
        </div>
    );
};

export default SmartCategoryButton; 