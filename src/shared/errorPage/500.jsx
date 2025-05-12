import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ErrorPageStyle.css';
import { useNavigate } from 'react-router-dom';
import {useSelector} from "react-redux";
import {selectCurrentUser} from "../../modules/auth/store/authSlice.js";
import {useDispatch} from "react-redux";
import {setErrorCode, selectErrorCode} from "../../modules/auth/store/authSlice.js";

// This component displays a 500 error when the server encounters an error
export default function Page500() {
    const currentUser = useSelector(selectCurrentUser);
    const navigate = useNavigate();
    const errorCode = useSelector(selectErrorCode);
    const dispatch = useDispatch();
    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-black text-white">
            <h1
                className="display-1 font-monospace mb-4 title"
            >
                500 (Server Error)
            </h1>

            <p className="mb-4 lead">Oops! We are having some problems. Backend returns: {errorCode}</p>
            <button
                className="btn btn-outline-success btn-lg"
                // role-based navigation
                onClick={() => {
                    dispatch(setErrorCode(null));
                    console.log("Error code reset");
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