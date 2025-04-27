// src/modules/auth/hook/useLogin.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthService from '../service/AuthService';

export const useLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');

    const navigate = useNavigate();

    // Get loading and error from Redux state
    const { loading, error: reduxError } = useSelector(state => state.auth);

    // Email validation
    const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.(com|vn)$/;
        return regex.test(email);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (localError) setLocalError('');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (localError) setLocalError('');
    };

    const handleSubmit = async () => {
        // Validate input fields
        if (!email.trim() || !password.trim()) {
            setLocalError('Please enter your email and password');
            return;
        }

        if (!isValidEmail(email)) {
            setLocalError("Invalid email format. The email must end with '.com' or '.vn'");
            return;
        }

        try {
            const result = await AuthService.login(email, password);

            if (result.success) {
                // Get redirectUrl from session storage or default by role
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin');

                if (redirectUrl) {
                    sessionStorage.removeItem('redirectAfterLogin');
                    navigate(redirectUrl);
                } else {
                    // Navigate based on user role
                    switch (result.role) {
                        case "ADMIN":
                            navigate("/admin/dashboard");
                            break;
                        case "OPERATOR":
                            navigate("/operator/dashboard");
                            break;
                        case "TICKET_AGENT":
                            navigate("/ticket-agent/dashboard");
                            break;
                        case "MASTER_ADMIN":
                            navigate("/master-admin/dashboard");
                            break;
                        default:
                            navigate("/login");
                    }
                }
            } else {
                setLocalError(result.message);
            }
        } catch (err) {
            setLocalError('Authentication failed. Please try again later.');
            console.error('Login error:', err);
        }
    };

    const handleGoogleLogin = async () => {
        // Placeholder for Google login
        try {
            setLocalError('');
            console.log("Google login initiated");
            // Implementation would call AuthService.googleLogin() if available
        } catch (err) {
            setLocalError('Google authentication failed. Please try again.');
            console.error('Google login error:', err);
        }
    };

    return {
        email,
        password,
        error: localError || reduxError,
        loading,
        handleEmailChange,
        handlePasswordChange,
        handleSubmit,
        handleGoogleLogin
    };
};

export default useLogin;