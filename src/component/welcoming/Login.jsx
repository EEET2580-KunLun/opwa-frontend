import React, { useState } from 'react';
import { FaEnvelope, FaEyeSlash, FaEye, FaGoogle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import './Styles.css'
import { useLogin } from '../../hook/useLogin';
const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const {
        email,
        password,
        error,
        loading,
        handleEmailChange,
        handlePasswordChange,
        handleSubmit,
        handleGoogleLogin
    } = useLogin();

    return(
        <div className="login-container">
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
                        disabled={loading}
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
                        disabled={loading}
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
                        disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <div className="divider">
                    <span className="divider-text">Or</span>
                </div>

                <button className="btn btn-outline-light w-100 google-button"
                    onClick={handleGoogleLogin}
                    disabled={loading}>
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