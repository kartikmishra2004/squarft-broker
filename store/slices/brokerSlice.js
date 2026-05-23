import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.31.27:3001';

export const fetchBrokerStats = createAsyncThunk(
    'broker/fetchStats',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/broker/me/stats`, {
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

export const fetchMyProjects = createAsyncThunk(
    'broker/fetchMyProjects',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/broker/me/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            
            // Transform backend data to match home screen expectations
            const transformedProjects = (data.data || []).map(project => ({
                id: project.id,
                title: project.name,
                developer: `${project.city}, ${project.area}`,
                description: project.description || '',
                price: project.price_from && project.price_to 
                    ? `₹${(project.price_from / 100000).toFixed(2)} L - ${(project.price_to / 10000000).toFixed(2)} Cr`
                    : 'Price on request',
                image: project.cover_image_url ? { uri: project.cover_image_url } : null,
                type: 'SELL',
            }));
            
            return transformedProjects;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const brokerSlice = createSlice({
    name: 'broker',
    initialState: {
        stats: { total_properties: 0, sales: 0, pending: 0, rejected: 0 },
        projects: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBrokerStats.pending, (state) => { state.loading = true; })
            .addCase(fetchBrokerStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchBrokerStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyProjects.fulfilled, (state, action) => {
                state.projects = action.payload || [];
            });
    },
});

export default brokerSlice.reducer;
