import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { useTranslation } from 'react-i18next';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const InvestmentChart = ({ data, viewType }) => {
    const { t } = useTranslation();

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                {t('investmentCalculator.noDataToDisplay')}
            </div>
        );
    }

    const labels = data.map(point => point.label);
    const totalValues = data.map(point => point.totalValue);
    const contributions = data.map(point => point.totalContributions);
    const interest = data.map(point => point.interestEarned);

    const chartData = {
        labels,
        datasets: [
            {
                label: t('investmentCalculator.totalValue'),
                data: totalValues,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: data.length > 50 ? 0 : 3,
                pointHoverRadius: 5,
                pointBackgroundColor: 'rgb(34, 197, 94)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
            {
                label: t('investmentCalculator.contributions'),
                data: contributions,
                borderColor: 'rgb(147, 51, 234)',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: data.length > 50 ? 0 : 2,
                pointHoverRadius: 4,
                pointBackgroundColor: 'rgb(147, 51, 234)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
            {
                label: t('investmentCalculator.interest'),
                data: interest,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: data.length > 50 ? 0 : 2,
                pointHoverRadius: 4,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            }
        ]
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
                position: 'top',
                labels: {
                    color: '#fff',
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#fff',
                bodyColor: '#d1d5db',
                borderColor: 'rgba(75, 85, 99, 0.5)',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 2
                            }).format(context.parsed.y);
                        }
                        return label;
                    },
                    afterBody: function(context) {
                        if (context[0].dataIndex < data.length) {
                            const dataPoint = data[context[0].dataIndex];
                            const roi = dataPoint.totalContributions > 0 
                                ? ((dataPoint.interestEarned / dataPoint.totalContributions) * 100).toFixed(2)
                                : 0;
                            return `\nROI: ${roi}%`;
                        }
                        return '';
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(75, 85, 99, 0.3)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        size: 11
                    },
                    maxRotation: 45,
                    minRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 20
                }
            },
            y: {
                grid: {
                    color: 'rgba(75, 85, 99, 0.3)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        size: 11
                    },
                    callback: function(value) {
                        if (value >= 1000000) {
                            return '$' + (value / 1000000).toFixed(1) + 'M';
                        } else if (value >= 1000) {
                            return '$' + (value / 1000).toFixed(0) + 'K';
                        }
                        return '$' + value.toFixed(0);
                    }
                },
                beginAtZero: true
            }
        }
    };

    return (
        <div className="w-full" style={{ height: '400px' }}>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default InvestmentChart;





