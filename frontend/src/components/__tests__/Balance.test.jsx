import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Balance from '../ui/Balance';
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

describe('Balance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form and displays the balance on submit', async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValue({ status: 200, data: { balance: 1000 } });
    render(<Balance />, { wrapper: createWrapper() });

    // Verificar se o formulário renderizou
    const input = screen.getByLabelText('balance.monthLabel');
    await user.type(input, '01/24');
    
    const submitButton = screen.getByRole('button', { name: /balance.requestBalance/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/balance/01/24');
    });
    
    // O componente exibe a chave de tradução com o valor
    expect(screen.getByText('balance.balanceInMonth')).toBeInTheDocument();
  });
}); 