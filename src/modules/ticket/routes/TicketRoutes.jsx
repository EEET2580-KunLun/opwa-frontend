import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../../app/route/ProtectedRoute';
import {ThemeProvider} from '@mui/material/styles';
import StaffCreationForm from "../../staff/components/StaffCreationForm.jsx";

// Lazy load ticket components
const GuestPurchase = lazy(() => import('../components/GuestPurchase'));
const PassengerPurchase = lazy(() => import('../components/PassengerPurchase'));
const TicketDashboard = lazy(() => import('../components/TicketDashboard'));
const TicketList = lazy(() => import('../components/TicketList'))
const TicketManagement = lazy(() => import('../components/TicketManagement'));

const withTicketTheme = (Component) => (
    <ThemeProvider theme={theme}>
        <Component />
    </ThemeProvider>
);

const TicketRoutes = (
    <>
        {/* Public Guest Flow */}
        <Route path="/tickets/guest-purchase" element={<GuestPurchase />} />

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER_ADMIN', 'TICKET_AGENT']} />}>
            <Route path="/ticket-agent/dashboard" element={<TicketDashboard />} />
            <Route path="/ticket-agent/tickets" element={<TicketList />} />
            <Route path="/ticket-agent/tickets/sell" element={<PassengerPurchase />} />
            <Route path="/tickets/purchase" element={<PassengerPurchase />} />
            <Route path="/admin/tickets" element={<TicketManagement />} />
            <Route path="/ticket-agent/profile" element={<StaffCreationForm />} />
        </Route>
    </>
);

export default TicketRoutes;