import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddTransaction from './AddTransaction';
import * as api from '../../utils/api';

// Mock das dependências
vi.mock('../../utils/api');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock do i18next
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

describe('AddTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getCategories to return test data
    api.getCategories.mockResolvedValue([
      { id: 1, name: 'Food', typeId: 1 },
      { id: 2, name: 'Salary', typeId: 2 },
      { id: 3, name: 'Transport', typeId: 1 },
      { id: 4, name: 'Freelance', typeId: 2 },
    ]);
  });

  describe('Expense Mode', () => {
    it('should render expense form correctly', async () => {
      render(<AddTransaction type="expense" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('addExpense.title')).toBeInTheDocument();
        expect(screen.getByText('addExpense.subtitle')).toBeInTheDocument();
      });
    });

    it('should show only expense categories', async () => {
      render(<AddTransaction type="expense" />, { wrapper: createWrapper() });

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        const options = select.querySelectorAll('option');
        
        // Deve ter 3 opções: placeholder + 2 categorias de despesa (Food, Transport)
        expect(options.length).toBe(3);
      });
    });

    it('should submit expense successfully', async () => {
      const user = userEvent.setup();
      api.addTransaction.mockResolvedValue({});
      
      render(<AddTransaction type="expense" />, { wrapper: createWrapper() });

      const descriptionInput = await screen.findByPlaceholderText('addExpense.description');
      const amountInput = await screen.findByPlaceholderText('addExpense.amount');
      const select = await screen.findByRole('combobox');

      await waitFor(() => {
        expect(select.querySelectorAll('option').length).toBeGreaterThan(1);
      });
      
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Grocery Shopping');
      await user.clear(amountInput);
      await user.type(amountInput, '50.00');
      await user.selectOptions(select, 'Food');

      const submitButton = screen.getByRole('button', { name: /addExpense.add_expense/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(api.addTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Grocery Shopping',
            amount: 50,
            category: 'Food',
            typeId: 1,
          })
        );
      });
    });
  });

  describe('Income Mode', () => {
    it('should render income form correctly', async () => {
      render(<AddTransaction type="income" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('addIncome.title')).toBeInTheDocument();
        expect(screen.getByText('addIncome.subtitle')).toBeInTheDocument();
      });
    });

    it('should show only income categories', async () => {
      render(<AddTransaction type="income" />, { wrapper: createWrapper() });

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        const options = select.querySelectorAll('option');
        
        // Deve ter 3 opções: placeholder + 2 categorias de receita (Salary, Freelance)
        expect(options.length).toBe(3);
      });
    });

    it('should submit income successfully', async () => {
      const user = userEvent.setup();
      api.addTransaction.mockResolvedValue({});
      
      render(<AddTransaction type="income" />, { wrapper: createWrapper() });

      const descriptionInput = await screen.findByPlaceholderText('addIncome.description');
      const amountInput = await screen.findByPlaceholderText('addIncome.amount');
      const select = await screen.findByRole('combobox');

      await waitFor(() => {
        expect(select.querySelectorAll('option').length).toBeGreaterThan(1);
      });

      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Monthly Salary');
      await user.clear(amountInput);
      await user.type(amountInput, '3000.00');
      await user.selectOptions(select, 'Salary');

      const submitButton = screen.getByRole('button', { name: /addIncome.add_income/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(api.addTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Monthly Salary',
            amount: 3000,
            category: 'Salary',
            typeId: 2,
          })
        );
      });
    });
  });

  describe('Validation', () => {
    it('should require all fields', async () => {
      await import('react-toastify');
      
      render(<AddTransaction type="expense" />, { wrapper: createWrapper() });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /addExpense.add_expense/i });
        fireEvent.click(submitButton);
      });

      // HTML5 validation should prevent submission with empty required fields
      // The form should not call addTransaction
      expect(api.addTransaction).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Differences', () => {
    it('should use different colors for expense and income', async () => {
      const { container: expenseContainer } = render(
        <AddTransaction type="expense" />, 
        { wrapper: createWrapper() }
      );

      // Procurar por elementos com classes específicas de despesa (red)
      await waitFor(() => {
        expect(expenseContainer.querySelector('.from-red-500')).toBeInTheDocument();
      });

      const { container: incomeContainer } = render(
        <AddTransaction type="income" />, 
        { wrapper: createWrapper() }
      );

      // Procurar por elementos com classes específicas de receita (green)
      await waitFor(() => {
        expect(incomeContainer.querySelector('.from-green-500')).toBeInTheDocument();
      });
    });
  });
});

