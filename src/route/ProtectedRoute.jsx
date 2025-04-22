import {TbNavigationEast} from "react-icons/tb";
import {Navigate, Outlet} from "react-router-dom";
import {getUserRole, isAuthenticated} from "../auth/service/AuthService.js";

const ProtectedRoute = ({allowedRoles}) => {
    const isAuth = isAuthenticated();
    const userRole = getUserRole();

    // If user is not authenticated
    if (!isAuth) {
        return(
            <Navigate to="/login" replace/>
        )
    }

    // If allowedRoles is not provided or empty, allow access to any authenticated user
    if(!allowedRoles || allowedRoles.length === 0) {
        return(
            <Outlet/>
        )
    }

    // If user role is in allowedRoles, allow access
    if (allowedRoles.includes(userRole)) {
        return <Outlet />;
    }

    // If user role is not in allowedRoles, redirect to unauthorized page
    return <Navigate to="/login" replace />;
}

export default ProtectedRoute;