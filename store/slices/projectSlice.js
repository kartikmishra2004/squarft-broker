import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.31.27:3001';

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// Step 1 — create project with basic details
export const createBasicDetails = createAsyncThunk(
    'project/createBasicDetails',
    async ({ category, property_type, property_subtype }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const res = await fetch(`${API_BASE_URL}/api/v1/projects/basic-details`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader(token) },
                body: JSON.stringify({ category, property_type, property_subtype }),
            });
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.message);
            return data.data; // { id }
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Step 2 — owner details
export const updateOwnerDetails = createAsyncThunk(
    'project/updateOwnerDetails',
    async ({ projectId, owner_name, owner_contact, owner_email, owner_address }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/owner-details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeader(token) },
                body: JSON.stringify({ owner_name, owner_contact, owner_email, owner_address }),
            });
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.message);
            return data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Step 3a — property details
export const updatePropertyDetails = createAsyncThunk(
    'project/updatePropertyDetails',
    async ({ projectId, name, tower_number, flat_number, location, city, state, pincode, nearby_project, khasra_number, property_age }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/property-details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeader(token) },
                body: JSON.stringify({ name, tower_number, flat_number, location, city, state, pincode, nearby_project, khasra_number, property_age }),
            });
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.message);
            return data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Step 3b — area details
export const updateAreaDetails = createAsyncThunk(
    'project/updateAreaDetails',
    async ({ projectId, total_area, carpet_area, area_unit }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/area-details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeader(token) },
                body: JSON.stringify({ total_area, carpet_area, area_unit }),
            });
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.message);
            return data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Step 4 — upload images & documents
export const uploadProjectMedia = createAsyncThunk(
    'project/uploadMedia',
    async ({ projectId, images, documents }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const formData = new FormData();
            const toFile = (asset, name) => ({
                uri: asset.uri,
                name: asset.fileName || `${name}.jpg`,
                type: asset.mimeType || 'image/jpeg',
            });
            images.forEach((img, i) => formData.append('images', toFile(img, `image_${i}`)));
            documents.forEach((doc, i) => formData.append('documents', toFile(doc, `doc_${i}`)));
            const res = await fetch(`${API_BASE_URL}/api/v1/project/${projectId}/add-images`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.message);
            return data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const projectSlice = createSlice({
    name: 'project',
    initialState: {
        currentProjectId: null,
        loading: false,
        error: null,
        submitSuccess: false,
    },
    reducers: {
        resetProject: (state) => {
            state.currentProjectId = null;
            state.loading = false;
            state.error = null;
            state.submitSuccess = false;
        },
        clearProjectError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        const pending = (state) => { state.loading = true; state.error = null; };
        const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

        builder
            .addCase(createBasicDetails.pending, pending)
            .addCase(createBasicDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProjectId = action.payload.id;
            })
            .addCase(createBasicDetails.rejected, rejected)

            .addCase(updateOwnerDetails.pending, pending)
            .addCase(updateOwnerDetails.fulfilled, (state) => { state.loading = false; })
            .addCase(updateOwnerDetails.rejected, rejected)

            .addCase(updatePropertyDetails.pending, pending)
            .addCase(updatePropertyDetails.fulfilled, (state) => { state.loading = false; })
            .addCase(updatePropertyDetails.rejected, rejected)

            .addCase(updateAreaDetails.pending, pending)
            .addCase(updateAreaDetails.fulfilled, (state) => { state.loading = false; })
            .addCase(updateAreaDetails.rejected, rejected)

            .addCase(uploadProjectMedia.pending, pending)
            .addCase(uploadProjectMedia.fulfilled, (state) => {
                state.loading = false;
                state.submitSuccess = true;
            })
            .addCase(uploadProjectMedia.rejected, rejected);
    },
});

export const { resetProject, clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
