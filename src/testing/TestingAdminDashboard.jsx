import React from 'react';
import { getUserRole } from '../auth/service/AuthService';

const TestingAdminDashboard = () => {
    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h2>Admin Dashboard</h2>
                </div>
                <div className="card-body">
                    <h4>Welcome to the HCMC Metro Admin Dashboard</h4>
                    <p>You are logged in as: <strong>{getUserRole()}</strong></p>
                    <p>This is a test dashboard for successful login.</p>
                </div>
            </div>
        </div>
    );
};

export default TestingAdminDashboard;