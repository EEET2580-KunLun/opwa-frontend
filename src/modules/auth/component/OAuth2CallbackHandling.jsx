import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {googleLogin, setXSRFToken} from '../store/authSlice.js';
import { Spinner } from 'react-bootstrap';
import { useValidateTokenMutation} from "../store/authApiSlice.js";
import {toast} from "sonner";
import {CSRF_ENDPOINTS} from "../../../app/config/Api.js";

const OAuth2CallbackHandling = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState(null);
    const [validateToken] = useValidateTokenMutation();

    // get CSRF token from server before any API calls
    useEffect(() => {
        const fetchCSRF = async () => {
            try {
                const response = await fetch(CSRF_ENDPOINTS.GET, { credentials: 'include' });
                const data = await response.json();
                dispatch(setXSRFToken(data.token));
                toast.success('CSRF token fetched successfully');
            } catch (err) {
                toast.error(`Failed to fetch CSRF token: ${err.message}`);
                console.error('CSRF fetch error:', err);
            }
        };

        fetchCSRF();
    }, [dispatch]);

    useEffect(() => {
        const validateTokenAndRedirect = async () => {
            try {
                // Call the validate endpoint to get user data
                const response = await validateToken();


                if (response.data?.meta?.status === 200) {
                    console.log(response)
                    dispatch(googleLogin(response));
                    setError('');

                    const role = response.data?.data?.staff.role;
                    toast.success("login successfully")
                    switch (role) {
                        case "ADMIN":
                            navigate("/admin/dashboard");
                            break;
                        case "OPERATOR":
                            navigate("/operator/dashboard");
                            break;
                        case "TICKET_AGENT":
                            navigate("/ticket-agent/dashboard");
                            break;
                        default:
                            navigate("/login");
                    }
                }else{
                    setError(response.data?.meta?.message || "Credentials failed");
                }
            } catch (err) {
                console.error('Authentication error:', err);
                setError('Authentication failed. Please try again.');
                navigate('/login');
            }
        };

        validateTokenAndRedirect();
    }, [dispatch, navigate]);

    if (error) {
        return <div className="text-center text-danger mt-5">{error}</div>;
    }

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="ms-3">Authenticating, please wait...</p>
        </div>
    );
};

export default OAuth2CallbackHandling;