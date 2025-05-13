import {Navigate, Route, Routes} from 'react-router-dom';
import React from 'react';
import { Suspense, lazy } from 'react';
import ProtectedRoute from './ProtectedRoute.jsx';
import StaffManagement from "../../modules/staff/components/StaffManagement.jsx";
import Page404 from "../../shared/errorPage/404.jsx";
import Page500 from "../../shared/errorPage/500.jsx";
import Page403 from "../../shared/errorPage/403.jsx";
import Page401 from "../../shared/errorPage/401.jsx";

const WelcomeUI = lazy(() => import('../../modules/auth/component/welcoming/WelcomeUI.jsx'));
const About = lazy(() => import('../../modules/auth/component/welcoming/About.jsx'));
const Login = lazy(() => import('../../modules/auth/component/welcoming/Login.jsx'));
const ForgotPassword = lazy(() => import('../../modules/auth/component/ForgotPassword.jsx'));
const StaffCreationForm = lazy(() => import('../../modules/staff/components/StaffCreationForm.jsx'));
const StaffProfile = lazy(() => import('../../modules/staff/components/StaffProfile.jsx'));
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
                <Route path="*" element={<Navigate to="/404" />} />
                <Route path="/401" element={<Page401 />} />
                <Route path="/403" element={<Page403 />} />
                <Route path="/404" element={<Page404 />} />
                <Route path="/500" element={<Page500 />} />
                {/*<Route path="/unauthorized" element={<Unauthorized />} />*/}

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER_ADMIN']} />}>
                    <Route path="/admin/dashboard" element={<TestingAdminDashboard />} />
                    <Route path="/admin/staff" element={<StaffManagement />} />
                    <Route path="admin/staff/create" element={<StaffCreationForm />} />
                    <Route path="admin/staff/edit/:id" element={<StaffCreationForm />} />
                    <Route path="admin/staff/profile/:id" element={<StaffProfile />} />
                </Route>

                {/* Operator Routes */}
                <Route element={<ProtectedRoute allowedRoles={['OPERATOR']} />}>
                    <Route path="/operator/dashboard" element={<TestingAdminDashboard />} />
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