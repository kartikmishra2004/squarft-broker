import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.31.27:3001';

// Async Thunks
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: credentials.phone,
                    password: credentials.password,
                    role: 'broker'
                }),
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: userData.phone,
                    password: userData.password,
                    first_name: userData.first_name,
                    last_name: userData.last_name || '',
                    role: 'broker'
                }),
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const sendOtpApi = createAsyncThunk(
    'auth/sendOtpApi',
    async ({ phone, purpose }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, purpose }),
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data; // returns { otp_token, expires_in }
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const verifyOtpApi = createAsyncThunk(
    'auth/verifyOtpApi',
    async ({ otp_token, otp }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp_token, otp }),
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data; // returns { verified, verified_token }
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        name: '',
        mobile: '',
        password: '',
        newPassword: '',
        confirmPassword: '',
        profileImage: null,
        otp: ['', '', '', '', '', ''], // Changed to 6 digits as per backend swagger
        otpFlow: 'register',
        rememberMe: false,
        isLoggedIn: false,
        isKycCompleted: true,
        token: null,
        user: null,
        loading: false,
        error: null,
        otpToken: null,
        verifiedToken: null,
    },
    reducers: {
        setName: (state, action) => { state.name = action.payload; },
        setMobile: (state, action) => { state.mobile = action.payload; },
        setPassword: (state, action) => { state.password = action.payload; },
        setNewPassword: (state, action) => { state.newPassword = action.payload; },
        setConfirmPassword: (state, action) => { state.confirmPassword = action.payload; },
        setProfileImage: (state, action) => { state.profileImage = action.payload; },
        clearProfileImage: (state) => { state.profileImage = null; },
        setOtpDigit: (state, action) => {
            const { index, value } = action.payload;
            state.otp[index] = value;
        },
        clearOtp: (state) => { state.otp = ['', '', '', '', '', '']; },
        setOtpFlow: (state, action) => { state.otpFlow = action.payload; },
        toggleRememberMe: (state) => { state.rememberMe = !state.rememberMe; },
        setLoggedIn: (state, action) => { state.isLoggedIn = action.payload; },
        setKycCompleted: (state, action) => { state.isKycCompleted = action.payload; },
        clearError: (state) => { state.error = null; },
        logout: (state) => {
            state.mobile = '';
            state.password = '';
            state.profileImage = null;
            state.isLoggedIn = false;
            state.isKycCompleted = false;
            state.token = null;
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                // Registration successful, usually wait for login or auto-login
                state.user = action.payload.user;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Send OTP
            .addCase(sendOtpApi.fulfilled, (state, action) => {
                state.otpToken = action.payload.otp_token;
            })
            // Verify OTP
            .addCase(verifyOtpApi.fulfilled, (state, action) => {
                state.verifiedToken = action.payload.verified_token;
            });
    },
});

export const { 
    setName, setMobile, setPassword, setNewPassword, 
    setConfirmPassword, setProfileImage, clearProfileImage, 
    setOtpDigit, clearOtp, setOtpFlow, toggleRememberMe, 
    setLoggedIn, setKycCompleted, logout, clearError 
} = authSlice.actions;

export default authSlice.reducer;
