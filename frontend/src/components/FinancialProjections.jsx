import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

const FinancialProjections = ({ goal }) => {
    const { t } = useTranslation();
    const [extraSavings, setExtraSavings] = useState('');
    const [projection, setProjection] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleProjection = async () => {
        if (!extraSavings || parseFloat(extraSavings) <= 0) {
            alert(t('financialProjections.enter_valid_amount'));
            return;
        }

        setLoading(true);
        try {
            const projectionData = await api.post('/financial-projections', {
                goalId: goal.id,
                extraMonthlySavings: parseFloat(extraSavings),
            });
            setProjection(projectionData.data);
        } catch (error) {
            console.error('Error calculating projection:', error);
            alert(t('financialProjections.calculation_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">{t('financialProjections.what_if_scenario')}</h3>
            <p className="mb-4">{t('financialProjections.see_impact')} <strong>{goal.goal_name}</strong></p>

            <div className="mb-4">
                <label htmlFor="extra-savings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('financialProjections.extra_monthly_savings')}</label>
                <input
                    type="number"
                    id="extra-savings"
                    value={extraSavings}
                    onChange={(e) => setExtraSavings(e.target.value)}
                    placeholder={t('financialProjections.amount_placeholder')}
                    className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>

            <button
                onClick={handleProjection}
                disabled={loading}
                className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            >
                {loading ? t('financialProjections.calculating') : t('financialProjections.calculate_projection')}
            </button>

            {projection && (
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-bold text-lg">{t('financialProjections.ai_powered_results')}</h4>
                    
                    <div className="my-4">
                        <p>{t('financialProjections.based_on_history')} <strong className="text-blue-500">${projection.predictedMonthlySavings}</strong> {t('financialProjections.per_month')}.</p>
                        <p>{t('financialProjections.with_extra_commitment')} <strong className="text-blue-500">${extraSavings}</strong>, {t('financialProjections.total_monthly_savings')} <strong className="text-blue-500">${(parseFloat(projection.predictedMonthlySavings) + parseFloat(extraSavings)).toFixed(2)}</strong>.</p>
                    </div>

                    <p>{t('financialProjections.with_this_pace')}</p>
                    <p className="text-2xl font-bold text-green-500">{projection.projectedDate}</p>
                    <p>{t('financialProjections.approximately')} <strong>{projection.monthsToReachGoal} {t('financialProjections.months')}</strong> {t('financialProjections.from_now')}, {t('financialProjections.and')} <strong>{projection.daysSooner} {t('financialProjections.days_sooner')}</strong> {t('financialProjections.than_original_target')}!</p>
                </div>
            )}
        </div>
    );
};

export default FinancialProjections; 