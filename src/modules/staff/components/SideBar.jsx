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
    const role = user?.role || '';

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location]);

    // Renders admin navigation links
    const renderAdminLinks = () => (
        <>
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
            <Nav.Link
                as={Link}
                to="/admin/passenger"
                className={`sidebar-link ${activeLink.startsWith('/admin/passenger') ? 'fw-bold' : ''}`}
            >
                Passenger Management
            </Nav.Link>
            <Nav.Link
                as={Link}
                to="/admin/tickets"
                className={`sidebar-link ${activeLink.startsWith('/admin/tickets') ? 'fw-bold' : ''}`}
            >
                Ticket Management
            </Nav.Link>
            <Nav.Link
                as={Link}
                to="/admin/statistics"
                className={`sidebar-link ${activeLink.startsWith('/admin/statistics') ? 'fw-bold' : ''}`}
            >
                Statistics & Analytics
            </Nav.Link>
        </>
    );

// Renders operator navigation links
    const renderOperatorLinks = () => (
        <>
            <Nav.Link
                as={Link}
                to="/operator/dashboard"
                className={`sidebar-link ${activeLink === '/operator/dashboard' ? 'fw-bold' : ''}`}
            >
                Dashboard
            </Nav.Link>

            <Nav.Link
                as={Link}
                to="/operator/lines"
                className={`sidebar-link ${activeLink === '/operator/lines' ? 'fw-bold' : ''}`}
            >
                Line Management
            </Nav.Link>

            <Nav.Link
                as={Link}
                to="/operator/stations"
                className={`sidebar-link ${activeLink === '/operator/stations' ? 'fw-bold' : ''}`}
            >
                Station Management
            </Nav.Link>
            <Nav.Link
                as={Link}
                to="/operator/profile"
                state={{initialData: user, isEditMode: true, editorRole: user.role }}
                className={`sidebar-link ${activeLink === '/operator/profile' ? 'fw-bold' : ''}`}
            >
                My Profile
            </Nav.Link>
        </>
    );

    // Renders ticket agent navigation links
    const renderTicketAgentLinks = () => (
        <>
            <Nav.Link
                as={Link}
                to="/ticket-agent/dashboard"
                className={`sidebar-link ${activeLink === '/ticket-agent/dashboard' ? 'fw-bold' : ''}`}
            >
                Dashboard
            </Nav.Link>
            <Nav.Link
                as={Link}
                to="/ticket-agent/tickets"
                className={`sidebar-link ${activeLink === '/ticket-agent/tickets' ? 'fw-bold' : ''}`}
            >
                Ticket Sales
            </Nav.Link>
            <Nav.Link
                as={Link}
                to="/ticket-agent/tickets/history"
                className={`sidebar-link ${activeLink === '/ticket-agent/tickets/history' ? 'fw-bold' : ''}`}
            >
                Ticket History
            </Nav.Link>
            <Nav.Link
                as={Link}
                to="/ticket-agent/profile"
                state={{initialData: user, isEditMode: true, editorRole: user.role }}
                className={`sidebar-link ${activeLink === '/ticket-agent/profile' ? 'fw-bold' : ''}`}
            >
                My Profile
            </Nav.Link>
        </>
    );

    // Render navigation based on user role
    const renderNavigation = () => {
        if (role === 'ADMIN' || role === 'MASTER_ADMIN') {
            return renderAdminLinks();
        } else if (role === 'OPERATOR') {
            return renderOperatorLinks();
        } else if (role === 'TICKET_AGENT') {
            return renderTicketAgentLinks();
        }
        return null;
    };

    return(
        <div className="sidebar-container bg-white d-flex flex-column justify-content-between border-end">
            <div className="p-3">
                <Nav className="flex-column sidebar-nav">
                    {renderNavigation()}
                </Nav>
            </div>
            <div className="admin-info-container p-3 border-top">
                <div className="d-flex align-items-center mb-2">
                    <div className="avatar-circle me-2">
                        <img
                            src={typeof user?.profile_picture === 'string' ? user.profile_picture : PLACEHOLDER_USER_IMAGE}
                            alt="User Avatar"
                            className="avatar-img"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = PLACEHOLDER_USER_IMAGE;
                            }}
                        />
                    </div>
                    <div>
                        <div className="fw-bold">
                            <div className="text-truncate" style={{maxWidth: '120px'}}>{user?.username}</div>
                            <div>({user?.role})</div>
                        </div>
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
    );
};

export default SideBar;