import React, { useState } from 'react';
import { Container, Row, Col, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { PeopleFill, FilterCircleFill, XCircleFill } from 'react-bootstrap-icons';
import SearchBar from '../../../shared/components/SearchBar.jsx';
import { useNavigate } from "react-router-dom";
import { useGetAllPassengersQuery } from "../store/pawaPassengerApiSlice.js";
import PassengerGridTable from './PassengerGridTable.jsx';

const PassengerManagement = () => {
    const navigate = useNavigate();
    
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    
    // Fetch passengers
    const { 
        data: passengers = [], 
        isLoading, 
        error,
        refetch
    } = useGetAllPassengersQuery();
    
    // Handle search
    const handleSearch = (term) => {
        setSearchTerm(term);
    };
    
    // Handle advanced filters
    const handleFilter = (filterData) => {
        setFilters(filterData);
    };
    
    // Clear filters
    const clearFilters = () => {
        setSearchTerm('');
        setFilters({});
    };

    // Filter passengers client-side
    const filteredPassengers = passengers.filter(passenger => {
        // Skip filtering if no search term or filters
        if (!searchTerm && Object.keys(filters).length === 0) return true;
        
        // Search by name or ID
        if (searchTerm) {
            const fullName = `${passenger.firstName || ''} ${passenger.middleName || ''} ${passenger.lastName || ''}`.toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            
            if (!fullName.includes(searchLower) && 
                !passenger.nationalID?.includes(searchLower) &&
                !passenger.id?.includes(searchLower) &&
                !passenger.phoneNumber?.includes(searchLower)) {
                return false;
            }
        }
        
        // Apply additional filters
        if (filters.isStudent && !passenger.isStudent) return false;
        if (filters.isDisability && !passenger.isDisability) return false;
        if (filters.isRevolutionaryContribution && !passenger.isRevolutionaryContribution) return false;
        
        return true;
    });

    return (
        <Container fluid className="p-0">
            <Row className="g-0">
                <Col md={12} className="bg-light-subtle">
                    <div className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="mb-0">Passenger Management</h2>
                            <Button
                                variant="purple"
                                className="d-flex align-items-center"
                                style={{backgroundColor: '#8e44ad', borderColor: '#8e44ad'}}
                                onClick={() => navigate('/admin/passenger/create')}>
                                <PeopleFill className="me-2"/>
                                Register New Passenger
                            </Button>
                        </div>

                        <SearchBar 
                            onSearch={handleSearch}
                            onFilter={handleFilter}
                            placeholder="Search by name, ID, or phone..." 
                            showFilterButton={true}
                        />
                        
                        {/* Filter indicator */}
                        {(searchTerm || Object.keys(filters).length > 0) && (
                            <Alert 
                                variant="info" 
                                className="d-flex justify-content-between align-items-center mb-3"
                            >
                                <div>
                                    <FilterCircleFill className="me-2" />
                                    {searchTerm && (
                                        <span>
                                            Searching for "{searchTerm}" - 
                                        </span>
                                    )}
                                    <span className="ms-1">
                                        Found {filteredPassengers.length} of {passengers.length} passengers
                                    </span>
                                </div>
                                <Button 
                                    variant="outline-secondary" 
                                    size="sm" 
                                    onClick={clearFilters}
                                >
                                    <XCircleFill className="me-1" />
                                    Clear Filters
                                </Button>
                            </Alert>
                        )}

                        {error ? (
                            <Alert variant="danger" className="my-3">
                                Error loading passenger data: {error.error || error.data?.message || 'Unknown error'}
                                <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    className="ms-3" 
                                    onClick={() => refetch()}
                                >
                                    Retry
                                </Button>
                            </Alert>
                        ) : isLoading ? (
                            <div className="text-center py-4">Loading passenger data...</div>
                        ) : filteredPassengers.length > 0 ? (
                            <PassengerGridTable 
                                passengerData={filteredPassengers}
                            />
                        ) : (
                            <div className="text-center py-4">
                                {searchTerm || Object.keys(filters).length > 0
                                    ? "No passengers match your search criteria" 
                                    : "No passenger data available"}
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default PassengerManagement;