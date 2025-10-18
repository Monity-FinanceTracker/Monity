import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import Spinner from '../ui/Spinner';
import ScheduledTransactionForm from './ScheduledTransactionForm';
import ScheduledTransactionList from './ScheduledTransactionList';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

const localizer = momentLocalizer(moment);

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

  const handleNavigate = (date) => {
    setCurrentMonth(date);
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
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

  // Custom day cell renderer
  const CustomDayCell = ({ date }) => {
    const dateStr = moment(date).format('YYYY-MM-DD');
    const dayData = dailyBalances[dateStr];

    // If no data, show just the day number
    if (!dayData) {
      return (
        <div className="h-full p-2">
          <div className="text-xs font-semibold mb-1 text-gray-400">
            {moment(date).format('D')}
          </div>
        </div>
      );
    }

    const formattedBalance = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(dayData.balance);

    return (
      <div className={`h-full p-2 ${dayData.isNegative ? 'bg-red-900/20' : ''}`}>
        <div className="text-xs font-semibold mb-1">
          {moment(date).format('D')}
        </div>
        <div className={`text-xs font-bold ${dayData.isNegative ? 'text-red-400' : 'text-green-400'}`}>
          {formattedBalance}
        </div>
        {dayData.income > 0 && (
          <div className="text-xs text-green-300 mt-1">
            +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dayData.income)}
          </div>
        )}
        {dayData.expenses > 0 && (
          <div className="text-xs text-red-300">
            -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dayData.expenses)}
          </div>
        )}
      </div>
    );
  };

  const components = {
    month: {
      dateHeader: ({ date }) => {
        return (
          <div className="flex flex-col h-full">
            <CustomDayCell date={date} />
          </div>
        );
      },
    },
  };

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
          {/* <div className="w-10 h-10 bg-[#01C38D]/10 rounded-lg flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-[#01C38D]" />
          </div> */}
          <div>
            <h1 className="text-2xl font-bold text-white">{t('cashFlow.title')}</h1>
            <p className="text-sm text-gray-400">{t('cashFlow.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#01C38D] text-[#232323] rounded-lg hover:bg-[#01C38D]/90 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          {t('cashFlow.add_scheduled')}
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-[#171717] rounded-xl border border-[#262626] overflow-hidden">
        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            events={[]}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            views={['month']}
            defaultView="month"
            date={currentMonth}
            onNavigate={handleNavigate}
            onSelectSlot={handleSelectSlot}
            selectable
            components={components}
            className="custom-calendar"
          />
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

      <style jsx>{`
        .calendar-container :global(.rbc-calendar) {
          color: white;
          background: transparent;
        }
        .calendar-container :global(.rbc-header) {
          background: #262626;
          padding: 12px 8px;
          font-weight: 600;
          border-bottom: 1px solid #404040;
          color: #f3f4f6;
        }
        .calendar-container :global(.rbc-month-view) {
          border: none;
        }
        .calendar-container :global(.rbc-month-row) {
          border-top: 1px solid #262626;
        }
        .calendar-container :global(.rbc-day-bg) {
          border-left: 1px solid #262626;
          background: #0A0A0A;
        }
        .calendar-container :global(.rbc-off-range-bg) {
          background: #171717;
        }
        .calendar-container :global(.rbc-today) {
          background: rgba(1, 195, 141, 0.1);
        }
        .calendar-container :global(.rbc-toolbar) {
          padding: 16px;
          background: #171717;
          border-bottom: 1px solid #262626;
          margin-bottom: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .calendar-container :global(.rbc-toolbar button) {
          color: white;
          background: #262626;
          border: 1px solid #404040;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .calendar-container :global(.rbc-toolbar button:hover) {
          background: #404040;
          border-color: #505050;
        }
        .calendar-container :global(.rbc-toolbar button:active),
        .calendar-container :global(.rbc-toolbar button.rbc-active) {
          background: #01C38D;
          color: #232323;
          border-color: #01C38D;
        }
        .calendar-container :global(.rbc-btn-group) {
          display: flex;
          gap: 8px;
        }
        .calendar-container :global(.rbc-btn-group button:first-child) {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        .calendar-container :global(.rbc-btn-group button:last-child) {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        .calendar-container :global(.rbc-btn-group button:not(:first-child):not(:last-child)) {
          border-radius: 0;
        }
        .calendar-container :global(.rbc-toolbar-label) {
          color: white;
          font-weight: 600;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default CashFlowCalendar;
