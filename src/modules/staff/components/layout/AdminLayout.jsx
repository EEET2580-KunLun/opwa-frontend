import React from 'react';
import { Container } from 'react-bootstrap';
import SideBar from '../SideBar.jsx';
import './AdminStyles.css';
import {selectCurrentUser} from "../../../auth/store/authSlice.js";
import {useSelector} from "react-redux";

const AdminLayout = ({ children }) => {
    const user = useSelector(selectCurrentUser);
    return (
        <div className="admin-layout">
            <Container fluid className="p-0">
                <div className="d-flex">
                    <SideBar user={user} />
                    <main className="admin-content flex-grow-1">
                        {children}
                    </main>
                </div>
            </Container>
        </div>
    );
};

export default AdminLayout;
