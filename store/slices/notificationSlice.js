import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { initialNotifications } from '../../data/notifications';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.31.27:3001';

const parseMetadata = (metadata) => {
    if (!metadata || typeof metadata === 'object') return metadata || {};
    try {
        return JSON.parse(metadata);
    } catch {
        return {};
    }
};

export const fetchNotifications = createAsyncThunk(
    'notifications/fetch',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/broker/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const markAllReadApi = createAsyncThunk(
    'notifications/markAllRead',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            await fetch(`${API_BASE_URL}/api/v1/broker/notifications/read-all`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (_) {}
    }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: initialNotifications,
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    markAsWatched: (state, action) => {
      const n = state.list.find(n => n.id === action.payload);
      if (n) { n.watched = true; n.is_read = true; }
      state.unreadCount = state.list.filter(n => !n.is_read && !n.watched).length;
    },
    markAllAsWatched: (state) => {
      state.list.forEach(n => { n.watched = true; n.is_read = true; });
      state.unreadCount = 0;
    },
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          // Map API fields to local shape
          state.list = action.payload.map(n => ({
            id: n.id,
            title: n.title,
            description: n.body,
            type: n.type,
            time: n.sent_at,
            watched: n.is_read,
            is_read: n.is_read,
            metadata: parseMetadata(n.metadata),
          }));
          state.unreadCount = state.list.filter(n => !n.is_read).length;
        }
      })
      .addCase(fetchNotifications.rejected, (state) => { state.loading = false; });
  },
});

export const { markAsWatched, markAllAsWatched, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
