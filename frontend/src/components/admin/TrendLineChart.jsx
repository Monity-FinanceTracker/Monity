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

/**
 * Trend Line Chart
 *
 * Multi-dataset line chart for visualizing trends over time
 * Used for DAU/WAU/MAU, growth metrics, etc.
 */
function TrendLineChart({
    labels,
    datasets,
    title,
    height = '300px',
    showLegend = true
}) {
    const chartData = {
        labels,
        datasets: datasets.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.data,
            borderColor: dataset.color || ['#56a69f', '#36A2EB', '#FFCE56'][index],
            backgroundColor: `${dataset.color || ['#56a69f', '#36A2EB', '#FFCE56'][index]}20`,
            borderWidth: 2,
            fill: dataset.fill !== false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: dataset.color || ['#56a69f', '#36A2EB', '#FFCE56'][index],
            pointBorderColor: '#1F1E1D',
            pointBorderWidth: 2,
        }))
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
                display: showLegend,
                position: 'top',
                align: 'start',
                labels: {
                    color: '#FAF9F5',
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: '#1F1E1D',
                titleColor: '#FAF9F5',
                bodyColor: '#8F8D85',
                borderColor: '#262626',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += context.parsed.y.toLocaleString();
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#8F8D85',
                    font: { size: 11 },
                    callback: function(value) {
                        if (value >= 1000) {
                            return (value / 1000).toFixed(1) + 'k';
                        }
                        return value;
                    }
                },
                grid: {
                    color: '#262626',
                    drawBorder: false
                }
            },
            x: {
                ticks: {
                    color: '#8F8D85',
                    font: { size: 11 },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 8
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            }
        }
    };

    return (
        <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6
                        hover:border-[#3a3a3a] transition-all duration-200">
            {title && (
                <h3 className="text-lg font-semibold text-white mb-4">
                    {title}
                </h3>
            )}
            <div style={{ height }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}

export default TrendLineChart;
