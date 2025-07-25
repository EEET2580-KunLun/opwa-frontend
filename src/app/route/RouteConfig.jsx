import {Navigate, Route, Routes} from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ProtectedRoute from './ProtectedRoute.jsx';
import StaffManagement from "../../modules/staff/components/StaffManagement.jsx";
import Page404 from "../../shared/errorPage/404.jsx";
import Page500 from "../../shared/errorPage/500.jsx";
import Page403 from "../../shared/errorPage/403.jsx";
import Page401 from "../../shared/errorPage/401.jsx";
import MapComponent from "../../modules/map/MapComponent.jsx";
import OAuth2CallbackHandling from "../../modules/auth/component/OAuth2CallbackHandling.jsx";
import StatisticsRoutes from '../../modules/statistics/routes/StatisticsRoutes.jsx';
import PassengerRoutes from '../../modules/passenger/route/PassengerRoutes.jsx';
import TicketRoutes from '../../modules/ticket/routes/TicketRoutes.jsx';
import StaffRegisterForm from "../../modules/staff/components/StaffRegisterForm.jsx";
const WelcomeUI = lazy(() => import('../../modules/auth/component/welcoming/WelcomeUI.jsx'));
const About = lazy(() => import('../../modules/auth/component/welcoming/About.jsx'));
const Login = lazy(() => import('../../modules/auth/component/welcoming/Login.jsx'));
const ForgotPassword = lazy(() => import('../../modules/auth/component/ForgotPassword.jsx'));
const StaffCreationForm = lazy(() => import('../../modules/staff/components/StaffCreationForm.jsx'));
const StaffProfile = lazy(() => import('../../modules/staff/components/StaffProfile.jsx'));
const AdminDashboard = lazy(() => import('../../modules/auth/testing/AdminDashboard.jsx'));
const OperatorDashboard = lazy(() => import('../../modules/auth/testing/OperatorDashboard.jsx'));

const LineList = lazy(() => import('../../modules/line/components/LineList/LineList.jsx'));
const LineForm = lazy(() => import('../../modules/line/components/LineForm.jsx'));
const LineSchedule = lazy(() => import('../../modules/line/components/LineSchedule.jsx'));
const LineSuspend = lazy(() => import('../../modules/line/components/LineSuspend.jsx'));
const LineMap = lazy(() => import('../../modules/line/components/LineMap.jsx'));

const StationList = lazy(() => import('../../modules/station/components/StationList.jsx'));
const StationForm = lazy(() => import('../../modules/station/components/StationForm.jsx'));

const RouteConfig = () => {
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<WelcomeUI />} />`
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="*" element={<Navigate to="/404" />} />
                <Route path="/401" element={<Page401 />} />
                <Route path="/403" element={<Page403 />} />
                <Route path="/404" element={<Page404 />} />
                <Route path="/500" element={<Page500 />} />
                <Route path="/OAuth2/callback" element={<OAuth2CallbackHandling />} />
                <Route path="/invite/register/:token" element={<StaffRegisterForm />} />
                {/*<Route path="/unauthorized" element={<Unauthorized />} />*/}

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER_ADMIN']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/staff" element={<StaffManagement />} />
                    <Route path="admin/staff/create" element={<StaffCreationForm />} />
                    <Route path="admin/staff/edit/:id" element={<StaffCreationForm />} />
                    <Route path="admin/staff/profile/:id" element={<StaffProfile />} />
                    <Route path="admin/profile" element={<StaffCreationForm />} />

                    <Route path="/admin/lines" element={<LineList />} />
                    <Route path="/admin/lines/create" element={<LineForm />} />
                    <Route path="/admin/lines/:id/edit" element={<LineForm />} />
                    <Route path="/admin/lines/:id/schedule" element={<LineSchedule />} />
                    <Route path="/admin/lines/:id/suspend" element={<LineSuspend />} />
                    <Route path="/admin/lines/:id/map" element={<LineMap />} />

                    <Route path="/admin/stations" element={<StationList />} />
                    <Route path="/admin/stations/create" element={<StationForm />} />
                    <Route path="/admin/stations/:id/edit" element={<StationForm />} />
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
                    <Route path="/operator/profile" element={<StaffCreationForm />} />

                    <Route path="/operator/stations" element={<StationList />} />
                    <Route path="/operator/stations/create" element={<StationForm />} />
                    <Route path="/operator/stations/:id/edit" element={<StationForm />} />

                    <Route path="/operator/map" element={<MapComponent/>} />
                </Route>

                {StatisticsRoutes}
                {PassengerRoutes}
                {TicketRoutes}
            </Routes>
        </Suspense>
    )
}

export default RouteConfig;

