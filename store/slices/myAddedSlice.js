import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.31.27:3001';

// Fetch broker's added properties
export const fetchMyAddedProperties = createAsyncThunk(
    'myAdded/fetchProperties',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/broker/properties`, {
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

// Update project
export const updateProject = createAsyncThunk(
    'myAdded/updateProject',
    async ({ projectId, projectData }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(projectData),
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return { projectId, projectData };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Delete project
export const deleteProject = createAsyncThunk(
    'myAdded/deleteProject',
    async (projectId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return projectId;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const myAddedSlice = createSlice({
    name: 'myAdded',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {
        addProperty: (state, action) => {
            state.list.unshift({
                id: state.list.length + 1,
                ...action.payload,
            });
        },
        removeProperty: (state, action) => {
            state.list = state.list.filter(item => item.id !== action.payload);
        },
        updatePropertyStatus: (state, action) => {
            const item = state.list.find(p => p.id === action.payload.id);
            if (item) item.status = action.payload.status;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyAddedProperties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyAddedProperties.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchMyAddedProperties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update project
            .addCase(updateProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProject.fulfilled, (state, action) => {
                state.loading = false;
                const { projectId, projectData } = action.payload;
                const index = state.list.findIndex(p => p.id === projectId);
                if (index !== -1) {
                    state.list[index] = { ...state.list[index], ...projectData };
                }
            })
            .addCase(updateProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete project
            .addCase(deleteProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.loading = false;
                state.list = state.list.filter(p => p.id !== action.payload);
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { addProperty, removeProperty, updatePropertyStatus } = myAddedSlice.actions;
export default myAddedSlice.reducer;
