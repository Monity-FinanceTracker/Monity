import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, DollarSign, PieChart, Bell, Shield, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';

const GroupsInfo = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: <Users className="w-8 h-8" />,
            title: t('groupsInfo.features.shared_expenses.title'),
            description: t('groupsInfo.features.shared_expenses.description'),
            color: 'text-[#56a69f]'
        },
        {
            icon: <DollarSign className="w-8 h-8" />,
            title: t('groupsInfo.features.split_bills.title'),
            description: t('groupsInfo.features.split_bills.description'),
            color: 'text-[#56a69f]'
        },
        {
            icon: <PieChart className="w-8 h-8" />,
            title: t('groupsInfo.features.track_spending.title'),
            description: t('groupsInfo.features.track_spending.description'),
            color: 'text-[#56a69f]'
        },
        {
            icon: <Bell className="w-8 h-8" />,
            title: t('groupsInfo.features.notifications.title'),
            description: t('groupsInfo.features.notifications.description'),
            color: 'text-[#56a69f]'
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: t('groupsInfo.features.secure.title'),
            description: t('groupsInfo.features.secure.description'),
            color: 'text-[#56a69f]'
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: t('groupsInfo.features.insights.title'),
            description: t('groupsInfo.features.insights.description'),
            color: 'text-[#56a69f]'
        }
    ];

    const useCases = [
        {
            title: t('groupsInfo.useCases.family.title'),
            description: t('groupsInfo.useCases.family.description')
        },
        {
            title: t('groupsInfo.useCases.roommates.title'),
            description: t('groupsInfo.useCases.roommates.description')
        },
        {
            title: t('groupsInfo.useCases.trips.title'),
            description: t('groupsInfo.useCases.trips.description')
        },
        {
            title: t('groupsInfo.useCases.projects.title'),
            description: t('groupsInfo.useCases.projects.description')
        }
    ];

    const steps = [
        {
            number: '1',
            title: t('groupsInfo.howItWorks.step1.title'),
            description: t('groupsInfo.howItWorks.step1.description')
        },
        {
            number: '2',
            title: t('groupsInfo.howItWorks.step2.title'),
            description: t('groupsInfo.howItWorks.step2.description')
        },
        {
            number: '3',
            title: t('groupsInfo.howItWorks.step3.title'),
            description: t('groupsInfo.howItWorks.step3.description')
        },
        {
            number: '4',
            title: t('groupsInfo.howItWorks.step4.title'),
            description: t('groupsInfo.howItWorks.step4.description')
        }
    ];

    return (
        <div className="flex-1 bg-[#262624]">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#56a69f] to-[#4A8F88] text-white py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="mb-6">
                        <Users className="w-20 h-20 mx-auto mb-4" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {t('groupsInfo.hero.title')}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-white/90">
                        {t('groupsInfo.hero.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/groups/create"
                            className="bg-white px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
                            style={{ color: '#30302E' }}
                        >
                            <span style={{ color: '#30302E' }}>{t('groupsInfo.hero.createButton')}</span>
                            <ArrowRight className="w-5 h-5" style={{ color: '#30302E' }} />
                        </Link>
                        <Link
                            to="/groups"
                            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {t('groupsInfo.hero.viewGroupsButton')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 px-6 bg-[#1F1E1D]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
                        {t('groupsInfo.features.title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-[#262624] p-6 rounded-lg border border-[#3a3a38] hover:border-[#56a69f] transition-all duration-200 hover:transform hover:scale-105"
                            >
                                <div className={`${feature.color} mb-4`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-[#C2C0B6]">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="py-16 px-6 bg-[#262624]">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
                        {t('groupsInfo.howItWorks.title')}
                    </h2>
                    <div className="space-y-8">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="flex gap-6 items-start"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-[#56a69f] rounded-full flex items-center justify-center text-[#1F1E1D] font-bold text-xl">
                                        {step.number}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-[#C2C0B6]">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Use Cases Section */}
            <div className="py-16 px-6 bg-[#1F1E1D]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
                        {t('groupsInfo.useCases.title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {useCases.map((useCase, index) => (
                            <div
                                key={index}
                                className="bg-[#262624] p-6 rounded-lg border border-[#3a3a38] hover:border-[#56a69f] transition-all duration-200"
                            >
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {useCase.title}
                                </h3>
                                <p className="text-[#C2C0B6]">
                                    {useCase.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="py-16 px-6 bg-[#262624]">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
                        {t('groupsInfo.benefits.title')}
                    </h2>
                    <div className="space-y-4">
                        {[
                            t('groupsInfo.benefits.benefit1'),
                            t('groupsInfo.benefits.benefit2'),
                            t('groupsInfo.benefits.benefit3'),
                            t('groupsInfo.benefits.benefit4'),
                            t('groupsInfo.benefits.benefit5')
                        ].map((benefit, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 bg-[#1F1E1D] p-4 rounded-lg border border-[#3a3a38]"
                            >
                                <CheckCircle className="w-6 h-6 text-[#56a69f] flex-shrink-0 mt-1" />
                                <p className="text-gray-300 text-lg">
                                    {benefit}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 px-6 bg-gradient-to-br from-[#56a69f] to-[#4A8F88]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {t('groupsInfo.cta.title')}
                    </h2>
                    <p className="text-xl text-white/90 mb-8">
                        {t('groupsInfo.cta.description')}
                    </p>
                    <Link
                        to="/groups/create"
                        className="inline-flex items-center gap-2 bg-white px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                        style={{ color: '#30302E' }}
                    >
                        <span style={{ color: '#30302E' }}>{t('groupsInfo.cta.button')}</span>
                        <ArrowRight className="w-5 h-5" style={{ color: '#30302E' }} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default GroupsInfo;

