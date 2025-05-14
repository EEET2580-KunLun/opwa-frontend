import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../../app/route/ProtectedRoute';

// Lazy load components for better performance
const LineList = React.lazy(() => import('../components/LineList'));
const LineForm = React.lazy(() => import('../components/LineForm'));
const LineSchedule = React.lazy(() => import('../components/LineSchedule'));
const LineSuspend = React.lazy(() => import('../components/LineSuspend'));
const LineMap = React.lazy(() => import('../components/LineMap'));

const LineRoutes = (
    <>
        {/* Admin routes */}
        <Route path="/admin/lines" element={
            <ProtectedRoute roles={['ADMIN', 'MASTER_ADMIN']}>
                <LineList />
            </ProtectedRoute>
        } />
        <Route path="/admin/lines/create" element={
            <ProtectedRoute roles={['ADMIN', 'MASTER_ADMIN']}>
                <LineForm />
            </ProtectedRoute>
        } />
        <Route path="/admin/lines/:id/edit" element={
            <ProtectedRoute roles={['ADMIN', 'MASTER_ADMIN']}>
                <LineForm />
            </ProtectedRoute>
        } />
        <Route path="/admin/lines/:id/schedule" element={
            <ProtectedRoute roles={['ADMIN', 'MASTER_ADMIN']}>
                <LineSchedule />
            </ProtectedRoute>
        } />
        <Route path="/admin/lines/:id/suspend" element={
            <ProtectedRoute roles={['ADMIN', 'MASTER_ADMIN']}>
                <LineSuspend />
            </ProtectedRoute>
        } />
        <Route path="/admin/lines/:id/map" element={
            <ProtectedRoute roles={['ADMIN', 'MASTER_ADMIN']}>
                <LineMap />
            </ProtectedRoute>
        } />

        {/* Operator routes */}
        <Route path="/operator/lines" element={
            <ProtectedRoute roles={['OPERATOR']}>
                <LineList />
            </ProtectedRoute>
        } />
        <Route path="/operator/lines/create" element={
            <ProtectedRoute roles={['OPERATOR']}>
                <LineForm />
            </ProtectedRoute>
        } />
        <Route path="/operator/lines/:id/edit" element={
            <ProtectedRoute roles={['OPERATOR']}>
                <LineForm />
            </ProtectedRoute>
        } />
        <Route path="/operator/lines/:id/schedule" element={
            <ProtectedRoute roles={['OPERATOR']}>
                <LineSchedule />
            </ProtectedRoute>
        } />
        <Route path="/operator/lines/:id/suspend" element={
            <ProtectedRoute roles={['OPERATOR']}>
                <LineSuspend />
            </ProtectedRoute>
        } />
        <Route path="/operator/lines/:id/map" element={
            <ProtectedRoute roles={['OPERATOR']}>
                <LineMap />
            </ProtectedRoute>
        } />
    </>
);

export default LineRoutes;