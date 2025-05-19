import React, { useState } from 'react';
import { Container, Row, Col, Alert, Form, Pagination } from 'react-bootstrap';
import { FilterCircleFill, XCircleFill } from 'react-bootstrap-icons';
import SearchBar from '../../../shared/components/SearchBar.jsx';
import { useNavigate } from "react-router-dom";
import { useGetAllPassengersQuery } from '../../passenger/store/pawaPassengerApiSlice.js';
import PassengerGridTableForTicketAgent from './PassengerGridTableForTicketAgent.jsx';

const PassengerListForTicketAgent = () => {
    const navigate = useNavigate();

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Status/type filters
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');

    // Fetch passengers
    const {
        data: passengers = [],
        isLoading,
        error,
        refetch
    } = useGetAllPassengersQuery();

    const handleSearch = (term) => {
        setSearchTerm(term);
        setPage(0);
    };

    const handleFilter = (filterData) => {
        setFilters(filterData);
        setPage(0);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({});
        setStatusFilter('ALL');
        setTypeFilter('ALL');
        setPage(0);
    };

    // Client-side filtering
    const filteredPassengers = passengers.filter(passenger => {
        if (!searchTerm && Object.keys(filters).length === 0 &&
            statusFilter === 'ALL' && typeFilter === 'ALL') {
            return true;
        }

        if (searchTerm) {
            const fullName = `${passenger.firstName || ''} ${passenger.middleName || ''} ${passenger.lastName || ''}`.toLowerCase();
            const s = searchTerm.toLowerCase();
            if (!fullName.includes(s) &&
                !passenger.nationalID?.includes(s) &&
                !passenger.id?.includes(s) &&
                !passenger.phoneNumber?.includes(s)) {
                return false;
            }
        }

        if (filters.isStudent && !passenger.isStudent) return false;
        if (filters.isDisability && !passenger.isDisability) return false;
        if (filters.isRevolutionaryContribution && !passenger.isRevolutionaryContribution) return false;

        if (statusFilter === 'DISABILITY' && !passenger.isDisability) return false;
        if (statusFilter === 'REVOLUTIONARY' && !passenger.isRevolutionaryContribution) return false;
        if (statusFilter === 'NORMAL' && (passenger.isDisability || passenger.isRevolutionaryContribution)) return false;

        if (typeFilter === 'STUDENT' && !passenger.isStudent) return false;
        if (typeFilter === 'PASSENGER' && passenger.isStudent) return false;

        return true;
    });

    // Pagination
    const paginatedPassengers = filteredPassengers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );
    const totalPages = Math.ceil(filteredPassengers.length / rowsPerPage);
    const paginationItems = [];
    for (let i = 0; i < totalPages; i++) {
        paginationItems.push(
            <Pagination.Item
                key={i}
                active={i === page}
                onClick={() => setPage(i)}
            >
                {i + 1}
            </Pagination.Item>
        );
    }

    return (
        <Container fluid className="p-0">
            <Row className="g-0">
                <Col md={12} className="bg-light-subtle">
                    <div className="p-4">
                        <div className="mb-4">
                            <h2 className="mb-0">Select Passenger</h2>
                        </div>

                        <Row className="mb-3">
                            <Col md={6}>
                                <SearchBar
                                    onSearch={handleSearch}
                                    onFilter={handleFilter}
                                    placeholder="Search by name, ID, or phone..."
                                    showFilterButton
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Select
                                    value={statusFilter}
                                    onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="DISABILITY">Disability</option>
                                    <option value="REVOLUTIONARY">Revolutionary</option>
                                </Form.Select>
                            </Col>
                            <Col md={3}>
                                <Form.Select
                                    value={typeFilter}
                                    onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
                                >
                                    <option value="ALL">All Types</option>
                                    <option value="PASSENGER">Passenger</option>
                                    <option value="STUDENT">Student</option>
                                </Form.Select>
                            </Col>
                        </Row>

                        {(searchTerm || Object.keys(filters).length > 0 ||
                            statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
                            <Alert variant="info" className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <FilterCircleFill className="me-2" />
                                    {searchTerm && <span>Searching for "{searchTerm}" – </span>}
                                    <span>Found {filteredPassengers.length} of {passengers.length}</span>
                                </div>
                                <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                                    <XCircleFill className="me-1" />
                                    Clear Filters
                                </Button>
                            </Alert>
                        )}

                        {error ? (
                            <Alert variant="danger" className="my-3">
                                Error loading passenger data: {error.error || error.data?.message || 'Unknown error'}
                                <Button variant="outline-primary" size="sm" className="ms-3" onClick={refetch}>
                                    Retry
                                </Button>
                            </Alert>
                        ) : isLoading ? (
                            <div className="text-center py-4">Loading passenger data...</div>
                        ) : filteredPassengers.length > 0 ? (
                            <>
                                <PassengerGridTableForTicketAgent passengerData={paginatedPassengers} />

                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                        Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filteredPassengers.length)} of {filteredPassengers.length}
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <Form.Select
                                            style={{ width: 'auto' }}
                                            className="me-3"
                                            value={rowsPerPage}
                                            onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
                                        >
                                            {[5, 10, 25, 50].map(v => <option key={v} value={v}>{v} per page</option>)}
                                        </Form.Select>
                                        <Pagination className="mb-0">
                                            <Pagination.First onClick={() => setPage(0)} disabled={page === 0} />
                                            <Pagination.Prev onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} />
                                            { totalPages <= 7 ? paginationItems : (
                                                <>
                                                    {page < 3 ? (
                                                        <>
                                                            {paginationItems.slice(0, 5)}
                                                            <Pagination.Ellipsis />
                                                            {paginationItems[totalPages - 1]}
                                                        </>
                                                    ) : page > totalPages - 4 ? (
                                                        <>
                                                            {paginationItems[0]}
                                                            <Pagination.Ellipsis />
                                                            {paginationItems.slice(totalPages - 5, totalPages)}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {paginationItems[0]}
                                                            <Pagination.Ellipsis />
                                                            {paginationItems.slice(page - 1, page + 2)}
                                                            <Pagination.Ellipsis />
                                                            {paginationItems[totalPages - 1]}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                            <Pagination.Next onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} />
                                            <Pagination.Last onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1} />
                                        </Pagination>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                {(searchTerm || Object.keys(filters).length > 0 ||
                                    statusFilter !== 'ALL' || typeFilter !== 'ALL')
                                    ? "No passengers match your search criteria"
                                    : "No passenger data available"
                                }
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default PassengerListForTicketAgent;
