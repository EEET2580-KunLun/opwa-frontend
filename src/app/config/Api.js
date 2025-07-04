// Global URL configuration for API endpoints

export const API_URL = "https://localhost:9443";
export const PAWA_API_URL = "https://localhost:8443";
const API_VERSION = "/v1";
const BASE_URL = `${API_URL}${API_VERSION}`;
const PAWA_BASE_URL = `${PAWA_API_URL}/api`;

// Auth endpoints
export const AUTH_ENDPOINTS = {
    VALIDATE: '/auth/validate',
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
    FETCH_ALL: `/staffs`,
    FETCH_BY_ID: (staffId) => `/staffs/${staffId}`,
    CREATE: `/staffs`,
    CREATE_WITH_PICTURES: '/staffs/with-pictures',
    UPDATE: (id) => `/staffs/${id}`,
    DELETE: (id) => `/staffs/${id}`,
    UPDATE_PROFILE: '/staffs/profile',
    UPDATE_NATIONAL_ID: '/staffs/profile/national-id',
    UPLOAD_AVATAR: (id) => `/staffs/${id}/avatar`,
    DELETE_AVATAR: (id) => `/staffs/${id}/avatar`,
    UPLOAD_ID: (id) => `/staffs/${id}/national-id`,
    DELETE_ID: (id) => `/staffs/${id}/national-id`,
    TOGGLE_EMPLOYMENT: (id) => `/staffs/${id}/employment`,
    INVITE_STAFF: '/staffs/invite',
};

// Line endpoints
export const LINE_ENDPOINTS = {
    FETCH_ALL: '/lines',
    FETCH_BY_ID: (id) => `/lines/${id}`,
    CREATE: '/lines',
    UPDATE: (id) => `/lines/${id}`,
    DELETE: (id) => `/lines/${id}`,
    GENERATE_SCHEDULE: (id) => `/lines/${id}/schedule/generate`,
    GET_SCHEDULE: (id) => `/lines/${id}/schedule/overview`,
    GET_TRIPS: (id) => `/lines/${id}/trips`,
    SUSPEND: (id) => `/lines/${id}/suspend`,
    RESUME: (id) => `/lines/${id}/resume`,
    FIND_TRIPS: '/lines/trips/search',
    FIND_UPCOMING_TRIPS: '/lines/trips/upcoming',
    CHECK_NAME: '/lines/check-name',
};

// Station endpoints
export const STATION_ENDPOINTS = {
    FETCH_ALL: '/stations',
    FETCH_BY_ID: (id) => `/stations/${id}`,
    CREATE: '/stations',
    UPDATE: (id) => `/stations/${id}`,
    DELETE: (id) => `/stations/${id}`,
};

export const TICKET_ENDPOINTS = {
    TYPES: '/tickets/type',
    AGENT_PURCHASE: '/tickets/agent-purchase',
    AGENT_PURCHASE_GUEST: '/tickets/agent-purchase/guest',
    ALL: '/tickets/',
};

export const STATISTICS_ENDPOINTS = {
    USERS: '/statistics/users',
    TICKETS: '/statistics/tickets',
};

export const PASSENGER_ENDPOINTS = {
    ALL: '/passenger/all',
    FETCH_BY_ID: (id) => `/passenger/${id}`,
    CREATE: '/passenger',
    UPDATE: (id) => `/passenger/${id}`,
    DELETE: (id) => `/passenger/${id}`,
    WALLET: (id) => `/wallet/${id}`,
};

export const CSRF_ENDPOINTS = {
    GET: `${BASE_URL}/csrf`,
}

// Export base URL for potential direct use
export const API_CONFIG = {
    BASE_URL,
    API_URL,
    API_VERSION,
    PAWA_API_URL,
    PAWA_BASE_URL,
};