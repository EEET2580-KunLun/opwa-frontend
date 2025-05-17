import {Button, Nav} from "react-bootstrap";
import {Link, useLocation} from "react-router-dom";
import React, {useState, useEffect} from "react";
import './layout/AdminStyles.css';
import {useSideBar} from "../hooks/useSideBar.js";
import {PLACEHOLDER_USER_IMAGE} from "../../../shared/constant.js";

const SideBar = ({user}) => {
    const {handleLogout} = useSideBar();
    const location = useLocation();
    const [activeLink, setActiveLink] = useState('');

    let current_user = user;

    useEffect(() => {
        // Set active link based on current location
        setActiveLink(location.pathname);
    }, [location]);

    return(
        <div className="sidebar-container bg-white d-flex flex-column justify-content-between border-end">
            <div className="p-3">
                <Nav className="flex-column sidebar-nav">
                    <Nav.Link
                        as={Link}
                        to="/admin/dashboard"
                        className={`sidebar-link ${activeLink === '/admin/dashboard' ? 'fw-bold' : ''}`}
                    >
                        Dashboard
                    </Nav.Link>
                    <Nav.Link
                        as={Link}
                        to="/admin/staff"
                        className={`sidebar-link ${activeLink === '/admin/staff' ? 'fw-bold' : ''}`}
                    >
                        Staff Management
                    </Nav.Link>
                    <Nav.Link
                        as={Link}
                        to="/admin/staff/create"
                        className={`sidebar-link ${activeLink === '/admin/staff/create' ? 'fw-bold' : ''}`}
                    >
                        Create Staff
                    </Nav.Link>
                     <Nav.Link
                        as={Link}
                        to="/admin/lines"
                        className={`sidebar-link ${activeLink.startsWith('/admin/lines') ? 'fw-bold' : ''}`}
                    >
                        Line Management
                    </Nav.Link>
                    <Nav.Link
                        as={Link}
                        to="/admin/stations"
                        className={`sidebar-link ${activeLink.startsWith('/admin/stations') ? 'fw-bold' : ''}`}
                    >
                        Station Management
                    </Nav.Link>
                </Nav>
            </div>
            <div className="admin-info-container p-3 border-top">
                <div className="d-flex align-items-center mb-2">
                    <div className="avatar-circle me-2">
                        <img
                            src={typeof current_user?.profile_picture === 'string' ? current_user.profile_picture : PLACEHOLDER_USER_IMAGE}
                            alt="User Avatar"
                            className="avatar-img"
                            onError={(e) => {
                                e.target.onerror = null; // Prevents looping
                                e.target.src = PLACEHOLDER_USER_IMAGE; // Fallback image
                            }}
                        />
                    </div>
                    <div>
                        <div className="fw-bold">{current_user?.username} ({current_user?.role})</div>
                    </div>
                </div>
                <Button
                    variant="light"
                    className="w-100 fw-semibold text-dark border rounded-pill"
                    onClick={handleLogout}
                >
                    Log out
                </Button>
            </div>
        </div>
    )
}

export default SideBar;