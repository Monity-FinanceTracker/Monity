import Spinner from "../ui/Spinner"
import { Doughnut } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { get } from '../../utils/api';
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth";
import { formatCurrency } from '../../utils/currency';

ChartJS.register(ArcElement, Tooltip, Legend);

function ExpenseChart() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'list'

    useEffect(() => {
        if (!user) {
            setExpenses([]);
            setLoading(false);
            setError(null);
            return;
        }

        const fetchExpenses = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await get('/transactions');
                
                const expenseData = Array.isArray(response.data) 
                    ? response.data.filter(transaction => transaction.typeId === 1)
                    : [];
                setExpenses(expenseData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchExpenses();
    }, [user]);

    if (!user) {
        return <p className="text-center text-gray-400">{t('expenseChart.loginToView', 'Faça login para ver seus gastos por categoria.')}</p>;
    }

    if(loading){
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner message={t('expenseChart.loading')} />
            </div>
        )
    }
    if(error){
        return (
            <div className="text-left">
                <p className="text-red-400">{t('expenseChart.error', { error })}</p>
            </div>
        )
    }
    if(!expenses.length){
        return (
            <div className="text-left">
                <p className="text-[#C2C0B6]">{t('expenseChart.noExpenses')}</p>
            </div>
        )
    }

    // Calculate totals by category
    const categoryTotals = expenses.reduce((acc, expense) => {
        if(acc[expense.category]){
            acc[expense.category] += parseFloat(expense.amount)
        } else {
            acc[expense.category] = parseFloat(expense.amount)
        }
        return acc
    }, {})

    // Sort categories by total amount, descending
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    // Top 5 categories, rest as 'Others'
    const top5 = sortedCategories.slice(0, 7);
    const others = sortedCategories.slice(7);
    let othersTotal = 0;
    if (others.length > 0) {
        othersTotal = others.reduce((sum, [, amount]) => sum + amount, 0);
    }
    const chartLabels = top5.map(([cat]) => cat);
    const chartDataValues = top5.map(([, amount]) => amount);
    if (othersTotal > 0) {
        chartLabels.push(t('expenseChart.others'));
        chartDataValues.push(othersTotal);
    }

    // Simple color palette
    const chartColors = [
        '#56a69f', '#36A2EB', '#FAF9F5', '#FFCE56', '#9B59B6', '#B0BEC5'
    ];

    const chartData = {
        labels: chartLabels,
        datasets: [
          {
            data: chartDataValues,
            backgroundColor: chartColors,
            borderWidth: 0,
          },
        ],
      };

    const chartOptions = {
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                align: 'center',
                labels: {
                    color: '#C2C0B6',
                    font: { size: 14 },
                    padding: 12,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(31, 30, 29, 0.95)',
                titleColor: '#FAF9F5',
                bodyColor: '#C2C0B6',
                borderColor: '#262626',
                borderWidth: 1,
            }
        },
        cutout: '65%',
        layout: {
            padding: 0
        },
        maintainAspectRatio: true
    };

    // Calculate total for percentages
    const total = chartDataValues.reduce((sum, val) => sum + val, 0);

    // Render bar list view
    const renderListView = () => (
        <div className="w-full space-y-3 px-4 py-2">
            {chartLabels.map((label, index) => {
                const amount = chartDataValues[index];
                const percentage = total > 0 ? (amount / total) * 100 : 0;
                const color = chartColors[index % chartColors.length];

                return (
                    <div key={label} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[#C2C0B6] font-medium">{label}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[#FAF9F5] font-semibold">
                                    {formatCurrency(amount, 1)}
                                </span>
                                <span className="text-[#56a69f] text-xs font-bold min-w-[45px] text-right">
                                    {percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-[#262626] rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: color
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="w-full">
            {/* Toggle Button */}
            <div className="flex justify-end mb-4 px-4">
                <button
                    onClick={() => setViewMode(viewMode === 'chart' ? 'list' : 'chart')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#262626] hover:bg-[#2a2a2a] rounded-lg transition-colors text-sm text-[#C2C0B6] hover:text-[#FAF9F5]"
                >
                    {viewMode === 'chart' ? (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <span>{t('expenseChart.listView', 'Vista de Lista')}</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                            <span>{t('expenseChart.chartView', 'Vista de Gráfico')}</span>
                        </>
                    )}
                </button>
            </div>

            {/* Content */}
            {viewMode === 'chart' ? (
                <div className="w-full flex justify-center items-center" style={{ minHeight: 300 }}>
                    <div className="max-w-[300px] w-full">
                        <Doughnut data={chartData} options={chartOptions} />
                    </div>
                </div>
            ) : (
                renderListView()
            )}
        </div>
    )
}

export default ExpenseChart
