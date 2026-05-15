import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.31.27:3001';

// Async Thunks
export const fetchWalletOverview = createAsyncThunk(
    'wallet/fetchWalletOverview',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/broker/wallet/overview`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.data; // returns { balance, totalEarned, totalWithdrawn }
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchTransactions = createAsyncThunk(
    'wallet/fetchTransactions',
    async ({ page = 1, limit = 10 } = {}, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/broker/wallet/transactions?page=${page}&limit=${limit}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchCommissionHistory = createAsyncThunk(
    'wallet/fetchCommissionHistory',
    async ({ page = 1, limit = 10 } = {}, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/broker/wallet/commissionHistory?page=${page}&limit=${limit}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchBankAccounts = createAsyncThunk(
    'wallet/fetchBankAccounts',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/broker/wallet/banks`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const addBankAccountApi = createAsyncThunk(
    'wallet/addBankAccountApi',
    async (bankData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/broker/wallet/banks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(bankData),
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.bankAccount;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const requestWithdrawalApi = createAsyncThunk(
    'wallet/requestWithdrawalApi',
    async (withdrawalData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/broker/wallet/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(withdrawalData),
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const walletSlice = createSlice({
    name: 'wallet',
    initialState: {
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        bankAccounts: [],
        transactions: [],
        commissions: [],
        loading: false,
        error: null,
        transactionCount: 0,
        currentPage: 1,
    },
    reducers: {
        clearWalletError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Overview
            .addCase(fetchWalletOverview.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWalletOverview.fulfilled, (state, action) => {
                state.loading = false;
                state.balance = action.payload.balance;
                state.totalEarned = action.payload.totalEarned;
                state.totalWithdrawn = action.payload.totalWithdrawn;
            })
            .addCase(fetchWalletOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Transactions
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.transactions = action.payload.transactions;
                state.transactionCount = action.payload.count;
                state.currentPage = action.payload.page;
            })
            // Banks
            .addCase(fetchBankAccounts.fulfilled, (state, action) => {
                state.bankAccounts = action.payload;
            })
            // Add Bank
            .addCase(addBankAccountApi.fulfilled, (state, action) => {
                state.bankAccounts.push(action.payload);
            })
            // Withdrawal
            .addCase(requestWithdrawalApi.fulfilled, (state, action) => {
                state.balance -= action.payload.amount;
            })
            // Commission History
            .addCase(fetchCommissionHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCommissionHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.commissions = action.payload?.transactions || [];
            })
            .addCase(fetchCommissionHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;
