import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../../app/route/ProtectedRoute';
import theme from '../styles/theme';
import {ThemeProvider} from "@mui/material/styles";

// Lazy load ticket components
const GuestPurchase = lazy(() => import('../components/GuestPurchase'));
const PassengerPurchase = lazy(() => import('../components/PassengerPurchase'));
const TicketHistory = lazy(() => import('../components/TicketHistory'));
const TicketDashboard = lazy(() => import('../components/TicketDashboard'));
const TicketList = lazy(() => import('../components/TicketList'))

const withTicketTheme = (Component) => (
    <ThemeProvider theme={theme}>
        <Component />
    </ThemeProvider>
);

const TicketRoutes = (
    <>
        {/* Public Guest Flow */}
        <Route path="/tickets/guest-purchase" element={<GuestPurchase />} />

        {/* Passenger Flow */}
        <Route element={<ProtectedRoute allowedRoles={['TICKET_AGENT']} />}>
            <Route path="/tickets/purchase" element={<PassengerPurchase />} />
            <Route path="/tickets/history" element={<TicketHistory />} />
        </Route>

        {/* Ticket Agent Flow */}
        <Route element={<ProtectedRoute allowedRoles={['TICKET_AGENT']} />}>
            <Route path="/ticket-agent/dashboard" element={<TicketDashboard />} />
            <Route path="/ticket-agent/tickets" element={<TicketList />} />
            <Route path="/ticket-agent/tickets/sell" element={<PassengerPurchase />} />
        </Route>

        {/* Admin Flow */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER_ADMIN', 'TICKET_AGENT']} />}>
            <Route path="/admin/tickets" element={<TicketList />} />
            <Route path="/admin/tickets/history" element={<TicketHistory />} />
        </Route>
    </>
);

export default TicketRoutes;