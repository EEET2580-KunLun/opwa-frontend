// Global URL configuration for API endpoints

export const API_URL = "http://localhost:8080";
const API_VERSION = "/v1";
const BASE_URL = `${API_URL}${API_VERSION}`;

// Auth endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: `${BASE_URL}/auth/login`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    REGISTER: `${BASE_URL}/auth/register`,
    REFRESH_TOKEN: `${BASE_URL}/auth/refresh-token`,
    IS_ADMIN: `${BASE_URL}/auth/admin`,
    IS_MASTER_ADMIN: `${BASE_URL}/auth/master-admin`,
    IS_TICKET_AGENT: `${BASE_URL}/auth/agent`,
    IS_OPERATOR: `${BASE_URL}/auth/operator`,
};

// Staff endpoints
export const STAFF_ENDPOINTS = {
    FETCH_ALL: `${BASE_URL}/staffs`,
    FETCH_BY_ID: (staffId) => `${BASE_URL}/staffs/${staffId}`,
    CREATE: `${BASE_URL}/staffs`,
    UPDATE: (staffId) => `${BASE_URL}/staffs/${staffId}`,
    DELETE: (staffId) => `${BASE_URL}/staffs/${staffId}`,
    UPLOAD_AVATAR: (staffId) => `${BASE_URL}/staffs/${staffId}/avatar`,
    DELETE_AVATAR: (staffId) => `${BASE_URL}/staffs/${staffId}/avatar`,
    GET_AVATAR: (staffId) => `${BASE_URL}/staffs/${staffId}/avatar`,
};

// Export base URL for potential direct use
export const API_CONFIG = {
    BASE_URL,
    API_URL,
    API_VERSION
};