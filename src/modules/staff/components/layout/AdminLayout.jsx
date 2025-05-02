import React from 'react';
import { Container } from 'react-bootstrap';
import SideBar from '../SideBar.jsx';
import './AdminStyles.css';

const AdminLayout = ({ children }) => {
    return (
        <div className="admin-layout">
            <Container fluid className="p-0">
                <div className="d-flex">
                    <SideBar />
                    <main className="admin-content flex-grow-1">
                        {children}
                    </main>
                </div>
            </Container>
        </div>
    );
};

export default AdminLayout;
