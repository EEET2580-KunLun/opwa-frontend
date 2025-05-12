// src/app/config/ApiUtils.js
import { AUTH_ENDPOINTS } from "./Api.js";

class ApiUtils {
    static isRefreshing = false;
    static refreshAttempts = 0;
    static MAX_REFRESH_ATTEMPTS = 1;

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
                if (this.refreshAttempts < this.MAX_REFRESH_ATTEMPTS) {
                    const refreshSuccess = await this.refreshToken();

                    if (refreshSuccess) {
                        // Reset refresh attempts on success
                        this.refreshAttempts = 0;
                        // Retry the original request if refresh was successful
                        return this.makeRequest(method, url, data);
                    }
                }

                // Reset counter for future attempts
                this.refreshAttempts = 0;

                const errorData = await this.parseErrorResponse(response);
                throw new Error(errorData.message || 'Authentication failed');
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

    static async refreshToken() {
        // Prevent multiple simultaneous refresh attempts
        if (this.isRefreshing) {
            return new Promise(resolve => {
                const checkRefreshStatus = setInterval(() => {
                    if (!this.isRefreshing) {
                        clearInterval(checkRefreshStatus);
                        resolve(true);
                    }
                }, 100);
            });
        }

        try {
            this.isRefreshing = true;
            this.refreshAttempts += 1;

            const response = await fetch(AUTH_ENDPOINTS.REFRESH_TOKEN, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        } finally {
            this.isRefreshing = false;
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
}

export default ApiUtils;