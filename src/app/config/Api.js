// Global URL configuration for API endpoints

export const API_URL = "http://localhost:8080";

// Auth endpoints:
export const AUTH_ENDPOINTS = {
    LOGIN: `${API_URL}/v1/auth/login`,
    // GOOGLE_LOGIN: `${API_URL}/auth/google`,
    REGISTER: `${API_URL}/v1/auth/register`,
};