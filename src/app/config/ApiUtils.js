
class ApiUtils {
    /**
     * Make a GET request
     * @param {string} url - The endpoint URL
     * @param {boolean} requiresAuth - Whether the request requires authentication
     * @returns {Promise<any>} The response data
     */
    static async get(url, requiresAuth = true) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // If it requires authentication, include credentials
        if (requiresAuth) {
            options.credentials = 'include';
        }

        try {
            const response = await fetch(url, options);
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Make a POST request
     * @param {string} url - The endpoint URL
     * @param {object} data - The data to send
     * @param {boolean} requiresAuth - Whether the request requires authentication
     * @returns {Promise<any>} The response data
     */
    static async post(url, data, requiresAuth = true) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        // If this requires authentication, include credentials
        if (requiresAuth) {
            options.credentials = 'include';
        }

        try {
            const response = await fetch(url, options);
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Handle API response
     * @param {Response} response - The fetch response
     * @returns {Promise<any>} The parsed response data
     */
    static async handleResponse(response) {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            if (!response.ok) {
                // Handle authentication errors
                if (response.status === 401) {
                    // Redirect to login if unauthorized
                    window.location.href = '/login';
                }

                throw {
                    status: response.status,
                    message: data.message || 'An error occurred',
                    data
                };
            }

            return data;
        } else {
            const text = await response.text();

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: text || 'An error occurred'
                };
            }

            return text;
        }
    }

    /**
     * Handle API errors
     * @param {Error} error - The error object
     */
    static handleError(error) {
        console.error('API Error:', error);
    }
}

export default ApiUtils;