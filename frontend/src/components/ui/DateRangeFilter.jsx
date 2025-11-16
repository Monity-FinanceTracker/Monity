import React from 'react';
import { useTranslation } from 'react-i18next';

function DateRangeFilter({ selectedRange, setSelectedRange }) {
  const { t } = useTranslation();
  return (
    <div className="w-full md:w-auto md:flex md:justify-end mb-4">
      <label htmlFor="date-range-filter" className="sr-only">{t('dateRangeFilter.label')}</label>
      <select
        id="date-range-filter"
        value={selectedRange}
        onChange={(e) => setSelectedRange(e.target.value)}
        className="w-full md:w-auto bg-[#1F1E1D] text-white border border-[#262626] rounded-lg px-4 py-2 focus:outline-none focus:ring-0 focus:ring-transparent"
      >
        <option 
          value="current_month"
          style={{
            minWidth: '250px',
            width: 'max-content',
            padding: '8px 12px',
            backgroundColor: '#1F1E1D',
            color: 'white'
          }}
        >
          {t('dateRangeFilter.currentMonth')}
        </option>
        <option 
          value="all_time"
          style={{
            minWidth: '250px',
            width: 'max-content',
            padding: '8px 12px',
            backgroundColor: '#1F1E1D',
            color: 'white'
          }}
        >
          {t('dateRangeFilter.allTime')}
        </option>
      </select>
    </div>
  );
}

export default DateRangeFilter; 