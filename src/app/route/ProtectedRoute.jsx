import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {selectIsAuthenticated, selectErrorCode} from "../../modules/auth/store/authSlice.js";
import { selectCurrentUser } from '../../modules/auth/store/authSlice.js';
import {useLogoutMutation} from "../../modules/auth/store/authApiSlice.js";
import {PURGE} from "redux-persist";

const ProtectedRoute = ({ allowedRoles }) => {
    const isAuthenticated  = useSelector(selectIsAuthenticated);
    const errorCode = useSelector(selectErrorCode);
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const [logout] = useLogoutMutation();

    const handleLogout = React.useCallback(async () => {
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
    }, [logout, dispatch]);

    React.useEffect(() => {
        if (!isAuthenticated && errorCode === null) {
            handleLogout();
        }
    }, [isAuthenticated, errorCode, handleLogout]);

    // Check if error code is 500, 404, 403, 400
    // These errors FE and BE does not work together so can be considered as server error
    if (errorCode === 500 || errorCode === 404 || errorCode === 403 || errorCode === 400) {
        console.log("Error code:", errorCode);
        return <Navigate to="/500" replace />;
    }

    //token expired case
    if (!isAuthenticated && errorCode === 401) {
        return <Navigate to="/401" replace />;
    }

    //users logout or enter an endpoint that requires authentication
    if (!isAuthenticated && errorCode === null) {
        return <Navigate to="/login" replace />;
    }

    //get user role from redux store
    const userRole = user?.role || 'GUEST';

    // Check if user role is in allowed roles
    const hasRequiredRole = allowedRoles.includes(userRole);

    if (!hasRequiredRole) {
        return <Navigate to="/403" replace />;
    }

    // If authenticated and authorized, render child routes
    return <Outlet />;
};

export default ProtectedRoute;