import React, { useState } from 'react';
import { FaEnvelope, FaEyeSlash, FaEye, FaGoogle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useSearchParams } from 'react-router-dom';
import './Styles.css'
import { useLogin } from '../../hook/useLogin.js';
import {useEffect, useRef} from "react";
import {toast} from 'sonner'
import {CSRF_ENDPOINTS} from "../../../../app/config/Api.js";
import { useDispatch } from 'react-redux';
import { setXSRFToken } from "../../store/authSlice.js";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const [searchParams] = useSearchParams();
    const message = searchParams.get('message');

    // Import dispatch from redux
    const dispatch = useDispatch();
    const csrfFetchedRef = useRef(false);

    // get CSRF token from server before any API calls
    useEffect(() => {
        if (csrfFetchedRef.current) return; // Prevent duplicate calls
        const fetchCSRF = async () => {
            try {
                const response = await fetch(CSRF_ENDPOINTS.GET, { credentials: 'include' });
                const data = await response.json();
                dispatch(setXSRFToken(data.token));
                toast.success('CSRF token fetched successfully');
                csrfFetchedRef.current = true; // Mark as fetched
            } catch (err) {
                toast.error(`Failed to fetch CSRF token: ${err.message}`);
                console.error('CSRF fetch error:', err);
                csrfFetchedRef.current = true; // Mark as fetched
            }
        };

        fetchCSRF();
    }, [dispatch]);

    const {
        email,
        password,
        error,
        isLoading,
        handleEmailChange,
        handlePasswordChange,
        handleSubmit,
        handleGoogleLogin
    } = useLogin();

    return(
        <div className="login-container">
            {message && <div className="alert alert-info">{message}</div>}
            <div className="login-card">
                <h1 className="text-center text-white mb-4">Sign in</h1>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <div className="input-group mb-4">
                    <input
                        type="email"
                        className="form-control login-input"
                        placeholder="Email"
                        value={email}
                        onChange={handleEmailChange}
                        disabled={isLoading}
                    />
                    <span className="input-group-text login-icon">
                        <FaEnvelope />
                    </span>
                </div>

                <div className="input-group mb-2">
                    <input
                        type={showPassword ? "text" : "password"}
                        className="form-control login-input"
                        placeholder="Password"
                        value={password}
                        onChange={handlePasswordChange}
                        disabled={isLoading}
                    />
                    <span
                        className="input-group-text login-icon cursor-pointer"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                </div>

                <div className="text-end mb-4">
                    <Link to="/forgot-password" className="forgot-password">
                        Forgot password?
                    </Link>
                </div>

                <button className="btn btn-primary w-100 login-button mb-3"
                        onClick={handleSubmit}
                        disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </button>

                <div className="divider">
                    <span className="divider-text">Or</span>
                </div>

                <button className="btn btn-outline-light w-100 google-button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}>
                    <span className="google-icon">
                        <FaGoogle />
                    </span>
                    Sign in with Google
                </button>
            </div>
        </div>
    )
}

export default Login;