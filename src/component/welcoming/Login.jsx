import React, { useState } from 'react';
import { FaEnvelope, FaEyeSlash, FaEye, FaGoogle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import './Styles.css'

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    return(
        <div className="login-container">
            <div className="login-card">
                <h1 className="text-center text-white mb-4">Sign in</h1>

                <div className="input-group mb-4">
                    <input
                        type="email"
                        className="form-control login-input"
                        placeholder="Email"
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

                <button className="btn btn-primary w-100 login-button mb-3">
                    Sign in
                </button>

                <div className="divider">
                    <span className="divider-text">Or</span>
                </div>

                <button className="btn btn-outline-light w-100 google-button">
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