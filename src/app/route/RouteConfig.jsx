import { Route, Routes } from 'react-router-dom';
import React from 'react';
import { Suspense, lazy } from 'react';
import ProtectedRoute from './ProtectedRoute.jsx';
import StaffManagement from "../../modules/staff/components/StaffManagement.jsx";

const WelcomeUI = lazy(() => import('../../modules/auth/component/welcoming/WelcomeUI.jsx'));
const About = lazy(() => import('../../modules/auth/component/welcoming/About.jsx'));
const Login = lazy(() => import('../../modules/auth/component/welcoming/Login.jsx'));
const ForgotPassword = lazy(() => import('../../modules/auth/component/ForgotPassword.jsx'));

const TestingAdminDashboard = lazy(() => import('../../modules/auth/testing/TestingAdminDashboard.jsx')); // for testing purpose only
const RouteConfig = () => {
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<WelcomeUI />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                {/*<Route path="/unauthorized" element={<Unauthorized />} />*/}

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER_ADMIN']} />}>
                    {/*<Route path="/admin/dashboard" element={<AdminDashboard />} />*/}
                    <Route path="/admin/staff" element={<StaffManagement />} />
                </Route>

                {/* Operator Routes */}
                <Route element={<ProtectedRoute allowedRoles={['OPERATOR']} />}>
                    {/*<Route path="/operator/dashboard" element={<OperatorDashboard />} />*/}
                </Route>

                {/* Ticket Agent Routes */}
                <Route element={<ProtectedRoute allowedRoles={['TICKET_AGENT']} />}>
                    {/*<Route path="/ticket-agent/dashboard" element={<TicketAgentDashboard />} />*/}
                </Route>
            </Routes>
        </Suspense>
    )
}

export default RouteConfig;