import axios from 'axios';
import { supabase } from './supabase';

console.log("API URL from env:", import.meta.env.VITE_API_URL);

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
});

API.interceptors.request.use(
    async (config) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const get = (endpoint) => {
    return API.get(endpoint);
};

export const post = (endpoint, data) => {
    return API.post(endpoint, data);
};

export const put = (endpoint, data) => {
    return API.put(endpoint, data);
};

export const remove = (endpoint) => {
    return API.delete(endpoint);
};

export const del = (endpoint) => {
    return API.delete(endpoint);
};

// Budget specific API calls
export const getBudgets = async () => {
    const { data } = await API.get('/budgets');
    return data;
};

export const upsertBudget = async (budget) => {
    // Transform the old budget format to match the new API structure
    const transformedBudget = {
        name: budget.name || `Budget for category ${budget.categoryId}`,
        amount: budget.amount,
        categoryId: budget.categoryId,
        period: 'monthly', // Default to monthly for legacy budgets
        startDate: budget.month || new Date().toISOString().split('T')[0]
    };
    const { data } = await API.post('/budgets', transformedBudget);
    return data;
};

export const deleteBudget = async (id) => {
    const { data } = await API.delete(`/budgets/${id}`);
    return data;
};

// Category specific API calls
export const getCategories = async () => {
    const { data } = await API.get('/categories');
    return data;
};

// Recurring Transactions specific API calls
export const getRecurringTransactions = async () => {
    const { data } = await API.get('/recurring-transactions');
    return data;
};

export const addRecurringTransaction = async (transaction) => {
    const { data } = await API.post('/recurring-transactions', transaction);
    return data;
};

export const updateRecurringTransaction = async (id, transaction) => {
    const { data } = await API.put(`/recurring-transactions/${id}`, transaction);
    return data;
};

export const deleteRecurringTransaction = async (id) => {
    const { data } = await API.delete(`/recurring-transactions/${id}`);
    return data;
};

export const addTransaction = async (transaction) => {
    const { data } = await API.post('/transactions', transaction);
    return data;
};

export const updateTransaction = async (id, transaction) => {
    const { data } = await API.put(`/transactions/${id}`, transaction);
    return data;
};

export const deleteTransaction = async (id) => {
    const { data } = await API.delete(`/transactions/${id}`);
    return data;
};

export const processRecurringTransactions = async () => {
    const { data } = await API.post('/recurring-transactions/process');
    return data;
};

// Transaction Types specific API calls
export const getTransactionTypes = async () => {
    const { data } = await API.get('/transaction-types');
    return data;
};

export const getLiabilities = () => API.get('/net-worth/liabilities').then(res => res.data);
export const addLiability = (liability) => API.post('/net-worth/liabilities', liability).then(res => res.data);
export const updateLiability = (id, liability) => API.put(`/net-worth/liabilities/${id}`, liability).then(res => res.data);
export const deleteLiability = (id) => API.delete(`/net-worth/liabilities/${id}`).then(res => res.data);


// Group and Expense Splitting
export const createGroup = (group) => API.post('/groups', group).then(res => res.data);
export const getGroups = () => API.get('/groups').then(res => res.data);
export const getGroupById = (id) => API.get(`/groups/${id}`).then(res => res.data);
export const updateGroup = (id, group) => API.put(`/groups/${id}`, group).then(res => res.data);
export const deleteGroup = (id) => API.delete(`/groups/${id}`);
export const addGroupMember = (groupId, name) => API.post(`/groups/${groupId}/members`, { name }).then(res => res.data);
export const removeGroupMember = (groupId, userId) => API.delete(`/groups/${groupId}/members/${userId}`);
export const addGroupExpense = (groupId, expense) => API.post(`/groups/${groupId}/expenses`, expense).then(res => res.data);
export const updateGroupExpense = (expenseId, expense) => API.put(`/groups/expenses/${expenseId}`, expense).then(res => res.data);
export const deleteGroupExpense = (expenseId) => API.delete(`/groups/expenses/${expenseId}`);
export const settleExpenseShare = (shareId) => API.post(`/groups/shares/${shareId}/settle`).then(res => res.data);

// User search and invitation functions
export const searchUsers = (query) => API.get(`/users/search?q=${encodeURIComponent(query)}`).then(res => res.data);
export const sendGroupInvitation = (groupId, email) => API.post(`/groups/${groupId}/invite`, { email }).then(res => res.data);
export const getPendingInvitations = () => API.get('/invitations/pending').then(res => res.data);
export const respondToInvitation = (invitationId, response) => API.post(`/invitations/${invitationId}/respond`, { response }).then(res => res.data);

// AI Chat functions
export const sendAIChatMessage = (message) => API.post('/ai-chat/message', { message }).then(res => res.data);
export const getAIChatHistory = (limit = 50) => API.get(`/ai-chat/history?limit=${limit}`).then(res => res.data);
export const getAIChatUsage = () => API.get('/ai-chat/usage').then(res => res.data);
export const clearAIChatHistory = () => API.delete('/ai-chat/history').then(res => res.data);
export const getAIChatPrompts = () => API.get('/ai-chat/prompts').then(res => res.data);

export default API; 