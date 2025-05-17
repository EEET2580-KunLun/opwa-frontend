import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../../app/route/ProtectedRoute';

// Lazy load ticket components
const TicketAnalytics = lazy(() => import('../components/TicketAnalytics'));

const StatisticsRoutes = (
    <>
        {/* Admin Flow */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER_ADMIN', 'TICKET_AGENT']} />}>
d            <Route path="/admin/statistics/tickets" element={<TicketAnalytics />} />
        </Route>
    </>
);

export default StatisticsRoutes;