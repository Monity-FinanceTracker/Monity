import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
    };

    const getButtonClasses = (lang) => {
        const baseClasses = 'w-full px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer';

        if (i18n.language === lang) {
            return `${baseClasses} bg-[#56a69f] text-primary-foreground`;
        }

        return `${baseClasses} text-muted-foreground hover:bg-[#56a69f1A] hover:text-foreground hover:shadow-sm`;
    };

    return (
        <div className="flex justify-center rounded-md bg-card p-1 space-x-1 ">
            <button onClick={() => handleLanguageChange('en')} className={getButtonClasses('en')}>
                <span role="img" aria-label="English" className="mr-2">🇺🇸</span>
                English
            </button>
            <button onClick={() => handleLanguageChange('pt')} className={getButtonClasses('pt')}>
                <span role="img" aria-label="Português" className="mr-2">🇧🇷</span>
                Português
            </button>
        </div>
    );
};

export default LanguageSwitcher; 