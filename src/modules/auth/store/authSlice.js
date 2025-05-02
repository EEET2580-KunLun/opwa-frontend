import {createSlice} from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        XSRF_TOKEN: "none",
        isAuthenticated: false,
        user: null,
    },
    reducers: {
        login(state, action) {
            const user = action.payload.data?.data.staff;
            state.user = user;
            state.isAuthenticated = true;
        },
        logout(state) {
            state.isAuthenticated = false;
            state.user = null;
        },
        setXSRFToken(state, action) {
            state.XSRF_TOKEN = action.payload;
        },
    }
})

export const {login, logout, setXSRFToken} = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectXSRFToken = (state) => state.auth.XSRF_TOKEN;