import React, { useEffect, useState, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Pagination, Alert } from 'react-bootstrap';
import { PeopleFill, FilterCircleFill, XCircleFill } from 'react-bootstrap-icons';
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
        employed: true
    });
    
    // Client-side search state
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [clientFilters, setClientFilters] = useState({});
    
    const [activeTab, setActiveTab] = useState('active');
    
    // Fetch data using the query hook with current parameters
    const { 
        data: staffResponse, 
        isLoading, 
        isFetching,
        error,
        refetch
    } = useFetchAllStaffQuery(queryParams);
    
    // Extract pagination data from response
    const staffs = staffResponse?.data?.content || [];
    const totalElements = staffResponse?.data?.total_elements || 0;
    const totalPages = staffResponse?.data?.total_pages || 0;
    const currentPage = staffResponse?.data?.page || 0;
    const isLastPage = staffResponse?.data?.last || false;
    
    // Check if client-side search/filter is active
    const isSearchActive = clientSearchTerm.trim() !== '';
    const isFilterActive = Object.keys(clientFilters).length > 0;
    const isClientFilteringActive = isSearchActive || isFilterActive;

    // Client-side filtered staff data
    const filteredStaffs = useMemo(() => {
        if (!isClientFilteringActive) return staffs;
        
        return staffs.filter(staff => {
            // Filter by search term (name, email, username)
            if (isSearchActive) {
                const searchTerm = clientSearchTerm.toLowerCase();
                
                // Fast bailout if common fields match
                const email = (staff.email || '').toLowerCase();
                const username = (staff.username || '').toLowerCase();
                
                if (email.includes(searchTerm) || username.includes(searchTerm)) {
                    return isFilterActive ? checkAdvancedFilters(staff) : true;
                }
                
                // More expensive name concatenation and check
                const fullName = `${staff.first_name || ''} ${staff.middle_name || ''} ${staff.last_name || ''}`.toLowerCase();
                if (!fullName.includes(searchTerm)) {
                    return false;
                }
            }
            
            // If we're here and there are active filters, check them
            return isFilterActive ? checkAdvancedFilters(staff) : true;
        });
        
        // Helper function to check advanced filters
        function checkAdvancedFilters(staff) {
            for (const [key, value] of Object.entries(clientFilters)) {
                if (!value && value !== false) continue; // Skip empty filters
                
                switch (key) {
                    case 'role':
                        if (staff.role !== value) return false;
                        break;
                    case 'shift':
                        if (staff.shift !== value) return false;
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
                        {
                            const birthYear = new Date(staff.date_of_birth).getFullYear();
                            if (birthYear > parseInt(value)) return false;
                        }
                        break;
                    default:
                        break;
                }
            }
            return true;
        }
    }, [staffs, clientSearchTerm, clientFilters, isClientFilteringActive, isSearchActive, isFilterActive]);
        
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
    
    // Handle tab change (active/inactive) - clear client search when changing tabs
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setClientSearchTerm('');
        setClientFilters({});
        setQueryParams(prev => ({
            ...prev,
            employed: tab === 'active',
            page: 0 // Reset to first page
        }));
    };
    
    // Handle client-side search
    const handleSearch = (term) => {
        setClientSearchTerm(term);
    };
    
    // Handle advanced filters
    const handleFilter = (filters) => {
        setClientFilters(filters);
    };
    
    // Clear all client filters
    const clearClientFilters = () => {
        setClientSearchTerm('');
        setClientFilters({});
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
                            {/* <div>
                                <Button
                                    variant="link"
                                    className={`text-decoration-none px-0 pb-2 ${activeTab === 'inactive' ? 'text-primary fw-bold border-bottom border-primary border-3' : 'text-secondary'}`}
                                    onClick={() => handleTabChange('inactive')}
                                >
                                    Unemployed Staff <span
                                    className="badge bg-secondary ms-1">{inactiveStaffCount}</span>
                                </Button>
                            </div> */}
                        </div>
                        <SearchBar
                            onSearch={handleSearch}
                            onFilter={handleFilter}
                        />
                        
                        {/* Client filtering indicator */}
                        {isClientFilteringActive && (
                            <Alert 
                                variant="info" 
                                className="d-flex justify-content-between align-items-center mb-3"
                            >
                                <div>
                                    <FilterCircleFill className="me-2" />
                                    {isSearchActive && (
                                        <span>
                                            Searching for "{clientSearchTerm}" - 
                                        </span>
                                    )}
                                    <span className="ms-1">
                                        Found {filteredStaffs.length} of {staffs.length} staff members
                                    </span>
                                </div>
                                <Button 
                                    variant="outline-secondary" 
                                    size="sm" 
                                    onClick={clearClientFilters}
                                >
                                    <XCircleFill className="me-1" />
                                    Clear Filters
                                </Button>
                            </Alert>
                        )}

                        {error ? (
                            <Alert variant="danger" className="my-3">
                                Error loading staff data: {error.error || error.data?.message || 'Unknown error'}
                                <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    className="ms-3" 
                                    onClick={() => refetch()}
                                >
                                    Retry
                                </Button>
                            </Alert>
                        ) : loading ? (
                            <div className="text-center py-4">Loading staff data...</div>
                        ) : (isClientFilteringActive ? filteredStaffs : staffs).length > 0 ? (
                            <StaffGridTable 
                                staffData={isClientFilteringActive ? filteredStaffs : staffs}
                                currentSort={{
                                    field: queryParams.sortBy,
                                    direction: queryParams.direction
                                }}
                                onSort={handleSort}
                            />
                        ) : (
                            <div className="text-center py-4">
                                {isClientFilteringActive 
                                    ? "No staff members match your search criteria" 
                                    : "No staff data available"}
                            </div>
                        )}

                        {/* Only show pagination when not filtering client-side and we have pages */}
                        {!isClientFilteringActive && totalPages > 0 && (
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