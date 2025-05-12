import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ErrorPageStyle.css';
import { useNavigate } from 'react-router-dom';
import {useSelector} from "react-redux";
import {selectCurrentUser} from "../../modules/auth/store/authSlice.js";

export default function Page404() {
    const currentUser = useSelector(selectCurrentUser);
    const navigate = useNavigate();
    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-black text-white">
            <h1
                className="display-1 font-monospace mb-4 title"
            >
                404 (Not Found)
            </h1>

            <p className="mb-4 lead">Oops! The page you're looking for doesn't exist.</p>

            <button
                className="btn btn-outline-success btn-lg"
                // role-based navigation
                onClick={() => {
                    switch (currentUser?.role) {
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
                }}
            >
                Return to Home
            </button>
        </div>
    );
}