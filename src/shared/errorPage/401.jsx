import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ErrorPageStyle.css';
import {setErrorCode} from "../../modules/auth/store/authSlice.js";
import {logout} from "../../modules/auth/store/authSlice.js";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";

export default function Page401() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-black text-white">
            <h1
                className="display-1 font-monospace mb-4 title"
            >
                401 (Unauthorized)
            </h1>

            <p className="mb-4 lead">Authentication is required (session expired, login required)</p>

            <button
                className="btn btn-outline-success btn-lg"
                onClick={() => {
                    dispatch(setErrorCode(null));
                    dispatch(logout());
                    console.log("Error code reset");
                    navigate("/login");
                }}
            >
                Login
            </button>
        </div>
    );
}