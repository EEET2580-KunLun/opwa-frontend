/**
 * Utility function to convert camelCase object keys to snake_case
 * @param {Object} data - Object with camelCase keys
 * @returns {Object} - Object with snake_case keys
 */
export const convertToSnakeCase = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return data;
    }

    const result = {};
    
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            // Convert key from camelCase to snake_case
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            
            // Handle nested objects
            if (data[key] !== null && typeof data[key] === 'object' && !(data[key] instanceof Date) && !Array.isArray(data[key])) {
                result[snakeKey] = convertToSnakeCase(data[key]);
            } else {
                result[snakeKey] = data[key];
            }
        }
    }
    
    return result;
};

/**
 * Utility function to convert snake_case object keys to camelCase
 * @param {Object} data - Object with snake_case keys
 * @returns {Object} - Object with camelCase keys
 */
export const convertToCamelCase = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return data;
    }

    const result = {};
    
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            // Convert key from snake_case to camelCase
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            
            // Handle nested objects
            if (data[key] !== null && typeof data[key] === 'object' && !(data[key] instanceof Date) && !Array.isArray(data[key])) {
                result[camelKey] = convertToCamelCase(data[key]);
            } else {
                result[camelKey] = data[key];
            }
        }
    }
    
    return result;
};