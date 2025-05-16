/**
 * Secure storage utility for sensitive data
 * In a real implementation, this would use proper encryption
 * Here we're using a simple Base64 encoding for demonstration
 */
export const secureStorage = {
    /**
     * Store data securely
     * @param {string} key - The key to store the data under
     * @param {any} data - The data to store (will be JSON stringified)
     */
    setItem: (key, data) => {
        try {
            // In a real implementation, this would be encrypted
            const serialized = JSON.stringify(data);
            const encoded = btoa(serialized);
            localStorage.setItem(`secure_${key}`, encoded);
        } catch (error) {
            console.error('Failed to securely store data:', error);
        }
    },

    /**
     * Retrieve data from secure storage
     * @param {string} key - The key to retrieve
     * @returns {any} - The retrieved data, or null if not found
     */
    getItem: (key) => {
        try {
            const encoded = localStorage.getItem(`secure_${key}`);
            if (!encoded) return null;

            const decoded = atob(encoded);
            return JSON.parse(decoded);
        } catch (error) {
            console.error('Failed to retrieve secure data:', error);
            return null;
        }
    },

    /**
     * Remove data from secure storage
     * @param {string} key - The key to remove
     */
    removeItem: (key) => {
        localStorage.removeItem(`secure_${key}`);
    },

    /**
     * Clear all secure storage items
     */
    clear: () => {
        Object.keys(localStorage)
            .filter(key => key.startsWith('secure_'))
            .forEach(key => localStorage.removeItem(key));
    }
};