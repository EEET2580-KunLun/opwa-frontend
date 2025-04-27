// src/app/route/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useSelector(state => state.auth);

    // Check if user is authenticated and has required role
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Assuming user object has a role property
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