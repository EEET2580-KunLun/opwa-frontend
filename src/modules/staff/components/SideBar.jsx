import {Button, Nav} from "react-bootstrap";
import {Person} from "react-bootstrap-icons";
import React from "react";
import './layout/AdminStyles.css';
import {useSideBar} from "../hooks/useSideBar.js";


const SideBar = ({user}) => {
    const {handleLogout} = useSideBar()
    return(
        // className="bg-light min-vh-100 border-end"
        <div className="sidebar-container bg-white d-flex flex-column justify-content-between border-end">
            <div className="p-3">
                <Nav className="flex-column sidebar-nav">
                    <Nav.Link className="sidebar-link fw-bold">Staff Management</Nav.Link>
                    <Nav.Link className="sidebar-link">Metro Lines Management</Nav.Link>
                    <Nav.Link className="sidebar-link fw-bold">View staff</Nav.Link>
                    <Nav.Link className="sidebar-link">Dashboard</Nav.Link>
                </Nav>
            </div>
            {/*className="position-absolute bottom-0 start-0 w-100 border-top p-3"*/}
            <div className="admin-info-container p-3 border-top">
                <div className="d-flex align-items-center mb-2">
                    <div className="avatar-circle me-2">
                        <Person color="white" size={24} />
                    </div>
                    <div>
                        <div className="fw-bold">{user?.username} ({user?.role})</div>
                    </div>
                </div>
                <Button
                    variant="light"
                    className="w-100 fw-semibold text-dark border rounded-pill"
                    onClick={handleLogout} // Dispatch logout action
                >
                    Log out
                </Button>
            </div>
        </div>
    )
}

export default SideBar;