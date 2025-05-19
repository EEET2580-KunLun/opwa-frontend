import { API_URL } from "../../../app/config/Api.js";

/**
 * @returns {Promise<Object>} - Login result with success status and data
 * */
export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/v1/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // must include cookies in the request
            body: JSON.stringify({
                email,
                password,
            }),
        })
        const data = await response.json();
        console.log("Login response:", data);

        if (!response.ok) {
            return {
                success: false,
                message: data.meta?.message || "Login failed. Please try again."
            }
        }

        // Some APIs use accessToken, others use access_token ????
        // Extract the token from the response data (don't store in the session storag)
        // TODO: Fix the naming convention later
        const accessToken = data.data?.accessToken || data.data?.access_token;
        const refreshToken = data.data?.refreshToken || data.data?.refresh_token;

        if (!accessToken) {
            console.error("Login response doesn't contain a token:", data);
            return {
                success: false,
                message: "Authentication failed: No token received"
            };
        }

        const userRole = extractRoleFromToken(accessToken);

        // Store only non-sensitive information
        sessionStorage.setItem("userRole", userRole);

        return {
            success: true,
            token: accessToken,
            role: userRole,
            refreshToken: refreshToken,
            expiresIn: data.data?.expiresIn || {},
        }
    } catch (error) {
        console.error("Login error: ", error);
        return {
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
        // return payload.role || payload.authorities || payload.roles || 'USER';
        return payload.role ||
            (payload.authorities && payload.authorities[0]) ||
            (payload.roles && payload.roles[0]) ||
            'USER';
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
// export const logout = () => {
//     sessionStorage.removeItem("token");
//     sessionStorage.removeItem("userRole");
//     window.location.href = "/login"; // redirect to login page
// }

// For logout
export const logout = async () => {
    try {
        // Call logout endpoint to invalidate cookies on server
        await fetch(`${API_URL}/v1/auth/logout`, {
            method: "POST",
            credentials: "include" // Include cookies
        });
    } catch (error) {
        console.warn("Logout API call failed:", error);
    } finally {
        sessionStorage.removeItem("userRole");
        window.location.href = "/login"; // redirect to login page
    }
}

export const getToken = () => {
    return sessionStorage.getItem("token");
}