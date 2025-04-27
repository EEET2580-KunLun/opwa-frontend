import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { PeopleFill } from 'react-bootstrap-icons';
import SideBar from "./SideBar.jsx";
import StaffGridTable from "./StaffGridTable.jsx";
import SearchBar from "./SearchBar.jsx";
import { useStaffList } from "../hooks/useStaffList.js";

const StaffManagement = () => {
    const [activeTab, setActiveTab] = useState('active');

    // Use the hook
    const { staff, loading, fetchStaffList } = useStaffList();

    // Fetch staff data when component mounts
    useEffect(() => {
        fetchStaffList().then(r => console.log(r));
    }, []);

    return (
        <Container fluid className="p-0">
            <Row className="g-0">
                <SideBar/>
                {/* Main content */}
                <Col md={10} className="bg-light-subtle">
                    <div className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="mb-0">Staff Account Management</h2>
                            <Button variant="purple" className="d-flex align-items-center" style={{ backgroundColor: '#8e44ad', borderColor: '#8e44ad' }}>
                                <PeopleFill className="me-2" />
                                Register new staff
                            </Button>
                        </div>

                        {/* Tabs */}
                        <div className="border-bottom mb-3 d-flex">
                            <div className="me-3">
                                <Button
                                    variant="link"
                                    className={`text-decoration-none px-0 pb-2 ${activeTab === 'active' ? 'text-primary fw-bold border-bottom border-primary border-3' : 'text-secondary'}`}
                                    onClick={() => setActiveTab('active')}
                                >
                                    Active staff
                                </Button>
                            </div>
                            <div>
                                <Button
                                    variant="link"
                                    className={`text-decoration-none px-0 pb-2 ${activeTab === 'inactive' ? 'text-primary fw-bold border-bottom border-primary border-3' : 'text-secondary'}`}
                                    onClick={() => setActiveTab('inactive')}
                                >
                                    Inactive staff
                                </Button>
                            </div>
                        </div>
                        <SearchBar/>

                        {loading ? (
                            <div className="text-center py-4">Loading staff data...</div>
                        ) : staff ? (
                            <StaffGridTable staffData={staff} />
                        ) : (
                            <div className="text-center py-4">No staff data available</div>
                        )}

                        {/* Pagination */}
                        <div className="d-flex justify-content-end mt-3">
                            <Button variant="link" className="text-primary">see more...</Button>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffManagement;