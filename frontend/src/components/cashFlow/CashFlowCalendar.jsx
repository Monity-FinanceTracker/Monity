import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import Spinner from '../ui/Spinner';
import ScheduledTransactionForm from './ScheduledTransactionForm';
import ScheduledTransactionList from './ScheduledTransactionList';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const CashFlowCalendar = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dailyBalances, setDailyBalances] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch calendar data
  const fetchCalendarData = useCallback(async (date = new Date()) => {
    try {
      setLoading(true);

      // Calculate first and last day of the month
      const startDate = moment(date).startOf('month').format('YYYY-MM-DD');
      const endDate = moment(date).endOf('month').format('YYYY-MM-DD');

      const response = await api.get('/cashflow/calendar-data', {
        params: { start_date: startDate, end_date: endDate }
      });

      console.log('Calendar data received:', {
        startDate,
        endDate,
        balanceCount: Object.keys(response.data.dailyBalances || {}).length,
        sampleDates: Object.keys(response.data.dailyBalances || {}).slice(0, 5)
      });

      setDailyBalances(response.data.dailyBalances || {});

    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast.error(t('cashFlow.error_loading_data'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCalendarData(currentMonth);
  }, [currentMonth, fetchCalendarData]);

  const handlePrevMonth = () => {
    setCurrentMonth(moment(currentMonth).subtract(1, 'month').toDate());
  };

  const handleNextMonth = () => {
    setCurrentMonth(moment(currentMonth).add(1, 'month').toDate());
  };

  const handleSelectDay = (date) => {
    setSelectedDate(date);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedDate(null);
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setSelectedDate(null);
    await fetchCalendarData(currentMonth);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const startOfMonth = moment(currentMonth).startOf('month');
    const endOfMonth = moment(currentMonth).endOf('month');
    const startDate = moment(startOfMonth).startOf('week');
    const endDate = moment(endOfMonth).endOf('week');

    const days = [];
    let day = startDate.clone();

    while (day.isBefore(endDate)) {
      days.push(day.clone());
      day.add(1, 'day');
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('cashFlow.title')}</h1>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#56a69f] text-white rounded-lg hover:bg-[#4a8f88] transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          {t('cashFlow.add_scheduled')}
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-[#1F1E1D] rounded-xl border border-[#262626] overflow-hidden">
        {/* Calendar Toolbar */}
        <div className="p-4 bg-[#1F1E1D] border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-[#262626] rounded-lg transition-colors text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-[#262626] rounded-lg transition-colors text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-white">
            {moment(currentMonth).format('MMMM YYYY')}
          </h2>
          <div className="w-[80px]" /> {/* Spacer for layout balance */}
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-[#C2C0B6] py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const dateStr = day.format('YYYY-MM-DD');
              const dayData = dailyBalances[dateStr];
              const isToday = day.isSame(moment(), 'day');
              const isCurrentMonth = day.month() === moment(currentMonth).month();

              return (
                <div
                  key={dateStr}
                  onClick={() => handleSelectDay(day.toDate())}
                  className={`
                    min-h-[100px] p-2 rounded-lg border cursor-pointer transition-all
                    ${isCurrentMonth ? 'bg-[#262624] border-[#262626]' : 'bg-[#1a1a18] border-[#1a1a18] opacity-50'}
                    ${dayData?.isNegative ? 'bg-red-900/20 border-red-900/30' : ''}
                    hover:border-[#56a69f] hover:shadow-lg
                  `}
                >
                  <div className={`
                    text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-[#56a69f] text-white' : 'text-[#C2C0B6]'}
                  `}>
                    {day.format('D')}
                  </div>

                  {dayData && (
                    <div className="space-y-1">
                      <div className={`text-xs font-bold ${dayData.isNegative ? 'text-[#FAF9F5]' : 'text-[#56A69f]'}`}>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(dayData.balance)}
                      </div>
                      {dayData.income > 0 && (
                        <div className="text-xs text-[#56A69f]">
                          +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dayData.income)}
                        </div>
                      )}
                      {dayData.expenses > 0 && (
                        <div className="text-xs text-[#D97757]">
                          -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dayData.expenses)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scheduled Transactions List */}
      <ScheduledTransactionList
        onUpdate={() => fetchCalendarData(currentMonth)}
      />

      {/* Form Modal */}
      {showForm && (
        <ScheduledTransactionForm
          selectedDate={selectedDate}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default CashFlowCalendar;
