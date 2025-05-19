import React, { useState, useEffect } from "react";
import { Button, Nav, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import './layout/AdminStyles.css';
import { useSideBar } from "../hooks/useSideBar.js";
import { PLACEHOLDER_USER_IMAGE} from "../../../shared/constant.js";
import {
    Speedometer2, PeopleFill, Signpost2Fill, Building, PersonFill,
    TicketPerforated, GraphUpArrow, CreditCard, ClockHistory,
    ChevronLeft, ChevronRight, BoxArrowRight
} from "react-bootstrap-icons";
import subwayLogo from "../../../shared/image/subway.png";

const SideBar = ({ user }) => {
    const { handleLogout } = useSideBar();
    const location = useLocation();
    const [activeLink, setActiveLink] = useState('');
    // Get initial sidebar state from localStorage or default to open
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const role = user?.role || '';

    // Update activeLink when location changes
    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location]);

    // Save sidebar state to localStorage
    useEffect(() => {
        localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
        // Add or remove collapsed class to body when sidebar state changes
        document.body.classList.toggle('sidebar-collapsed', !sidebarOpen);
    }, [sidebarOpen]);

    // Create a reusable NavItem component to reduce repetition
    const NavItem = ({ to, icon, label, exact = false, state = null }) => {
        const isActive = exact
            ? activeLink === to
            : activeLink.startsWith(to);

        const Icon = icon;

        const link = (
            <Nav.Link
                as={Link}
                to={to}
                state={state}
                className={`sidebar-link d-flex align-items-center ${isActive ? 'active-link' : ''}`}
            >
                <Icon className="nav-icon" size={18} />
                <span className={`nav-label ${!sidebarOpen ? 'd-none' : ''}`}>{label}</span>
            </Nav.Link>
        );

        return sidebarOpen ? link : (
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id={`tooltip-${to}`}>{label}</Tooltip>}
            >
                {link}
            </OverlayTrigger>
        );
    };

    // Section header component
    const SectionHeader = ({ title }) => (
        sidebarOpen && (
            <div className="sidebar-section-header text-muted px-3 py-2 mt-3 mb-1 small text-uppercase fw-bold">
                {title}
            </div>
        )
    );

    // Navigation menus by role
    const renderAdminLinks = () => (
        <>
            <SectionHeader title="Main" />
            <NavItem to="/admin/dashboard" icon={Speedometer2} label="Dashboard" exact />

            <SectionHeader title="Management" />
            <NavItem to="/admin/staff" icon={PeopleFill} label="Staff Management" exact />
            <NavItem to="/admin/lines" icon={Signpost2Fill} label="Line Management" />
            <NavItem to="/admin/stations" icon={Building} label="Station Management" />
            <NavItem to="/admin/passenger" icon={PersonFill} label="Passenger Management" />
            <NavItem to="/admin/tickets" icon={TicketPerforated} label="Ticket Management" />

            <SectionHeader title="Analytics" />
            <NavItem to="/admin/statistics" icon={GraphUpArrow} label="Statistics & Analytics" />
        </>
    );

    const renderOperatorLinks = () => (
        <>
            <SectionHeader title="Main" />
            <NavItem to="/operator/dashboard" icon={Speedometer2} label="Dashboard" exact />

            <SectionHeader title="Management" />
            <NavItem to="/operator/lines" icon={Signpost2Fill} label="Line Management" exact />
            <NavItem to="/operator/stations" icon={Building} label="Station Management" exact />
        </>
    );

    const renderTicketAgentLinks = () => (
        <>
            <SectionHeader title="Main" />
            <NavItem to="/ticket-agent/dashboard" icon={Speedometer2} label="Dashboard" exact />

            <SectionHeader title="Tickets" />
            <NavItem to="/ticket-agent/tickets" icon={CreditCard} label="Ticket Sales" exact />
            <NavItem to="/ticket-agent/tickets/history" icon={ClockHistory} label="Ticket History" exact />
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

    // Get role badge color
    const getRoleBadgeColor = () => {
        switch(role) {
            case 'ADMIN':
            case 'MASTER_ADMIN':
                return 'bg-danger';
            case 'OPERATOR':
                return 'bg-primary';
            case 'TICKET_AGENT':
                return 'bg-success';
            default:
                return 'bg-secondary';
        }
    };

    // Get appropriate profile URL based on role
    const getProfileUrl = () => {
        if (role === 'ADMIN' || role === 'MASTER_ADMIN') {
            return '/admin/profile';
        } else if (role === 'OPERATOR') {
            return '/operator/profile';
        } else if (role === 'TICKET_AGENT') {
            return '/ticket-agent/profile';
        }
        return '/';
    };

    return (
        <div className={`sidebar-container bg-white d-flex flex-column justify-content-between border-end ${!sidebarOpen ? 'collapsed' : ''}`}>
            <div>
                {/* Logo and brand section */}
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                    {sidebarOpen && (
                        <div className="d-flex align-items-center">
                            <img src={subwayLogo} alt="Metro App" height="50" className="me-2" />
                            <h5 className="mb-0 fw-bold text-primary">HCMc Metro</h5>
                        </div>
                    )}
                    <Button
                        variant="light"
                        className="sidebar-toggle rounded-circle p-1 border-0 shadow-sm"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        {sidebarOpen ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}
                    </Button>
                </div>

                {/* Navigation section */}
                <div className="p-2 sidebar-nav-container">
                    <Nav className="flex-column sidebar-nav">
                        {renderNavigation()}
                    </Nav>
                </div>
            </div>

            {/* User profile section */}
            <div className={`user-profile p-3 border-top ${!sidebarOpen ? 'text-center' : ''}`}>
                <div className={`d-flex ${sidebarOpen ? 'align-items-center' : 'justify-content-center flex-column'} mb-2`}>
                    <Link
                        to={getProfileUrl()}
                        state={{ initialData: user, isEditMode: true, editorRole: user?.role }}
                        className="avatar-circle position-relative"
                        style={{ cursor: 'pointer' }}
                    >
                        <img
                            src={typeof user?.profile_picture === 'string' ? user.profile_picture : PLACEHOLDER_USER_IMAGE}
                            alt="User Avatar"
                            className="avatar-img"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = PLACEHOLDER_USER_IMAGE;
                            }}
                        />
                        <span className={`position-absolute bottom-0 end-0 p-1 badge rounded-pill ${getRoleBadgeColor()}`}
                              style={{transform: 'translate(20%, 20%)', width: '12px', height: '12px'}}></span>
                    </Link>

                    {sidebarOpen && (
                        <div className="ms-2 flex-grow-1">
                            <div className="fw-bold text-truncate" style={{maxWidth: '150px'}}>
                                {user?.username}
                            </div>
                            <div className={`badge ${getRoleBadgeColor()} text-white`}>
                                {user?.role}
                            </div>
                        </div>
                    )}
                </div>

                {/* Logout button */}
                <Button
                    variant="outline-danger"
                    size="sm"
                    className={`${sidebarOpen ? 'w-100' : ''} d-flex align-items-center justify-content-center rounded-pill`}
                    onClick={handleLogout}
                >
                    <BoxArrowRight className="me-1" />
                    {sidebarOpen ? 'Log out' : ''}
                </Button>
            </div>
        </div>
    );
};

export default SideBar;