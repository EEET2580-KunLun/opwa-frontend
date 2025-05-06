import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {selectIsAuthenticated} from "../../modules/auth/store/authSlice.js";
import { selectCurrentUser } from '../../modules/auth/store/authSlice.js';
import {useLogoutMutation} from "../../modules/auth/store/authApiSlice.js";
import {PURGE} from "redux-persist";

const ProtectedRoute = ({ allowedRoles }) => {
    const isAuthenticated  = useSelector(selectIsAuthenticated);
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const [logout] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            const response = await logout();
            console.log("Logout response:", response);

            if (response.error) {
                console.error("Logout error:", response.error);
                return;
            }

            if (response.data.meta?.status === 200) {
                console.log("Logout successful");
            } else {
                console.error("Logout failed");
            }
        } catch (error) {
            console.error("Logout error:", error);
        }

        dispatch({
            type: PURGE,
            key: "root",
            result: () => null,
        });
        dispatch({ type: "RESET_STATE" });
    };

    React.useEffect(() => {
        if (!isAuthenticated) {
            handleLogout();
        }
    }, [isAuthenticated]);

    // Check if user is authenticated and has required role
    if (!isAuthenticated) {
        // If not authenticated, redirect to login page
        return <Navigate to="/login" replace />;
    }

    //get user role from redux store
    const userRole = user?.role || 'GUEST';

    // Check if user role is in allowed roles
    const hasRequiredRole = allowedRoles.includes(userRole);

    if (!hasRequiredRole) {
        return <Navigate to="/" replace />;
    }

    // If authenticated and authorized, render child routes
    return <Outlet />;
};

export default ProtectedRoute;