// Global URL configuration for API endpoints

export const API_URL = "http://localhost:8080";
const API_VERSION = "/v1";
const BASE_URL = `${API_URL}${API_VERSION}`;

// Auth endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: `/auth/login`,
    LOGOUT: `/auth/logout`,
    REGISTER: `/auth/register`,
    REFRESH_TOKEN: `/auth/refresh-token`,
    IS_ADMIN: `/auth/admin`,
    IS_MASTER_ADMIN: `/auth/master-admin`,
    IS_TICKET_AGENT: `/auth/agent`,
    IS_OPERATOR: `/auth/operator`,
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

export const CSRF_ENDPOINTS = {
    GET: `${BASE_URL}/csrf`,
}

// Export base URL for potential direct use
export const API_CONFIG = {
    BASE_URL,
    API_URL,
    API_VERSION
};