/**
 * Validates a National ID against Vietnamese ID requirements
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
export function validateNationalId(id) {
    return /^[0-9]{9,12}$/.test(id);
}

/**
 * Validates that a quantity is a non-negative integer
 * @param {number} qty - The quantity to validate
 * @returns {boolean} - Whether the quantity is valid
 */
export function validateQuantity(qty) {
    return Number.isInteger(qty) && qty >= 0;
}

/**
 * Validates that the cash received is enough to cover the total cost
 * @param {number} cash - The amount of cash received
 * @param {number} total - The total cost
 * @returns {boolean} - Whether the cash amount is sufficient
 */
export function validateCashReceived(cash, total) {
    return cash >= total;
}

/**
 * Validates a passenger ID format
 * @param {string} id - The passenger ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
export function validatePassengerId(id) {
    // Passenger IDs start with 'P' followed by numbers
    return /^P[0-9]{6,}$/.test(id);
}