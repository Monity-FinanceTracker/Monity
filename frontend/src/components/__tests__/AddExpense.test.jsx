import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddExpense from '../forms/AddExpense';
import * as api from '../../utils/api';

vi.mock('../../utils/api');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('AddExpense', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form and submits data correctly', async () => {
    const user = userEvent.setup();
    const categories = [
      { id: 1, name: 'Food', typeId: 1 },
      { id: 2, name: 'Transport', typeId: 1 },
    ];
    api.getCategories.mockResolvedValue(categories);
    api.addTransaction.mockResolvedValue({});
    
    render(<AddExpense />, { wrapper: createWrapper() });

    // Aguardar categorias carregarem
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('addExpense.description'), 'Test Expense');
    await user.type(screen.getByPlaceholderText('addExpense.amount'), '100');
    await user.selectOptions(screen.getByRole('combobox'), 'Food');
    
    const submitButton = screen.getByRole('button', { name: /addExpense.add_expense/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.addTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Test Expense',
          amount: 100,
          categoryName: 'Food',
          typeId: 1,
        })
      );
    });
  });
}); 