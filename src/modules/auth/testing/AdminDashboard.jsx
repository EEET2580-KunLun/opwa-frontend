import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {Card, Button, Row, Col, InputGroup, Modal, Form} from 'react-bootstrap';
import {FaUsers, FaSubway, FaTicketAlt, FaChartBar, FaCog, FaCopy, FaEnvelope} from 'react-icons/fa';
import {useInviteStaffMutation} from "../../staff/store/staffApiSlice.js";
import {selectCurrentUser} from "../store/authSlice.js";
import {useSelector} from "react-redux";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [inviteStaff] = useInviteStaffMutation();
    const [showModal, setShowModal] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const user = useSelector(selectCurrentUser)

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleInvite = async () => {
        try {
            const response = await inviteStaff().unwrap();
            // Assuming the API returns a token in the response
            const token = response.data?.invite_token;
            const link = `${window.location.origin}/invite/register/${token}`;
            setInviteLink(link);
            setShowModal(true);
        } catch (error) {
            console.error('Failed to generate invite link:', error);
            // You might want to add error handling here (toast notification, etc.)
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink)
            .then(() => {
                // Optional: show a copied notification
                console.log('Link copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy link:', err);
            });
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div>
            <h2 className="mb-4">Admin Dashboard</h2>

            <Row>
                <Col md={6} lg={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                            <div className="text-center mb-3">
                                <FaUsers size={48} className="text-primary" />
                            </div>
                            <Card.Title className="text-center">Staff Management</Card.Title>
                            <Card.Text className="text-muted">
                                Manage staff accounts, roles, and permissions.
                            </Card.Text>
                            <div className="mt-auto">
                                <Button
                                    variant="primary"
                                    className="w-100 mb-2"
                                    onClick={() => handleNavigate('/admin/staff')}
                                >
                                    View Staff
                                </Button>
                                <Button
                                    variant="outline-primary"
                                    className="w-100"
                                    onClick={() => handleNavigate('/admin/staff/create')}
                                >
                                    Add New Staff
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                            <div className="text-center mb-3">
                                <FaSubway size={48} className="text-success" />
                            </div>
                            <Card.Title className="text-center">Metro Line Management</Card.Title>
                            <Card.Text className="text-muted">
                                Manage metro lines, stations, schedules, and service disruptions.
                            </Card.Text>
                            <div className="mt-auto">
                                <Row className="mb-2">
                                    <Col xs={6} className="pe-1">
                                        <Button
                                            variant="success"
                                            className="w-100"
                                            onClick={() => handleNavigate('/admin/lines')}
                                        >
                                            View Lines
                                        </Button>
                                    </Col>
                                    <Col xs={6} className="ps-1">
                                        <Button
                                            variant="success"
                                            className="w-100"
                                            onClick={() => handleNavigate('/admin/stations')}
                                        >
                                            View Stations
                                        </Button>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6} className="pe-1">
                                        <Button
                                            variant="outline-success"
                                            className="w-100"
                                            onClick={() => handleNavigate('/admin/lines/create')}
                                        >
                                            Add Line
                                        </Button>
                                    </Col>
                                    <Col xs={6} className="ps-1">
                                        <Button
                                            variant="outline-success"
                                            className="w-100"
                                            onClick={() => handleNavigate('/admin/stations/create')}
                                        >
                                            Add Station
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                            <div className="text-center mb-3">
                                <FaTicketAlt size={48} className="text-warning" />
                            </div>
                            <Card.Title className="text-center">Ticket Management</Card.Title>
                            <Card.Text className="text-muted">
                                Manage ticket types, pricing, and validation.
                            </Card.Text>
                            <Button
                                variant="warning"
                                className="mt-auto"
                                onClick={() => handleNavigate('/admin/tickets')}
                            >
                                Manage Tickets
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                            <div className="text-center mb-3">
                                <FaChartBar size={48} className="text-info" />
                            </div>
                            <Card.Title className="text-center">Statistics & Reports</Card.Title>
                            <Card.Text className="text-muted">
                                View tickets & users analytics data.
                            </Card.Text>
                            <Button
                                variant="info"
                                className="mt-auto"
                                onClick={() => handleNavigate('/admin/statistics')}
                            >
                                View Reports
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {user?.role === 'MASTER_ADMIN' && (
                    <Col md={6} lg={4} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="d-flex flex-column">
                                <div className="text-center mb-3">
                                    <FaEnvelope size={48} className="text-secondary" />
                                </div>
                                <Card.Title className="text-center">Invite Staff</Card.Title>
                                <Card.Text className="text-muted">
                                    Invite new staffs with link.
                                </Card.Text>
                                <Button
                                    variant={"secondary"}
                                    className="mt-auto"
                                    onClick={() => handleInvite()}
                                >
                                    Invite
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                )}

                {/* Invite Modal */}
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Staff Invitation Link</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Share this link with the staff member you want to invite:</p>
                        <InputGroup className="mb-3">
                            <Form.Control
                                value={inviteLink}
                                readOnly
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={handleCopyLink}
                            >
                                <FaCopy /> Copy
                            </Button>
                        </InputGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
                {/*
{/* 
                <Col md={6} lg={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                            <div className="text-center mb-3">
                                <FaCog size={48} className="text-secondary" />
                            </div>
                            <Card.Title className="text-center">System Settings</Card.Title>
                            <Card.Text className="text-muted">
                                Configure system parameters and integration settings.
                            </Card.Text>
                            <Button
                                variant="secondary"
                                className="mt-auto"
                                onClick={() => handleNavigate('/admin/settings')}
                            >
                                Manage Settings
                            </Button>
                        </Card.Body>
                    </Card>
                </Col> */}
            </Row>
        </div>
    );
};

export default AdminDashboard;