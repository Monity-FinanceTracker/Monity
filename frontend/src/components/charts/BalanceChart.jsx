import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import Spinner from '../ui/Spinner';
import { get } from '../../utils/api';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/currency';
import { useAuth } from '../../context/useAuth';
import { useDemoData } from '../demo';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BalanceChart({ selectedRange }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { isDemoMode, demoData } = useDemoData();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // If in demo mode, generate demo monthly data
        if (isDemoMode && demoData && selectedRange !== 'current_month') {
            const currentBalance = demoData.profile.balance;
            const demoHistory = [
                { month: '2025/09', balance: currentBalance - 800 },
                { month: '2025/10', balance: currentBalance - 500 },
                { month: '2025/11', balance: currentBalance - 200 },
                { month: '2025/12', balance: currentBalance }
            ];
            setHistory(demoHistory);
            setLoading(false);
            setError(null);
            return;
        }

        if (isDemoMode && selectedRange === 'current_month') {
            setHistory([]);
            setLoading(false);
            return;
        }

        if (!user) {
            setHistory([]);
            setLoading(false);
            setError(null);
            return;
        }

        if (selectedRange === 'current_month') {
            setLoading(false);
            return;
        }

        const fetchChartData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: months } = await get('/months');
                if (!months || !months.length) {
                    setHistory([]);
                    setLoading(false);
                    return;
                }
                const balancePromises = months.map(monthStr => {
                    const parts = monthStr.split('/');
                    
                    // Handle malformed data - if we get more than 2 parts or invalid year/month
                    let year, month;
                    if (parts.length === 2) {
                        [year, month] = parts;
                    } else {
                        console.warn('Malformed month string:', monthStr);
                        // Skip this month if malformed
                        return Promise.resolve({ data: { balance: 0 } });
                    }
                    
                    // Validate year and month
                    const yearNum = parseInt(year);
                    const monthNum = parseInt(month);
                    
                    if (isNaN(yearNum) || isNaN(monthNum) || yearNum < 2000 || yearNum > 2100 || monthNum < 1 || monthNum > 12) {
                        console.warn('Invalid year/month:', { year, month, yearNum, monthNum });
                        return Promise.resolve({ data: { balance: 0 } });
                    }
                    
                    return get(`/balance/${month}/${year}`);
                });

                const balanceResponses = await Promise.all(balancePromises);

                const monthlyBalances = balanceResponses.map((response, index) => ({
                    month: months[index],
                    balance: response.data.balance || 0
                }));
                
                setHistory(monthlyBalances);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchChartData();
    }, [selectedRange, t, user, isDemoMode, demoData]);

    if (!user && !isDemoMode) {
        return <p className="text-center text-gray-400">{t('balanceChart.loginToView', 'Faça login para ver o gráfico de saldo.')}</p>;
    }

    if (loading && !isDemoMode) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner message={t('balanceChart.loading')} />
            </div>
        );
    }

    if (error && !isDemoMode) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400 mb-2">{t('balanceChart.error', { error })}</p>
                <p className="text-[#C2C0B6] text-sm">{t('balanceChart.tryAgain')}</p>
            </div>
        );
    }
    
    if (selectedRange === 'current_month') {
        return (
            <div className="text-center py-12">
                <p className="text-[#C2C0B6]">{t('balanceChart.allTimeMessage')}</p>
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <div className="text-left">
                <p className="text-[#C2C0B6]">{t('balanceChart.noData')}</p>
            </div>
        );
    }
    
    // Sort history by month
    const sortedHistory = [...history].sort((a, b) => {
        const [aYear, aMonth] = a.month.split('/');
        const [bYear, bMonth] = b.month.split('/');
        return (aYear - bYear) || (aMonth - bMonth);
    });

    // Format labels with abbreviated month names for better readability
    const labels = sortedHistory.map(item => {
        const [year, month] = item.month.split('/');
        const date = new Date(year, month - 1, 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        return `${monthName} ${year}`;
    });
    
    const balances = sortedHistory.map(item => parseFloat(item.balance));

    // Create dynamic colors based on balance value (positive = green, negative = red)
    const backgroundColors = balances.map(balance => 
        balance >= 0 
            ? 'rgba(86, 166, 159, 0.8)'  // Primary green with opacity
            : 'rgba(250, 249, 245, 0.8)' // Cream with opacity
    );

    const borderColors = balances.map(balance => 
        balance >= 0 
            ? 'rgba(86, 166, 159, 1)'    // Primary green solid
            : 'rgba(250, 249, 245, 1)'   // Cream solid
    );

    const data = {
        labels: labels,
        datasets: [
            {
                label: t('balanceChart.monthlyBalance'),
                data: balances,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
                // Make bars thinner
                barPercentage: 0.5,
                categoryPercentage: 0.6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: false, // Hide legend for cleaner look
            },
            title: {
                display: false, // Title is handled by the card header
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(31, 30, 29, 0.95)',
                titleColor: '#FAF9F5',
                bodyColor: '#C2C0B6',
                borderColor: '#262626',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: (context) => {
                        return context[0].label;
                    },
                    label: (context) => {
                        const value = context.parsed.y;
                        return `${t('balanceChart.balance')}: ${formatCurrency(Math.abs(value), value >= 0 ? 1 : 2)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#C2C0B6',
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif",
                    },
                    maxRotation: 0,
                    minRotation: 0,
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#C2C0B6',
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif",
                    },
                    callback: function(value) {
                        // Format large numbers with K suffix
                        if (Math.abs(value) >= 1000) {
                            return (value / 1000).toFixed(1) + 'K';
                        }
                        return value.toFixed(0);
                    }
                },
                border: {
                    display: false,
                }
            }
        },
        animation: {
            duration: 750,
            easing: 'easeInOutQuart',
        }
    };

    return (
        <div className="w-full h-[300px] sm:h-[350px] lg:h-[400px]">
            <Bar options={options} data={data} />
        </div>
    );
} 

export default BalanceChart;