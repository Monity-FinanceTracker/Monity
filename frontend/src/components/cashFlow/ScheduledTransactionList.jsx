import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Edit, Repeat, Calendar, Banknote } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import moment from 'moment';
import ScheduledTransactionForm from './ScheduledTransactionForm';

const ScheduledTransactionList = ({ onUpdate }) => {
  const { t } = useTranslation();
  const [scheduledTransactions, setScheduledTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchScheduledTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/cashflow/scheduled-transactions');
      setScheduledTransactions(response.data);
    } catch (error) {
      console.error('Error fetching scheduled transactions:', error);
      toast.error(t('cashFlow.error_loading_scheduled'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchScheduledTransactions();
  }, [fetchScheduledTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('cashFlow.confirm_delete'))) {
      return;
    }

    try {
      await api.delete(`/cashflow/scheduled-transactions/${id}`);
      toast.success(t('cashFlow.delete_success'));
      fetchScheduledTransactions();
      onUpdate();
    } catch (error) {
      console.error('Error deleting scheduled transaction:', error);
      toast.error(t('cashFlow.delete_error'));
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleCloseEdit = () => {
    setEditingTransaction(null);
  };

  const handleFormSubmit = async () => {
    setEditingTransaction(null);
    await fetchScheduledTransactions();
    onUpdate();
  };

  const getRecurrenceText = (transaction) => {
    if (transaction.recurrence_pattern === 'once') {
      return t('cashFlow.form.once');
    }

    const interval = transaction.recurrence_interval || 1;
    const pattern = t(`cashFlow.form.${transaction.recurrence_pattern}`);

    if (interval === 1) {
      return pattern;
    }

    return `${t('cashFlow.every')} ${interval} ${pattern.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="bg-[#1F1E1D] rounded-xl border border-[#262626] p-6">
        <div className="text-center text-[#C2C0B6]">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#1F1E1D] rounded-xl border border-[#262626]">
        <div className="p-6 border-b border-[#262626]">
          <h2 className="text-lg font-bold text-white">{t('cashFlow.scheduled_list_title')}</h2>
          <p className="text-sm text-[#C2C0B6] mt-1">{t('cashFlow.scheduled_list_subtitle')}</p>
        </div>

        <div className="divide-y divide-[#262626]">
          {scheduledTransactions.length === 0 ? (
            <div className="p-8 text-center text-[#C2C0B6]">
              {t('cashFlow.no_scheduled')}
            </div>
          ) : (
            scheduledTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 hover:bg-[#262626]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.typeId === 2 ? 'bg-[#56a69f]' : 'bg-red-400'
                      }`} />
                      <h3 className="font-semibold text-white">{transaction.description}</h3>
                      <span className={`text-sm font-bold ${
                        transaction.typeId === 2 ? 'text-[#56a69f]' : 'text-red-400'
                      }`}>
                        {transaction.typeId === 2 ? '+' : '-'}
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(transaction.amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[#C2C0B6]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{moment(transaction.next_execution_date).format('DD/MM/YYYY')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Repeat className="w-4 h-4" />
                        <span>{getRecurrenceText(transaction)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs px-2 py-1 bg-[#56a69f]/10 text-[#56a69f] rounded">
                          {transaction.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-2 text-[#C2C0B6] hover:text-[#56a69f] hover:bg-[#56a69f]/10 rounded-lg transition-colors"
                      title={t('common.edit')}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-2 text-[#C2C0B6] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      {editingTransaction && (
        <ScheduledTransactionForm
          transaction={editingTransaction}
          onClose={handleCloseEdit}
          onSubmit={handleFormSubmit}
        />
      )}
    </>
  );
};

export default ScheduledTransactionList;
