import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.31.27:3001";

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const readJsonResponse = async (response) => {
    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch (_) {
        return null;
    }
};

export const searchLocations = createAsyncThunk(
    "location/searchLocations",
    async ({ query, limit = 6 }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const params = new URLSearchParams({
                q: query,
                limit: String(limit),
            });

            const response = await fetch(`${API_BASE_URL}/api/v1/broker/locations/search?${params.toString()}`, {
                headers: authHeader(token),
            });
            const data = await readJsonResponse(response);

            if (!response.ok) {
                return rejectWithValue(data?.message || "Location search service is not available");
            }

            return data?.data || [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const reverseGeocodeLocation = createAsyncThunk(
    "location/reverseGeocodeLocation",
    async ({ latitude, longitude }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const params = new URLSearchParams({
                latitude: String(latitude),
                longitude: String(longitude),
            });

            const response = await fetch(`${API_BASE_URL}/api/v1/broker/locations/reverse?${params.toString()}`, {
                headers: authHeader(token),
            });
            const data = await readJsonResponse(response);

            if (!response.ok) return rejectWithValue(data?.message || "Unable to resolve location");
            return data?.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    results: [],
    pickedLocation: null,
    loading: false,
    error: null,
};

const locationSlice = createSlice({
    name: "location",
    initialState,
    reducers: {
        pickLocation: (state, action) => {
            state.pickedLocation = action.payload;
        },
        clearPickedLocation: (state) => {
            state.pickedLocation = null;
        },
        clearLocationResults: (state) => {
            state.results = [];
            state.error = null;
        },
        setLocationResults: (state, action) => {
            state.results = action.payload || [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        const pending = (state) => {
            state.loading = true;
            state.error = null;
        };
        const rejected = (state, action) => {
            state.loading = false;
            state.error = action.payload || "Location request failed";
        };

        builder
            .addCase(searchLocations.pending, pending)
            .addCase(searchLocations.fulfilled, (state, action) => {
                state.loading = false;
                state.results = action.payload;
            })
            .addCase(searchLocations.rejected, rejected)
            .addCase(reverseGeocodeLocation.pending, pending)
            .addCase(reverseGeocodeLocation.fulfilled, (state, action) => {
                state.loading = false;
                state.results = action.payload ? [action.payload] : [];
            })
            .addCase(reverseGeocodeLocation.rejected, rejected);
    },
});

export const { clearLocationResults, clearPickedLocation, pickLocation, setLocationResults } = locationSlice.actions;
export default locationSlice.reducer;
