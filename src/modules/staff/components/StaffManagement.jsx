import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Pagination } from 'react-bootstrap';
import { PeopleFill } from 'react-bootstrap-icons';
import StaffGridTable from "./Staff Grid Table/StaffGridTable.jsx";
import SearchBar from "./Search Bar/SearchBar.jsx";
import { useStaffList } from "../hooks/useStaffList.js";
import { useSelector } from "react-redux";
import { selectStaffs } from "../store/staffSlice.js";
import { useNavigate } from "react-router-dom";
import { useFilterItems } from "../hooks/useFilterItems.js";

const StaffManagement = () => {
    const [activeTab, setActiveTab] = useState('active');
    const [advancedFilters, setAdvancedFilters] = useState({});
    const staffLists = useSelector(selectStaffs);
    const navigate = useNavigate();
    const { loading, fetchStaffList } = useStaffList();

    const {
        currentItems,
        currentPage,
        totalPages,
        setSearchTerm,
        setCurrentPage,
        handlePageChange
    } = useFilterItems({
        items: staffLists,
        itemsPerPage: 10,
        filterFn: (staff) => {
            // Base filter for active/inactive tab
            const statusMatch = activeTab === 'active' ? staff.status !== 'INACTIVE' : staff.status === 'INACTIVE';
            if (!statusMatch) return false;

            // Advanced filters check
            for (const [key, value] of Object.entries(advancedFilters)) {
                if (!value && value !== false) continue; // Skip empty filters

                switch (key) {
                    case 'role':
                        if (staff.role !== value) return false;
                        break;
                    case 'shift':
                        if (staff.shift !== value) return false;
                        break;
                    case 'employed':
                        if (staff.employed !== value) return false;
                        break;
                    case 'city':
                        if (!staff.residence_address_entity?.city?.toLowerCase().includes(value.toLowerCase()))
                            return false;
                        break;
                    case 'district':
                        if (!staff.residence_address_entity?.district?.toLowerCase().includes(value.toLowerCase()))
                            return false;
                        break;
                    case 'birthYearBefore':
                        { const birthYear = new Date(staff.date_of_birth).getFullYear();
                        if (birthYear > parseInt(value)) return false;
                        break; }
                    default:
                        break;
                }
            }
            return true;
        },
        searchFn: (staff, term) => {
            if (term.trim() === '') return true;
            const fullName = `${staff.first_name} ${staff.middle_name ? `${staff.middle_name} ` : ''}${staff.last_name}`;
            return fullName.toLowerCase().includes(term.toLowerCase()) ||
                staff.email?.toLowerCase().includes(term.toLowerCase()) ||
                staff.username?.toLowerCase().includes(term.toLowerCase());
        }
    });

    useEffect(() => {
        fetchStaffList();
    }, []);

    return (
        <Container fluid className="p-0">
            <Row className="g-0">
                <Col md={10} className="bg-light-subtle">
                    <div className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="mb-0">Staff Account Management</h2>
                            <Button
                                variant="purple"
                                className="d-flex align-items-center"
                                style={{backgroundColor: '#8e44ad', borderColor: '#8e44ad'}}
                                onClick={() => navigate('/admin/staff/create')}>
                                <PeopleFill className="me-2"/>
                                Register new staff
                            </Button>
                        </div>

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

                        <SearchBar
                            onSearch={setSearchTerm}
                            onFilter={setAdvancedFilters}
                        />

                        {loading ? (
                            <div className="text-center py-4">Loading staff data...</div>
                        ) : currentItems && currentItems.length > 0 ? (
                            <StaffGridTable staffData={currentItems}/>
                        ) : (
                            <div className="text-center py-4">No staff data available</div>
                        )}

                        <div className="pagination-controls d-flex justify-content-center mt-4">
                            <Pagination>
                                <Pagination.Prev
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                />

                                {Array.from({ length: totalPages }, (_, index) => (
                                    <Pagination.Item
                                        key={index + 1}
                                        active={index + 1 === currentPage}
                                        onClick={() => handlePageChange(index + 1)}
                                    >
                                        {index + 1}
                                    </Pagination.Item>
                                ))}

                                <Pagination.Next
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                />
                            </Pagination>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffManagement;