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
const AdminDashboard = lazy(() => import('../../modules/auth/testing/AdminDashboard.jsx'));
const OperatorDashboard = lazy(() => import('../../modules/auth/testing/OperatorDashboard.jsx'));

const LineList = lazy(() => import('../../modules/line/components/LineList.jsx'));
const LineForm = lazy(() => import('../../modules/line/components/LineForm.jsx'));
const LineSchedule = lazy(() => import('../../modules/line/components/LineSchedule.jsx'));
const LineSuspend = lazy(() => import('../../modules/line/components/LineSuspend.jsx'));
const LineMap = lazy(() => import('../../modules/line/components/LineMap.jsx'));

const StationList = lazy(() => import('../../modules/station/components/StationList.jsx'));
const StationForm = lazy(() => import('../../modules/station/components/StationForm.jsx'));

const TicketDashboard = lazy(() => import('../../modules/ticket/components/TicketDashboard.jsx'));
const TicketHistory = lazy(() => import('../../modules/ticket/components/TicketHistory.jsx'));
const TicketList = lazy(() => import('../../modules/ticket/components/TicketList.jsx'));

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
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/staff" element={<StaffManagement />} />
                    <Route path="admin/staff/create" element={<StaffCreationForm />} />
                    <Route path="admin/staff/edit/:id" element={<StaffCreationForm />} />
                    <Route path="admin/staff/profile/:id" element={<StaffProfile />} />

                    <Route path="/admin/lines" element={<LineList />} />
                    <Route path="/admin/lines/create" element={<LineForm />} />
                    <Route path="/admin/lines/:id/edit" element={<LineForm />} />
                    <Route path="/admin/lines/:id/schedule" element={<LineSchedule />} />
                    <Route path="/admin/lines/:id/suspend" element={<LineSuspend />} />
                    <Route path="/admin/lines/:id/map" element={<LineMap />} />

                    <Route path="/admin/stations" element={<StationList />} />
                    <Route path="/admin/stations/create" element={<StationForm />} />
                    <Route path="/admin/stations/:id/edit" element={<StationForm />} />

                    <Route path="/admin/tickets" element={<TicketList />} />
                    <Route path="/admin/tickets/history" element={<TicketHistory />} />
                </Route>

                {/* Operator Routes */}
                <Route element={<ProtectedRoute allowedRoles={['OPERATOR', 'ADMIN']} />}>
                    <Route path="/operator/dashboard" element={<OperatorDashboard />} />

                    {/* Operator Line Management Routes */}
                    <Route path="/operator/lines" element={<LineList />} />
                    <Route path="/operator/lines/create" element={<LineForm />} />
                    <Route path="/operator/lines/:id/edit" element={<LineForm />} />
                    <Route path="/operator/lines/:id/schedule" element={<LineSchedule />} />
                    <Route path="/operator/lines/:id/suspend" element={<LineSuspend />} />
                    <Route path="/operator/lines/:id/map" element={<LineMap />} />
                </Route>

                {/* Ticket Agent Routes */}
                <Route element={<ProtectedRoute allowedRoles={['TICKET_AGENT']} />}>
                    <Route path="/ticket-agent/dashboard" element={<TicketDashboard />} />
                    <Route path="/ticket-agent/tickets" element={<TicketList />} />
                    <Route path="/ticket-agent/tickets/history" element={<TicketHistory />} />
                    <Route path="/ticket-agent/profile" element={<StaffProfile />} />
                </Route>
            </Routes>
        </Suspense>
    )
}

export default RouteConfig;

// import {Navigate, Route, Routes} from 'react-router-dom';
// import React, { Suspense, lazy } from 'react';
// import ProtectedRoute from './ProtectedRoute.jsx';
// import StaffManagement from "../../modules/staff/components/StaffManagement.jsx";
// import Page404 from "../../shared/errorPage/404.jsx";
// import Page500 from "../../shared/errorPage/500.jsx";
// import Page403 from "../../shared/errorPage/403.jsx";
// import Page401 from "../../shared/errorPage/401.jsx";

// Import components normally as a fallback solution
// import WelcomeUI from '../../modules/auth/component/welcoming/WelcomeUI.jsx';
// import About from '../../modules/auth/component/welcoming/About.jsx';
// import Login from '../../modules/auth/component/welcoming/Login.jsx';
// import ForgotPassword from '../../modules/auth/component/ForgotPassword.jsx';
// import StaffCreationForm from '../../modules/staff/components/StaffCreationForm.jsx';
// import StaffProfile from '../../modules/staff/components/StaffProfile.jsx';
// import AdminDashboard from '../../modules/auth/testing/AdminDashboard.jsx';
// import OperatorDashboard from '../../modules/auth/testing/OperatorDashboard.jsx';

// Import Line management components
// import LineList from '../../modules/line/components/LineList.jsx';
// import LineForm from '../../modules/line/components/LineForm.jsx';
// import LineSchedule from '../../modules/line/components/LineSchedule.jsx';
// import LineSuspend from '../../modules/line/components/LineSuspend.jsx';
// import LineMap from '../../modules/line/components/LineMap.jsx';

// Comment out lazy loading for now until we fix the issue
/*
const WelcomeUI = lazy(() => import('../../modules/auth/component/welcoming/WelcomeUI.jsx'));
const About = lazy(() => import('../../modules/auth/component/welcoming/About.jsx'));
const Login = lazy(() => import('../../modules/auth/component/welcoming/Login.jsx'));
const ForgotPassword = lazy(() => import('../../modules/auth/component/ForgotPassword.jsx'));
const StaffCreationForm = lazy(() => import('../../modules/staff/components/StaffCreationForm.jsx'));
const StaffProfile = lazy(() => import('../../modules/staff/components/StaffProfile.jsx'));
const AdminDashboard = lazy(() => import('../../modules/auth/testing/AdminDashboard.jsx'));
const OperatorDashboard = lazy(() => import('../../modules/auth/testing/OperatorDashboard.jsx'));

const LineList = lazy(() => import('../../modules/line/components/LineList.jsx'));
const LineForm = lazy(() => import('../../modules/line/components/LineForm.jsx'));
const LineSchedule = lazy(() => import('../../modules/line/components/LineSchedule.jsx'));
const LineSuspend = lazy(() => import('../../modules/line/components/LineSuspend.jsx'));
const LineMap = lazy(() => import('../../modules/line/components/LineMap.jsx'));
*/

// const RouteConfig = () => {
//     return(
//         <Suspense fallback={<div>Loading...</div>}>
//             <Routes>
//                 {/* Public routes */}
//                 <Route path="/" element={<WelcomeUI />} />
//                 <Route path="/about" element={<About />} />
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/forgot-password" element={<ForgotPassword />} />
//                 <Route path="*" element={<Navigate to="/404" />} />
//                 <Route path="/401" element={<Page401 />} />
//                 <Route path="/403" element={<Page403 />} />
//                 <Route path="/404" element={<Page404 />} />
//                 <Route path="/500" element={<Page500 />} />
//                 {/*<Route path="/unauthorized" element={<Unauthorized />} />*/}
//
//                 {/* Admin Routes */}
//                 <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER_ADMIN']} />}>
//                     <Route path="/admin/dashboard" element={<AdminDashboard />} />
//                     <Route path="/admin/staff" element={<StaffManagement />} />
//                     <Route path="admin/staff/create" element={<StaffCreationForm />} />
//                     <Route path="admin/staff/profile/:id" element={<StaffProfile />} />
//
//                     <Route path="/admin/lines" element={<LineList />} />
//                     <Route path="/admin/lines/create" element={<LineForm />} />
//                     <Route path="/admin/lines/:id/edit" element={<LineForm />} />
//                     <Route path="/admin/lines/:id/schedule" element={<LineSchedule />} />
//                     <Route path="/admin/lines/:id/suspend" element={<LineSuspend />} />
//                     <Route path="/admin/lines/:id/map" element={<LineMap />} />
//                 </Route>
//
//                 {/* Operator Routes */}
//                 <Route element={<ProtectedRoute allowedRoles={['OPERATOR']} />}>
//                     <Route path="/operator/dashboard" element={<OperatorDashboard />} />
//
//                     {/* Operator Line Management Routes */}
//                     <Route path="/operator/lines" element={<LineList />} />
//                     <Route path="/operator/lines/create" element={<LineForm />} />
//                     <Route path="/operator/lines/:id/edit" element={<LineForm />} />
//                     <Route path="/operator/lines/:id/schedule" element={<LineSchedule />} />
//                     <Route path="/operator/lines/:id/suspend" element={<LineSuspend />} />
//                     <Route path="/operator/lines/:id/map" element={<LineMap />} />
//                 </Route>
//
//                 {/* Ticket Agent Routes */}
//                 <Route element={<ProtectedRoute allowedRoles={['TICKET_AGENT']} />}>
//                     {/*<Route path="/ticket-agent/dashboard" element={<TicketAgentDashboard />} />*/}
//                 </Route>
//             </Routes>
//         </Suspense>
//     )
// }
//
// export default RouteConfig;