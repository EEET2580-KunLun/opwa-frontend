// src/modules/auth/service/AuthService.js
import { store } from "../../../app/store/store.js";
import {
    login as loginAction,
    logout as logoutAction,
    verifyPersistedAuth,
    refreshToken as refreshTokenAction
} from "../store/authSlice.js";

class AuthService {
    // Login method - returns promise for component use
    static async login(email, password) {
        try {
            const resultAction = await store.dispatch(loginAction({ email, password }));

            if (loginAction.fulfilled.match(resultAction)) {
                return {
                    success: true,
                    user: resultAction.payload.user,
                    role: resultAction.payload.user.role
                };
            } else {
                return {
                    success: false,
                    message: resultAction.payload?.message || resultAction.error?.message || "Login failed"
                };
            }
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                message: "Network error. Please try again later."
            };
        }
    }

    // Logout method
    static async logout() {
        await store.dispatch(logoutAction());
        return true;
    }

    // Check if user is authenticated
    static isAuthenticated() {
        return store.getState().auth.isAuthenticated;
    }

    // Get current user role
    static getUserRole() {
        return store.getState().auth.user?.role || null;
    }

    // Get current user
    static getCurrentUser() {
        return store.getState().auth.user;
    }

    // Get token expiry time
    static getTokenExpiry() {
        return store.getState().auth.tokenExpiry;
    }

    // Verify persisted authentication
    static async verifyAuth() {
        try {
            await store.dispatch(verifyPersistedAuth()).unwrap();
            return true;
        } catch (error) {
            console.error("Auth verification failed:", error);
            return false;
        }
    }

    // Refresh the token
    static async refreshToken() {
        try {
            await store.dispatch(refreshTokenAction()).unwrap();
            return true;
        } catch (error) {
            console.error("Token refresh failed:", error);
            return false;
        }
    }

    // Check if session needs refresh
    static shouldRefreshToken() {
        const expiry = this.getTokenExpiry();
        if (!expiry) return false;

        // Refresh if token expires in less than 5 minutes
        const fiveMinutes = 5 * 60 * 1000;
        return Date.now() > (expiry - fiveMinutes);
    }
}

export default AuthService;