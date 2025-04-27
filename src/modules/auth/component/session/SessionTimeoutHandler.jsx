// src/modules/auth/component/session/SessionTimeoutHandler.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../service/AuthService';

const SessionTimeoutHandler = () => {
    const navigate = useNavigate();

    // Still use selector to reactively respond to auth state changes
    const { isAuthenticated, tokenExpiry } = useSelector(state => state.auth);

    useEffect(() => {
        if (!isAuthenticated || !tokenExpiry) return;

        // Calculate time until token expires (with 30-second buffer)
        const expiryTime = new Date(tokenExpiry).getTime();
        const currentTime = new Date().getTime();
        const timeUntilExpiry = Math.max(0, expiryTime - currentTime - 30000);

        // Set timeout to handle expiration
        const expiryTimer = setTimeout(async () => {
            await AuthService.logout();
            navigate('/login', {
                state: {
                    message: 'Your session has expired. Please log in again.'
                }
            });
        }, timeUntilExpiry);

        return () => clearTimeout(expiryTimer);
    }, [isAuthenticated, tokenExpiry, navigate]);

    return null; // This is a non-visual component
};

export default SessionTimeoutHandler;