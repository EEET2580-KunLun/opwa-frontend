import { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../../app/route/ProtectedRoute';

// Lazy load statistics components
const Statistics = lazy(() => import('../components/Statistics'));
const TicketAnalytics = lazy(() => import('../components/TicketAnalytics'));
const UserAnalytics = lazy(() => import('../components/UserAnalytics'));

const StatisticsRoutes = (
    <>
        {/* Admin Flow */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER_ADMIN']} />}>
            <Route path="/admin/statistics" element={<Statistics />} />
            <Route path="/admin/statistics/tickets" element={<TicketAnalytics />} />
            <Route path="/admin/statistics/users" element={<UserAnalytics />} />
        </Route>
    </>
);

export default StatisticsRoutes;