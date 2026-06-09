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

// Fetch all properties list
export const fetchProperties = createAsyncThunk(
    'property/fetchList',
    async (limit = 10, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/properties/list?limit=${limit}`, {
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

// Fetch recommended properties with filters
export const fetchRecommendedProperties = createAsyncThunk(
    'property/fetchRecommended',
    async (filters = {}, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const queryParams = new URLSearchParams();
            
            // Add filters to query params
            if (filters.city) queryParams.append('city', filters.city);
            if (filters.area) queryParams.append('area', filters.area);
            if (filters.pincode) queryParams.append('pincode', filters.pincode);
            if (filters.min_price) queryParams.append('min_price', filters.min_price);
            if (filters.max_price) queryParams.append('max_price', filters.max_price);
            if (filters.type) queryParams.append('type', filters.type);
            if (filters.listing_type) queryParams.append('listing_type', filters.listing_type);
            if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms);
            if (filters.limit) queryParams.append('limit', filters.limit);

            const response = await fetch(
                `${API_BASE_URL}/api/v1/properties/recommended?${queryParams.toString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Toggle save/unsave property or project
export const toggleSaveItem = createAsyncThunk(
    'property/toggleSave',
    async ({ type, id }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/save/${type}/${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return { type, id, message: data.message };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Fetch saved properties and projects
export const fetchSavedItems = createAsyncThunk(
    'property/fetchSaved',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/saved`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Fetch contacted (visited) properties
export const fetchContactedProperties = createAsyncThunk(
    'property/fetchContacted',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/properties/contacted`, {
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

// Fetch broker shortlisted properties (filtered by category and property type)
export const fetchShortlistedProperties = createAsyncThunk(
    'property/fetchShortlisted', 
    async ({ category, property_type }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            
            console.log('🔍 [propertySlice] Fetching shortlisted properties:', { category, property_type });
            
            if (!category || !property_type) {
                return rejectWithValue('Category and property_type are required');
            }
            
            const queryParams = new URLSearchParams({
                category,
                property_type
            });
            
            const endpoint = `${API_BASE_URL}/api/v1/broker/properties/shortlist?${queryParams.toString()}`;
            console.log('🔍 [propertySlice] API Endpoint:', endpoint);
            
            const response = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            
            console.log('🔍 [propertySlice] Response:', {
                status: response.ok,
                count: data.data?.length || 0,
                data: data
            });
            
            if (!response.ok) return rejectWithValue(data.message);
            return data.data;
        } catch (err) {
            console.error('🔍 [propertySlice] Error:', err);
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
        properties: [],
        recommendedProperties: [],
        shortlistedProperties: [], // NEW: For homepage property type shortlisting
        savedItems: [],
        contactedProperties: [],
        loading: false,
        shortlistedLoading: false, // NEW: Separate loading state for shortlisted
        error: null,
    },
    reducers: {
        clearCurrentProperty: (state) => {
            state.currentProperty = null;
            state.floorPlans = [];
            state.similarProperties = [];
        },
        clearProperties: (state) => {
            state.properties = [];
            state.recommendedProperties = [];
            state.shortlistedProperties = [];
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
            })
            // Fetch properties list
            .addCase(fetchProperties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProperties.fulfilled, (state, action) => {
                state.loading = false;
                state.properties = action.payload;
            })
            .addCase(fetchProperties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch recommended properties
            .addCase(fetchRecommendedProperties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecommendedProperties.fulfilled, (state, action) => {
                state.loading = false;
                state.recommendedProperties = action.payload;
            })
            .addCase(fetchRecommendedProperties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Toggle save item
            .addCase(toggleSaveItem.fulfilled, (state, action) => {
                // Optionally update local state to reflect save/unsave
                const { type, id, message } = action.payload;
                if (message.includes('saved')) {
                    // Item was saved
                } else {
                    // Item was unsaved - remove from savedItems
                    state.savedItems = state.savedItems.filter(
                        item => !(item.type === type && item.data.id === id)
                    );
                }
            })
            // Fetch saved items
            .addCase(fetchSavedItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSavedItems.fulfilled, (state, action) => {
                state.loading = false;
                state.savedItems = action.payload;
            })
            .addCase(fetchSavedItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch contacted properties
            .addCase(fetchContactedProperties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContactedProperties.fulfilled, (state, action) => {
                state.loading = false;
                state.contactedProperties = action.payload;
            })
            .addCase(fetchContactedProperties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch shortlisted properties (homepage property type filtering)
            .addCase(fetchShortlistedProperties.pending, (state) => {
                state.shortlistedLoading = true;
                state.error = null;
            })
            .addCase(fetchShortlistedProperties.fulfilled, (state, action) => {
                state.shortlistedLoading = false;
                state.shortlistedProperties = action.payload;
            })
            .addCase(fetchShortlistedProperties.rejected, (state, action) => {
                state.shortlistedLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCurrentProperty, clearProperties } = propertySlice.actions;
export default propertySlice.reducer;
