import { API_URL } from "../../../app/config/Api.js";

export const login = async(email, password) => {
    try {
        const response = await fetch(`${API_URL}/v1/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        })
        const data = await response.json();

        if(!response.ok) {
            return {
                success: false,
                message: data.meta?.message || "Login failed. Please try again."
            }
        }

        const accessToken = data.data?.access_token

        if (!accessToken) {
            console.error("Login response doesn't contain a token:", data);
            return {
                success: false,
                message: "Authentication failed: No token received"
            };
        }

        const userRole = extractRoleFromToken(accessToken);

        return {
            success: true,
            token: data.data.accessToken,
            role: userRole,
            refreshToken: data.data.refreshToken,
            expiresIn: data.data.expiresIn,
        }
    } catch(error){
        console.error("Login error: ", error);
        return{
            success: false,
            message: "Network error. Please try again later."
        }
    }
}


const extractRoleFromToken = (token) => {
    try {
        if (!token) {
            console.warn('No token provided to extractRoleFromToken');
            return 'USER'; // Default role
        }

        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            console.warn('Token does not appear to be in JWT format');
            return 'USER';
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        // Check where the role might be in in payload structure
        return payload.role || payload.authorities || payload.roles || 'USER';
    } catch (error) {
        console.error('Error extracting role from token', error);
        return 'USER';
    }
};


export const isAuthenticated = () => {
    const token = sessionStorage.getItem("token");
    return !!token; // return true if token is not null
}

export const getUserRole = () => {
    return sessionStorage.getItem("userRole");
}

// For logout
export const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userRole");
    window.location.href = "/login"; // redirect to login page
}

export const getToken = () => {
    return sessionStorage.getItem("token");
}