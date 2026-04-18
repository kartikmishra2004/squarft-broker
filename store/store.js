import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import requirementsSlice from './slices/requirementsSlice';
import myAddedSlice from './slices/myAddedSlice';

export const store = configureStore({
    reducer: {
        app: appSlice,
        auth: authSlice,
        requirements: requirementsSlice,
        myAdded: myAddedSlice,
    },
});