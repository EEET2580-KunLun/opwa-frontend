import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { FaSubway, FaMap, FaChartBar, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const OperatorDashboard = () => {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div>
            <h2 className="mb-4">Operator Dashboard</h2>

            <Row>
                <Col md={6} lg={3} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                            <div className="text-center mb-3">
                                <FaSubway size={48} className="text-primary" />
                            </div>
                            <Card.Title className="text-center">Metro Lines</Card.Title>
                            <Card.Text className="text-muted">
                                Manage metro lines, schedules, and suspensions.
                            </Card.Text>
                            <Button
                                variant="primary"
                                className="mt-auto"
                                onClick={() => handleNavigate('/operator/lines')}
                            >
                                View Lines
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={3} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                            <div className="text-center mb-3">
                                <FaMap size={48} className="text-success" />
                            </div>
                            <Card.Title className="text-center">Metro Map</Card.Title>
                            <Card.Text className="text-muted">
                                View interactive map of metro lines and stations.
                            </Card.Text>
                            <Button
                                variant="success"
                                className="mt-auto"
                                onClick={() => handleNavigate('/operator/map')}
                            >
                                Open Map
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={3} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                            <div className="text-center mb-3">
                                <FaChartBar size={48} className="text-info" />
                            </div>
                            <Card.Title className="text-center">Statistics</Card.Title>
                            <Card.Text className="text-muted">
                                View passenger statistics and analytics.
                            </Card.Text>
                            <Button
                                variant="info"
                                className="mt-auto"
                                onClick={() => handleNavigate('/operator/statistics')}
                            >
                                View Stats
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={3} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                            <div className="text-center mb-3">
                                <FaUsers size={48} className="text-warning" />
                            </div>
                            <Card.Title className="text-center">My Profile</Card.Title>
                            <Card.Text className="text-muted">
                                View and update your operator profile.
                            </Card.Text>
                            <Button
                                variant="warning"
                                className="mt-auto"
                                onClick={() => handleNavigate('/operator/profile')}
                            >
                                View Profile
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default OperatorDashboard;