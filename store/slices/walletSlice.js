import { createSlice } from '@reduxjs/toolkit';

const walletSlice = createSlice({
    name: 'wallet',
    initialState: {
        balance: 14235.34,
        bankAccounts: [], // Initially empty as requested
    },
    reducers: {
        addBankAccount: (state, action) => {
            state.bankAccounts.push({
                id: Date.now(),
                ...action.payload,
            });
        },
        withdrawAmount: (state, action) => {
            const amount = parseFloat(action.payload);
            if (!isNaN(amount) && amount <= state.balance) {
                state.balance -= amount;
            }
        },
    },
});

export const { addBankAccount, withdrawAmount } = walletSlice.actions;
export default walletSlice.reducer;
