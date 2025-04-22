import { Route, Routes } from 'react-router-dom';
import React from 'react';
import { Suspense, lazy } from 'react';
import ProtectedRoute from './ProtectedRoute.jsx';

const WelcomeUI = lazy(() => import('../component/welcoming/WelcomeUI.jsx'));
const About = lazy(() => import('../component/welcoming/About.jsx'));
const Login = lazy(() => import('../component/welcoming/Login.jsx'));
const ForgotPassword = lazy(() => import('../component/ForgotPassword.jsx'));

const TestingAdminDashboard = lazy(() => import('../testing/TestingAdminDashboard.jsx')); // for testing purpose only
const RouteConfig = () => {
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/" element={<WelcomeUI />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/admin/dashboard" element={<TestingAdminDashboard />} />
                </Route>
            </Routes>
        </Suspense>
    )
}

export default RouteConfig;