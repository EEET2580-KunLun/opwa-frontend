import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../../app/route/ProtectedRoute.jsx';
import PassengerManagement from '../components/PassengerManagement.jsx';
import PassengerForm from '../components/PassengerForm.jsx';
import PassengerTicketPurchase from '../components/PassengerTicketPurchase.jsx';

const PassengerRoutes = (
    <>
        {/* Passenger management for admins and ticket agents */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'TICKET_AGENT']} />}>
            <Route path="/admin/passenger" element={<PassengerManagement />} />
            <Route path="/admin/passenger/create" element={<PassengerForm />} />
            <Route path="/admin/passenger/edit/:id" element={<PassengerForm />} />
            <Route path="/admin/passenger/tickets/:id" element={<PassengerTicketPurchase />} />
        </Route>
    </>
);

export default PassengerRoutes;