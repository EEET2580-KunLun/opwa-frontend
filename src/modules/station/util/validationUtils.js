/**
 * Validates station name
 * @param {string} name - The station name to validate
 * @returns {boolean} - Whether the station name is valid
 */
export const validateStationName = (name) => {
    return name && name.trim().length >= 2 && name.trim().length <= 100;
};

/**
 * Validates station address
 * @param {string} address - The address to validate
 * @returns {boolean} - Whether the address is valid
 */
export const validateAddress = (address) => {
    return address && address.trim().length >= 5 && address.trim().length <= 200;
};

/**
 * Validates location coordinates
 * @param {Array} location - The location coordinates [longitude, latitude]
 * @returns {boolean} - Whether the coordinates are valid
 */
export const validateLocation = (location) => {
    if (!Array.isArray(location) || location.length !== 2) return false;
    
    const [longitude, latitude] = location;
    
    // Validate longitude (-180 to 180)
    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) return false;
    
    // Validate latitude (-90 to 90)
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) return false;
    
    return true;
};