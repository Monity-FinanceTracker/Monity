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

ChartJS.register(ArcElement, Tooltip, Legend);

function ExpenseChart() {
    const { t } = useTranslation();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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
    }, []);

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

    return (
        <div className="w-full flex justify-center items-center" style={{ minHeight: 300 }}>
            <div className="max-w-[300px] w-full">
                <Doughnut data={chartData} options={chartOptions} />
            </div>
        </div>
    )
}

export default ExpenseChart
