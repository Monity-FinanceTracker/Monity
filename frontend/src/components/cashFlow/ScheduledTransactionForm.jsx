import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Banknote, Tag, Repeat, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import moment from 'moment';
import { CloseButton } from '../ui';

const ScheduledTransactionForm = ({ selectedDate, transaction, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    typeId: 2, // 1 = Expense, 2 = Income
    scheduled_date: selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : '',
    recurrence_pattern: 'once',
    recurrence_interval: 1,
    recurrence_end_date: '',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description || '',
        amount: transaction.amount || '',
        category: transaction.category || '',
        typeId: transaction.typeId || 2,
        scheduled_date: transaction.next_execution_date || '',
        recurrence_pattern: transaction.recurrence_pattern || 'once',
        recurrence_interval: transaction.recurrence_interval || 1,
        recurrence_end_date: transaction.recurrence_end_date || '',
      });
    }
  }, [transaction]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/categories');
      console.log('Categories fetched:', response.data);

      // Handle array or object response
      const categoryList = Array.isArray(response.data) ? response.data : response.data.categories || [];

      // Filter categories by the selected transaction type
      const filteredCategories = categoryList.filter(cat => cat.typeId === formData.typeId);
      setCategories(filteredCategories);

      console.log('Categories set:', filteredCategories.length, 'items for type', formData.typeId);

      // Clear category selection if current category is not in filtered list
      if (formData.category && !filteredCategories.some(cat => cat.name === formData.category)) {
        setFormData(prev => ({ ...prev, category: '' }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  }, [formData.typeId, formData.category]);

  // Fetch categories when typeId changes
  useEffect(() => {
    fetchCategories();
  }, [formData.typeId, fetchCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.category || !formData.scheduled_date) {
      toast.error(t('cashFlow.form.fill_required'));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        recurrence_interval: parseInt(formData.recurrence_interval) || 1,
        recurrence_end_date: formData.recurrence_end_date || null,
      };

      if (transaction) {
        await api.put(`/cashflow/scheduled-transactions/${transaction.id}`, payload);
        toast.success(t('cashFlow.form.update_success'));
      } else {
        await api.post('/cashflow/scheduled-transactions', payload);
        toast.success(t('cashFlow.form.create_success'));
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving scheduled transaction:', error);
      toast.error(t('cashFlow.form.save_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F1E1D] rounded-xl border border-[#262626] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Icon */}
        <div className="relative">
          {/* Icon Banner */}
          <div className="flex items-center justify-center pt-8 pb-4">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${formData.typeId === 2 ? 'bg-[#56a69f]/20' : 'bg-white/20'}
            `}>
              {formData.typeId === 2 ? (
                <TrendingUp className="w-8 h-8" style={{ color: '#56a69f' }} />
              ) : (
                <TrendingDown className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          
          {/* Close Button */}
          <div className="absolute right-4 top-4">
            <CloseButton onClick={onClose} size="sm" />
          </div>
        </div>

        {/* Title */}
        <div className="px-6 pb-4 border-b border-[#262626]">
          <h2 className="text-xl font-bold text-white text-center">
            {transaction ? t('cashFlow.form.edit_title') : t('cashFlow.form.create_title')}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('cashFlow.form.type')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, typeId: 2 }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.typeId === 2
                    ? 'border-[#56a69f] bg-[#56a69f]/10 text-[#56a69f]'
                    : 'border-[#262626] text-gray-400 hover:border-[#404040]'
                }`}
              >
                {t('cashFlow.form.income')}
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, typeId: 1 }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.typeId === 1
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-[#262626] text-gray-400 hover:border-[#404040]'
                }`}
              >
                {t('cashFlow.form.expense')}
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('cashFlow.form.description')} *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#262624] border border-[#262626] rounded-lg text-white focus:border-[#56a69f] focus:outline-none"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('cashFlow.form.amount')} *
            </label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full pl-10 pr-4 py-2 bg-[#262624] border border-[#262626] rounded-lg text-white focus:border-[#56a69f] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('cashFlow.form.category')} *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-[#262624] border border-[#262626] rounded-lg text-white focus:border-[#56a69f] focus:outline-none appearance-none"
                required
                disabled={loadingCategories}
              >
                <option 
                  value=""
                  style={{
                    minWidth: '250px',
                    width: 'max-content',
                    padding: '8px 12px',
                    backgroundColor: '#262624',
                    color: 'white'
                  }}
                >
                  {loadingCategories ? 'Loading categories...' : t('cashFlow.form.select_category')}
                </option>
                {categories.length === 0 && !loadingCategories && (
                  <option 
                    value="" 
                    disabled
                    style={{
                      minWidth: '250px',
                      width: 'max-content',
                      padding: '8px 12px',
                      backgroundColor: '#262624',
                      color: 'white'
                    }}
                  >
                    No categories available
                  </option>
                )}
                {categories.map(cat => (
                  <option 
                    key={cat.id} 
                    value={cat.name}
                    style={{
                      minWidth: '250px',
                      width: 'max-content',
                      padding: '8px 12px',
                      backgroundColor: '#262624',
                      color: 'white'
                    }}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('cashFlow.form.scheduled_date')} *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-[#262624] border border-[#262626] rounded-lg text-white focus:border-[#56a69f] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Recurrence Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Repeat className="inline w-4 h-4 mr-2" />
              {t('cashFlow.form.recurrence')}
            </label>
            <select
              name="recurrence_pattern"
              value={formData.recurrence_pattern}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#262624] border border-[#262626] rounded-lg text-white focus:border-[#56a69f] focus:outline-none"
            >
              <option 
                value="once"
                style={{
                  minWidth: '250px',
                  width: 'max-content',
                  padding: '8px 12px',
                  backgroundColor: '#262624',
                  color: 'white'
                }}
              >
                {t('cashFlow.form.once')}
              </option>
              <option 
                value="daily"
                style={{
                  minWidth: '250px',
                  width: 'max-content',
                  padding: '8px 12px',
                  backgroundColor: '#262624',
                  color: 'white'
                }}
              >
                {t('cashFlow.form.daily')}
              </option>
              <option 
                value="weekly"
                style={{
                  minWidth: '250px',
                  width: 'max-content',
                  padding: '8px 12px',
                  backgroundColor: '#262624',
                  color: 'white'
                }}
              >
                {t('cashFlow.form.weekly')}
              </option>
              <option 
                value="monthly"
                style={{
                  minWidth: '250px',
                  width: 'max-content',
                  padding: '8px 12px',
                  backgroundColor: '#262624',
                  color: 'white'
                }}
              >
                {t('cashFlow.form.monthly')}
              </option>
              <option 
                value="yearly"
                style={{
                  minWidth: '250px',
                  width: 'max-content',
                  padding: '8px 12px',
                  backgroundColor: '#262624',
                  color: 'white'
                }}
              >
                {t('cashFlow.form.yearly')}
              </option>
            </select>
          </div>

          {/* Recurrence Interval (only show if not 'once') */}
          {formData.recurrence_pattern !== 'once' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('cashFlow.form.interval')}
                </label>
                <input
                  type="number"
                  name="recurrence_interval"
                  value={formData.recurrence_interval}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 bg-[#262624] border border-[#262626] rounded-lg text-white focus:border-[#56a69f] focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('cashFlow.form.interval_hint')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('cashFlow.form.end_date')}
                </label>
                <input
                  type="date"
                  name="recurrence_end_date"
                  value={formData.recurrence_end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#262624] border border-[#262626] rounded-lg text-white focus:border-[#56a69f] focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('cashFlow.form.end_date_hint')}
                </p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-white hover:text-[#56a69f] rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#56a69f] text-white rounded-lg hover:bg-[#4A8F88] transition-colors font-medium disabled:opacity-50"
            >
              {loading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduledTransactionForm;
