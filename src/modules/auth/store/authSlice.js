import {createSlice} from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        XSRF_TOKEN: null,
        isAuthenticated: false,
        user: null,
        errorCode: null,
    },
    reducers: {
        login(state, action) {
            state.user = action.payload.data?.data.staff;
            state.isAuthenticated = true;
        },
        googleLogin(state, action) {
            state.user = action.payload.data?.data.staff;
            state.isAuthenticated = true;
        },
        logout(state) {
            state.isAuthenticated = false;
            state.user = null;
        },
        setXSRFToken(state, action) {
            state.XSRF_TOKEN = action.payload;
        },
        setErrorCode(state, action) {
            state.errorCode = action.payload;
        },
    }
})

export const {googleLogin,login, logout, setXSRFToken, setErrorCode} = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectXSRFToken = (state) => state.auth.XSRF_TOKEN;
export const selectErrorCode = (state) => state.auth.errorCode;