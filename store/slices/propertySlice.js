import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.31.27:3001';

// Fetch property details by slug
export const fetchPropertyDetails = createAsyncThunk(
    'property/fetchDetails',
    async (slug, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/overview/${slug}`, {
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

// Fetch floor plans
export const fetchFloorPlans = createAsyncThunk(
    'property/fetchFloorPlans',
    async (slug, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/overview/${slug}/floor-plans`, {
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

// Fetch similar properties
export const fetchSimilarProperties = createAsyncThunk(
    'property/fetchSimilar',
    async (slug, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/overview/${slug}/similar`, {
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

const propertySlice = createSlice({
    name: 'property',
    initialState: {
        currentProperty: null,
        floorPlans: [],
        similarProperties: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentProperty: (state) => {
            state.currentProperty = null;
            state.floorPlans = [];
            state.similarProperties = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch property details
            .addCase(fetchPropertyDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPropertyDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProperty = action.payload;
            })
            .addCase(fetchPropertyDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch floor plans
            .addCase(fetchFloorPlans.fulfilled, (state, action) => {
                state.floorPlans = action.payload.floor_plans || [];
            })
            // Fetch similar properties
            .addCase(fetchSimilarProperties.fulfilled, (state, action) => {
                state.similarProperties = action.payload || [];
            });
    },
});

export const { clearCurrentProperty } = propertySlice.actions;
export default propertySlice.reducer;
