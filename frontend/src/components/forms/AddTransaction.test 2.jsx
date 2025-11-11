import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
        expect(screen.getByText('addExpense.form_title')).toBeInTheDocument();
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
      api.addTransaction.mockResolvedValue({});
      
      render(<AddTransaction type="expense" />, { wrapper: createWrapper() });

      await waitFor(() => {
        const descriptionInput = screen.getByPlaceholderText('addExpense.description');
        const amountInput = screen.getByPlaceholderText('addExpense.amount');
        
        fireEvent.change(descriptionInput, { target: { value: 'Grocery Shopping' } });
        fireEvent.change(amountInput, { target: { value: '50.00' } });
      });

      // Selecionar categoria
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'Food' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /addExpense.add_expense/i });
      fireEvent.click(submitButton);

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
        expect(screen.getByText('addIncome.form_title')).toBeInTheDocument();
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
      api.addTransaction.mockResolvedValue({});
      
      render(<AddTransaction type="income" />, { wrapper: createWrapper() });

      await waitFor(() => {
        const descriptionInput = screen.getByPlaceholderText('addIncome.description');
        const amountInput = screen.getByPlaceholderText('addIncome.amount');
        
        fireEvent.change(descriptionInput, { target: { value: 'Monthly Salary' } });
        fireEvent.change(amountInput, { target: { value: '3000.00' } });
      });

      // Selecionar categoria
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'Salary' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /addIncome.add_income/i });
      fireEvent.click(submitButton);

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

