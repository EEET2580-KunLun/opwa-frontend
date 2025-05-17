import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Pagination } from 'react-bootstrap';
import { PeopleFill } from 'react-bootstrap-icons';
import StaffGridTable from "./Staff Grid Table/StaffGridTable.jsx";
import SearchBar from "./Search Bar/SearchBar.jsx";
import { useDispatch } from "react-redux";
import { setStaff } from "../store/staffSlice.js";
import { useNavigate } from "react-router-dom";
import { useFetchAllStaffQuery } from "../store/staffApiSlice.js";

const StaffManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Server side pagination and sorting state
    const [queryParams, setQueryParams] = useState({
        page: 0,
        size: 10,
        sortBy: 'firstName',
        direction: 'ASC',
        employed: true,
        searchTerm: ''
    });
    
    const [activeTab, setActiveTab] = useState('active');
    
    // Fetch data using the query hook with current parameters
    const { 
        data: staffResponse, 
        isLoading, 
        isFetching,
        refetch
    } = useFetchAllStaffQuery(queryParams);
    
    // Extract pagination data from response
    const staffs = staffResponse?.data?.content || [];
    const totalElements = staffResponse?.data?.total_elements || 0;
    const totalPages = staffResponse?.data?.total_pages || 0;
    const currentPage = staffResponse?.data?.page || 0;
    const isLastPage = staffResponse?.data?.last || false;
    
    // Active and inactive counts - we should get this from a separate API call ideally
    // For now, we'll just use the total_elements when the employed filter is applied
    const activeStaffCount = queryParams.employed === true ? totalElements : 0;
    const inactiveStaffCount = queryParams.employed === false ? totalElements : 0;
    
    // Update staff in Redux store
    useEffect(() => {
        if (staffResponse?.data?.content) {
            dispatch(setStaff(staffResponse.data.content));
        }
    }, [staffResponse, dispatch]);
    
    // Handle tab change (active/inactive)
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setQueryParams(prev => ({
            ...prev,
            employed: tab === 'active',
            page: 0 // Reset to first page
        }));
    };
    
    // Handle search
    const handleSearch = (term) => {
        setQueryParams(prev => ({
            ...prev,
            searchTerm: term,
            page: 0 // Reset to first page
        }));
    };
    
    // Handle advanced filters
    const handleFilter = (filters) => {
       console.log("Advanced filters:", filters);
    };
    
    // Handle sorting
    const handleSort = (field, direction) => {
        setQueryParams(prev => ({
            ...prev,
            sortBy: field,
            direction: direction
        }));
    };
    
    // Handle page change
    const handlePageChange = (pageNumber) => {
        // Convert from 1-based (UI) to 0-based (API)
        setQueryParams(prev => ({
            ...prev,
            page: pageNumber - 1
        }));
    };
    
    // Loading state
    const loading = isLoading || isFetching;

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
                                    onClick={() => handleTabChange('active')}
                                >
                                    Employed Staff <span className="badge bg-primary ms-1">{activeStaffCount}</span>
                                </Button>
                            </div>
                            <div>
                                <Button
                                    variant="link"
                                    className={`text-decoration-none px-0 pb-2 ${activeTab === 'inactive' ? 'text-primary fw-bold border-bottom border-primary border-3' : 'text-secondary'}`}
                                    onClick={() => handleTabChange('inactive')}
                                >
                                    Unemployed Staff <span
                                    className="badge bg-secondary ms-1">{inactiveStaffCount}</span>
                                </Button>
                            </div>
                        </div>
                        <SearchBar
                            onSearch={handleSearch}
                            onFilter={handleFilter}
                        />

                        {loading ? (
                            <div className="text-center py-4">Loading staff data...</div>
                        ) : staffs.length > 0 ? (
                            <StaffGridTable 
                                staffData={staffs}
                                currentSort={{
                                    field: queryParams.sortBy,
                                    direction: queryParams.direction
                                }}
                                onSort={handleSort}
                            />
                        ) : (
                            <div className="text-center py-4">No staff data available</div>
                        )}

                        {totalPages > 0 && (
                            <div className="pagination-controls d-flex justify-content-between align-items-center mt-4">
                                <div>
                                    Showing {staffs.length} of {totalElements} staff members
                                </div>
                                <Pagination>
                                    <Pagination.Prev
                                        onClick={() => handlePageChange(currentPage)}
                                        disabled={currentPage === 0}
                                    />

                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <Pagination.Item
                                            key={index + 1}
                                            active={index === currentPage}
                                            onClick={() => handlePageChange(index + 1)}
                                        >
                                            {index + 1}
                                        </Pagination.Item>
                                    ))}

                                    <Pagination.Next
                                        onClick={() => handlePageChange(currentPage + 2)}
                                        disabled={isLastPage}
                                    />
                                </Pagination>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffManagement;