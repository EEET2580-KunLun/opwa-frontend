// src/modules/auth/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiUtils from '../../../app/config/ApiUtils';
import {AUTH_ENDPOINTS} from "../../../app/config/Api.js";
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await ApiUtils.post(AUTH_ENDPOINTS.LOGIN, credentials);

            // Response should include user data and expiry time
            // (token is set as HTTP-only cookie by server)
            return {
                user: response.data.staff,
                expiresAt: Date.now() + (response.data.expires_in * 1000), // Calculate expiry timestamp from expires_in seconds
            };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_) => {
        try {
            // Call the logout endpoint which will clear the HTTP-only cookie
            await ApiUtils.post(AUTH_ENDPOINTS.LOGOUT, "");
            return true;
        } catch (error) {
            console.error("Logout failed, but continuing to clear local state:", error);
            return true; // Continue with logout even if API call fails
        }
    }
);

export const verifyPersistedAuth = createAsyncThunk(
    'auth/verifyPersistedAuth',
    async (_, { getState }) => {
        const { auth } = getState();
        if (auth.isAuthenticated && auth.user) {
                // Select the appropriate validation endpoint based on user role
                let validationEndpoint;
                const { role } = auth.user;

                if (role === 'ADMIN') {
                    validationEndpoint = AUTH_ENDPOINTS.IS_ADMIN;
                } else if (role === 'MASTER_ADMIN') {
                    validationEndpoint = AUTH_ENDPOINTS.IS_MASTER_ADMIN;
                } else if (role === 'TICKET_AGENT') {
                    validationEndpoint = AUTH_ENDPOINTS.IS_TICKET_AGENT;
                } else if (role === 'OPERATOR') {
                    validationEndpoint = AUTH_ENDPOINTS.IS_OPERATOR;
                } else {
                    throw new Error('Unknown user role');
                }

                const response = await ApiUtils.get(validationEndpoint);
                return response;
        }
        throw new Error('No persisted auth');
    }
);

export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async () => {
        return await ApiUtils.post(AUTH_ENDPOINTS.REFRESH_TOKEN);
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isAuthenticated: false,
        user: null,
        tokenExpiry: null,
        loading: false,
        error: null
    },
    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.tokenExpiry = action.payload.expiresAt;
                state.loading = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Login failed';
            })
            .addCase(logout.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.tokenExpiry = null;
                state.error = null;
            })
            .addCase(verifyPersistedAuth.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.tokenExpiry = action.payload.expiresAt;
                state.loading = false;
            })
            .addCase(verifyPersistedAuth.rejected, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.tokenExpiry = null;
                state.loading = false;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.tokenExpiry = action.payload.expiresAt;
                // Optionally update user data if the server sends it
                if (action.payload.user) {
                    state.user = action.payload.user;
                }
            })
            .addCase(refreshToken.rejected, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.tokenExpiry = null;
            });
    }
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;