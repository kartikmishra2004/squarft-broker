import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import requirementsSlice from './slices/requirementsSlice';
import notificationSlice from './slices/notificationSlice';

export const store = configureStore({
    reducer: {
        app: appSlice,
        auth: authSlice,
        requirements: requirementsSlice,
        notifications: notificationSlice,
    },
});