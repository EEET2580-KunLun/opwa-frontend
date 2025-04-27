// src/app/config/ApiUtils.js
import { store } from '../store/store';
import { refreshToken, logout } from '../../modules/auth/store/authSlice';

class ApiUtils {
    static async get(url) {
        return this.makeRequest('GET', url);
    }

    static async post(url, data) {
        return this.makeRequest('POST', url, data);
    }

    static async put(url, data) {
        return this.makeRequest('PUT', url, data);
    }

    static async delete(url) {
        return this.makeRequest('DELETE', url);
    }

    static async makeRequest(method, url, data = null) {
        const headers = this.createHeaders();

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: data ? JSON.stringify(data) : null,
                credentials: 'include' // Include cookies for JWT tokens
            });

            if (response.status === 401) {
                // Token expired, attempt to refresh
                const refreshed = await this.refreshTokenAndUpdateState();

                if (refreshed) {
                    // Retry the original request if refresh was successful
                    return this.makeRequest(method, url, data);
                } else {
                    // Logout if refresh token is invalid/expired
                    await store.dispatch(logout());
                    throw new Error('Session expired. Please login again.');
                }
            }

            if (!response.ok) {
                const errorData = await this.parseErrorResponse(response);
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    static async refreshTokenAndUpdateState() {
        try {
            // Use the thunk action to refresh token and update Redux state
            await store.dispatch(refreshToken()).unwrap();
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    static createHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    static async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        if (response.status === 204) {
            return {}; // Return empty object for No Content responses
        }

        return await response.text();
    }

    static async parseErrorResponse(response) {
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return { message: await response.text() };
        } catch (error) {
            return { message: `HTTP Error ${response.status} : error ${error}` };
        }
    }

    static handleError(error) {
        console.error('API Error:', error);
    }

    // src/app/config/ApiUtils.js
    static async handleLogoutAndRedirect() {
        await store.dispatch(logout());

        // Redirect to login page
        if (window.location.pathname !== '/login') {
            // Store the current location to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = '/login?expired=true';
        }
    }
}

export default ApiUtils;