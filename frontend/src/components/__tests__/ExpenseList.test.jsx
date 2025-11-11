import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExpenseList from '../transactions/ExpenseList';
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

describe('ExpenseList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders no expenses message when there are no expenses', async () => {
    api.get.mockResolvedValue({ data: [] });
    render(<ExpenseList />, { wrapper: createWrapper() });
    expect(await screen.findByText('expenseList.no_expenses')).toBeInTheDocument();
  });

  it('renders a list of expenses', async () => {
    const expenses = [
      { id: 1, date: '2024-01-01', category: 'Food', description: 'Lunch', amount: 15.00, typeId: 1 },
      { id: 2, date: '2024-01-01', category: 'Transport', description: 'Train', amount: 5.00, typeId: 1 },
    ];
    api.get.mockResolvedValue({ data: expenses });
    render(<ExpenseList />, { wrapper: createWrapper() });
    const foodElements = await screen.findAllByText('Food');
    expect(foodElements.length).toBeGreaterThan(0);

    const transportElements = await screen.findAllByText('Transport');
    expect(transportElements.length).toBeGreaterThan(0);
  });
}); 