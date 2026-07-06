import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.31.27:3001';

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// Step 1 — create property with basic details (FIXED TO MATCH BACKEND)
export const createBasicDetails = createAsyncThunk(
    'project/createBasicDetails',
    async ({ category, property_type, kind_of_property, listing_type }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            
            // BACKEND ACTUALLY EXPECTS: { property_type, property_subtype, listing_type, kind_of_property }
            // Backend uses these field names in the controller (line 837-879 of propertyController.js)
            const payload = {
                property_type: category,                           // residential/commercial
                property_subtype: property_type,                   // shop/showroom/office/plot/villa/apartment/rowhouse
                listing_type: listing_type || 'buy',               // buy/rent
                kind_of_property: kind_of_property                 // 1_bhk/2_bhk/ready/bare/coworking
            };
            
            // COMPREHENSIVE LOGGING - DO NOT REMOVE
            console.log('=== Frontend createBasicDetails DEBUG ===');
            console.log('Input params:', { category, property_type, kind_of_property, listing_type });
            console.log('Mapped payload being sent:', JSON.stringify(payload));
            console.log('API Endpoint: POST /api/v1/broker/properties/basic-details');
            console.log('=========================================');
            
            const res = await fetch(`${API_BASE_URL}/api/v1/broker/properties/basic-details`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader(token) },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            
            console.log('=== Frontend Response ===');
            console.log('Status:', res.status);
            console.log('Response:', JSON.stringify(data));
            console.log('========================');
            
            if (!res.ok) return rejectWithValue(data.message);
            return { 
                id: data.data.id,
                // Store these for later use in Step 2/3
                property_type,
                kind_of_property
            };
        } catch (err) {
            console.error('=== Frontend Error ===');
            console.error('Error:', err.message);
            console.error('=====================');
            return rejectWithValue(err.message);
        }
    }
);

// Step 2 — owner details (UPDATED: now includes contact_no and contact_email)
export const updateOwnerDetails = createAsyncThunk(
    'project/updateOwnerDetails',
    async ({ projectId, title, owner_name, owner_contact, owner_email, owner_address }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const listingTitle = (title || owner_name || '').trim();
            
            // BACKEND NOW ACCEPTS: { title, description, contact_no, contact_email }
            const payload = {
                title: listingTitle || 'Property Listing',
                description: owner_address || '',
                contact_no: owner_contact || null,
                contact_email: owner_email || null
            };
            
            console.log('=== updateOwnerDetails DEBUG ===');
            console.log('Input:', { projectId, owner_name, owner_contact, owner_email, owner_address });
            console.log('Mapped payload:', JSON.stringify(payload));
            console.log('API: PUT /api/v1/broker/properties/:propertyId/owner-details');
            console.log('================================');
            
            const res = await fetch(`${API_BASE_URL}/api/v1/broker/properties/${projectId}/owner-details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeader(token) },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            
            console.log('Response:', res.status, JSON.stringify(data));
            
            if (!res.ok) return rejectWithValue(data.message);
            return data;
        } catch (err) {
            console.error('updateOwnerDetails Error:', err.message);
            return rejectWithValue(err.message);
        }
    }
);

// Step 3 — property details (UPDATED: now includes all new fields)
export const updatePropertyDetails = createAsyncThunk(
    'project/updatePropertyDetails',
    async ({ projectId, name, tower_number, flat_number, location, city, area, state, pincode, nearby_project, khasra_number, property_age, latitude, longitude, owner_contact, owner_email, contact_no, contact_email }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const resolvedContactNo = owner_contact || contact_no || null;
            const resolvedContactEmail = owner_email || contact_email || null;
            
            // BACKEND NOW ACCEPTS: {
            //   bedrooms, bathrooms, floors, latitude, longitude, rera_id,
            //   city, total_area, pincode, contact_no, contact_email,
            //   tower_no, flat_no, state, khasra_no, property_age
            // }
            const payload = {
                bedrooms: null,                                    // Will be set based on BHK in future
                bathrooms: null,                                   // Not collected yet
                floors: null,                                      // Not collected yet
                latitude: latitude !== undefined ? latitude : null,
                longitude: longitude !== undefined ? longitude : null,
                rera_id: null,                                     // Not collected yet
                city: city || null,                                // ✅ From Step 3 form
                total_area: area || null,                          // ✅ Maps to 'area' column (locality name)
                pincode: pincode || null,                          // ✅ From Step 3 form
                contact_no: resolvedContactNo,
                contact_email: resolvedContactEmail,
                tower_no: tower_number || null,                    // ✅ NOW SUPPORTED
                flat_no: flat_number || null,                      // ✅ NOW SUPPORTED
                state: state || null,                              // ✅ NOW SUPPORTED
                khasra_no: khasra_number || null,                  // ✅ NOW SUPPORTED
                property_age: property_age ? Number(property_age) : null  // ✅ NOW SUPPORTED
            };
            
            console.log('=== updatePropertyDetails DEBUG ===');
            console.log('Input:', { projectId, name, tower_number, flat_number, location, city, area, state, pincode, khasra_number, property_age, latitude, longitude });
            console.log('Mapped payload:', JSON.stringify(payload));
            console.log('API: PUT /api/v1/broker/properties/:propertyId/property-details');
            console.log('===================================');
            
            const res = await fetch(`${API_BASE_URL}/api/v1/broker/properties/${projectId}/property-details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeader(token) },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            
            console.log('Response:', res.status, JSON.stringify(data));
            
            if (!res.ok) return rejectWithValue(data.message);
            return data;
        } catch (err) {
            console.error('updatePropertyDetails Error:', err.message);
            return rejectWithValue(err.message);
        }
    }
);

// Step 4 — area details (NEW API: total_area_sqft)
export const updateAreaDetails = createAsyncThunk(
    'project/updateAreaDetails',
    async ({ projectId, total_area, carpet_area, area_unit }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            
            // NEW API EXPECTS: { total_area_sqft }
            const payload = {
                total_area_sqft: total_area ? Number(total_area) : null
            };
            
            console.log('=== updateAreaDetails DEBUG ===');
            console.log('Input:', { projectId, total_area, carpet_area, area_unit });
            console.log('Mapped payload:', JSON.stringify(payload));
            console.log('API: PUT /api/v1/broker/properties/:propertyId/area-details');
            console.log('===============================');
            
            const res = await fetch(`${API_BASE_URL}/api/v1/broker/properties/${projectId}/area-details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeader(token) },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            
            console.log('Response:', res.status, JSON.stringify(data));
            
            if (!res.ok) return rejectWithValue(data.message);
            return data;
        } catch (err) {
            console.error('updateAreaDetails Error:', err.message);
            return rejectWithValue(err.message);
        }
    }
);

// Step 4b — pricing details
export const updatePricingDetails = createAsyncThunk(
    'project/updatePricingDetails',
    async ({ projectId, selling_price, is_negotiable, tax_included, payment_mode }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            
            const payload = { selling_price, is_negotiable, tax_included, payment_mode };
            
            console.log('=== updatePricingDetails DEBUG ===');
            console.log('Property ID:', projectId);
            console.log('Payload:', JSON.stringify(payload));
            console.log('API: PUT /api/v1/broker/properties/:propertyId/pricing-details');
            console.log('==================================');
            
            const res = await fetch(`${API_BASE_URL}/api/v1/broker/properties/${projectId}/pricing-details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeader(token) },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            
            console.log('Response:', res.status, JSON.stringify(data));
            
            if (!res.ok) return rejectWithValue(data.message);
            return data;
        } catch (err) {
            console.error('updatePricingDetails Error:', err.message);
            return rejectWithValue(err.message);
        }
    }
);

// Step 5 — upload images & documents (FIXED TO NEW ENDPOINT)
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
            
            console.log('=== uploadProjectMedia DEBUG ===');
            console.log('Property ID:', projectId);
            console.log('Images count:', images.length);
            console.log('Documents count:', documents.length);
            
            images.forEach((img, i) => formData.append('images', toFile(img, `image_${i}`)));
            documents.forEach((doc, i) => formData.append('documents', toFile(doc, `doc_${i}`)));
            
            // ✅ FIXED: Changed from /api/v1/project/:projectId/add-images to new endpoint
            const endpoint = `${API_BASE_URL}/api/v1/broker/properties/${projectId}/add-media`;
            console.log('API Endpoint:', endpoint);
            console.log('================================');
            
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            
            console.log('Response:', res.status, JSON.stringify(data));
            
            if (!res.ok) return rejectWithValue(data.message);
            return data;
        } catch (err) {
            console.error('uploadProjectMedia Error:', err.message);
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

            .addCase(updatePricingDetails.pending, pending)
            .addCase(updatePricingDetails.fulfilled, (state) => { state.loading = false; })
            .addCase(updatePricingDetails.rejected, rejected)

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
