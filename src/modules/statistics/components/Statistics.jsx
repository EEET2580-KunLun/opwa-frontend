import React, { useState } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { Box } from '@mui/material';
import TicketAnalytics from './TicketAnalytics';
import UserAnalytics from './UserAnalytics';
import { FaTicketAlt, FaUsers } from 'react-icons/fa';

const Statistics = () => {
    const [activeTab, setActiveTab] = useState('tickets');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <Container fluid className="p-0">
            <Row className="g-0">
                <Col className="bg-light-subtle">
                    <div className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="mb-0">Statistics & Analytics</h2>
                        </div>

                        <div className="border-bottom mb-4 d-flex">
                            <div className="me-4">
                                <Button
                                    variant="link"
                                    className={`text-decoration-none px-0 pb-2 d-flex align-items-center ${activeTab === 'tickets' ? 'text-primary fw-bold border-bottom border-primary border-3' : 'text-secondary'}`}
                                    onClick={() => handleTabChange('tickets')}
                                >
                                    <FaTicketAlt className="me-2" />
                                    Ticket Analytics
                                </Button>
                            </div>
                            <div>
                                <Button
                                    variant="link"
                                    className={`text-decoration-none px-0 pb-2 d-flex align-items-center ${activeTab === 'users' ? 'text-primary fw-bold border-bottom border-primary border-3' : 'text-secondary'}`}
                                    onClick={() => handleTabChange('users')}
                                >
                                    <FaUsers className="me-2" />
                                    User Analytics
                                </Button>
                            </div>
                        </div>

                        {/* Content area */}
                        <Box className="bg-white rounded shadow-sm">
                            {activeTab === 'tickets' ? (
                                <TicketAnalytics />
                            ) : (
                                <UserAnalytics />
                            )}
                        </Box>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Statistics;