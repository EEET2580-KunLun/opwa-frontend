import { API_URL } from "../../../app/config/Api.js";

function getCsrfToken() {
    const match = document.cookie.match('(^|;)\\s*XSRF-TOKEN\\s*=\\s*([^;]+)');
    return match ? match[2] : '';

}

export const login = async(email, password) => {
    try {
        const response = await fetch(`${API_URL}/v1/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": getCsrfToken()

            },
            body: JSON.stringify({
                email,
                password,
            }),
            credentials: 'include' // This is for cookies to be sent/received
        })
        const data = await response.json();

        if(!response.ok) {
            return {
                success: false,
                message: data.meta?.message || "Login failed. Please try again."
            }
        }

        // const accessToken = data.data?.access_token

        // if (!accessToken) {
        //     console.error("Login response doesn't contain a token:", data);
        //     return {
        //         success: false,
        //         message: "Authentication failed: No token received"
        //     };
        // }

        const userRole = data.data?.role;

        // Store only the role and user info in sessionStorage, not the token
        sessionStorage.setItem("userRole", userRole);
        if (data.data?.user) {
            sessionStorage.setItem("userInfo", JSON.stringify(data.data.user));
        }

        return {
            success: true,
            role: userRole
            // we're using HTTP-only cookies
        }
    } catch(error){
        console.error("Login error: ", error);
        return{
            success: false,
            message: "Network error. Please try again later."
        }
    }
}

export const isAuthenticated = async () => {
    // Instead of checking for a token in sessionStorage, make a request to protected endpoint to check if the cookie is valid
    try {
        const response = await fetch(`${API_URL}/v1/auth/validate`, {
            method: 'GET',
            credentials: 'include' // for sending the cookie
        });

        return response.ok;
    } catch (error) {
        console.error('Authentication check failed:', error);
        return false;
    }

}

export const getUserRole = () => {
    return sessionStorage.getItem("userRole");
}

// For logout, call the backend to clear the cookie
export const logout = async () => {
    try {
        // Call backend to invalidate and clear the cookie
        await fetch(`${API_URL}/v1/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear local storage/session storage
        sessionStorage.removeItem("userRole");
        sessionStorage.removeItem("userInfo");
        window.location.href = "/login"; // redirect to login page
    }
}