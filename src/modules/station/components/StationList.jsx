import React, { useState, useEffect, useMemo } from 'react';
import { 
    Container, 
    Row, 
    Col,
    Card,
    Table,
    Button, 
    Spinner,
    Badge,
    Pagination,
    Alert,
    Modal
} from 'react-bootstrap';
import { 
    FaPlus,
    FaEdit,
    FaTrash,
    FaMapMarkerAlt,
    FaExclamationTriangle,
    FaSyncAlt,
    FaSearch
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useFetchAllStationsQuery, useDeleteStationMutation } from '../store/stationApiSlice';
import { useDispatch } from 'react-redux';
import { setStations, removeStation } from '../store/stationSlice';
import MapComponent from "../../map/MapComponent.jsx";
import SearchBar from '../../../shared/components/SearchBar.jsx';
import SortableHeader from '../../../shared/components/SortableHeader.jsx';

const StationList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Server-side pagination and sorting state
    const [queryParams, setQueryParams] = useState({
        page: 0,
        size: 10,
        sortBy: 'name',
        direction: 'ASC'
    });
    
    // Client-side filtering state (search only now)
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    
    // UI state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [stationToDelete, setStationToDelete] = useState(null);
    const [selectedStationLoc, setSelectedStationLoc] = useState(null);

    // Fetch stations with pagination parameters
    const { 
        data: stationsResponse, 
        isLoading, 
        isError, 
        error, 
        refetch 
    } = useFetchAllStationsQuery(queryParams);
    
    const [deleteStation, { isLoading: isDeleting }] = useDeleteStationMutation();

    // Extract data from paginated response
    const stations = stationsResponse?.content || [];
    const totalElements = stationsResponse?.total_elements || 0;
    const totalPages = stationsResponse?.total_pages || 0;
    const currentPage = stationsResponse?.page || 0;
    const isLastPage = stationsResponse?.last || false;

    // Store stations in Redux when data is fetched
    useEffect(() => {
        if (stations.length > 0) {
            dispatch(setStations(stations));
        }
    }, [stations, dispatch]);

    // Check if search filtering is active
    const isSearchActive = clientSearchTerm.trim() !== '';
    const isClientFilteringActive = isSearchActive; // Only search filtering now

    // Apply client-side filtering (search only)
    const filteredStations = useMemo(() => {
        if (!isSearchActive) return stations;
        
        return stations.filter(station => 
            station.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) || 
            (station.address && station.address.toLowerCase().includes(clientSearchTerm.toLowerCase()))
        );
    }, [stations, clientSearchTerm, isSearchActive]);

    // Handle search
    const handleSearch = (term) => {
        setClientSearchTerm(term);
    };
    
    // Handle sorting
    const handleSort = (field, direction) => {
        setQueryParams(prev => ({
            ...prev,
            sortBy: field,
            direction: direction,
            page: 0 // Reset to first page when sorting changes
        }));
    };
    
    // Handle page change
    const handlePageChange = (pageNumber) => {
        setQueryParams(prev => ({
            ...prev,
            page: pageNumber - 1 // Convert from 1-based (UI) to 0-based (API)
        }));
    };

    // Clear search
    const clearFilters = () => {
        setClientSearchTerm('');
    };

    // Delete handlers
    const handleDeleteClick = (station) => {
        setStationToDelete(station);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteStation(stationToDelete.id).unwrap();
            dispatch(removeStation(stationToDelete.id));
            setDeleteDialogOpen(false);
            setStationToDelete(null);
        } catch (error) {
            console.error('Failed to delete station:', error);
        }
    };

    // Navigation handlers
    const handleCreateStation = () => {
        navigate('/admin/stations/create');
    };

    const handleEditStation = (id) => {
        navigate(`/admin/stations/${id}/edit`);
    };

    const handleViewOnMap = (station) => {
        setSelectedStationLoc(station.location);
    };

    // Loading state
    if (isLoading && !stations.length) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <Container fluid className="py-4">
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Stations</h4>
                    <div className="d-flex gap-2">
                        <Button
                            variant="outline-secondary"
                            className="d-flex align-items-center"
                            onClick={refetch}
                            disabled={isLoading}
                        >
                            <FaSyncAlt className={isLoading ? "spin" : ""} />
                        </Button>
                        <Button
                            variant="primary"
                            className="d-flex align-items-center"
                            onClick={handleCreateStation}
                        >
                            <FaPlus className="me-2" />
                            Add New Station
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {/* Full-width search bar */}
                    <div className="mb-3">
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder="Search stations by name or address..."
                        />
                    </div>

                    {/* Show filter status when search is active */}
                    {isSearchActive && (
                        <Alert variant="info" className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <FaSearch className="me-2" />
                                <span>
                                    Searching for "{clientSearchTerm}" - 
                                    Found {filteredStations.length} of {stations.length} stations
                                </span>
                            </div>
                            <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                onClick={clearFilters}
                            >
                                Clear Search
                            </Button>
                        </Alert>
                    )}

                    {isError ? (
                        <Alert variant="danger">
                            Error loading stations: {error?.data?.message || 'Unknown error'}
                            <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="ms-3" 
                                onClick={() => refetch()}
                            >
                                Retry
                            </Button>
                        </Alert>
                    ) : (
                        <>
                            <Table responsive hover className="align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <SortableHeader 
                                            label="Name" 
                                            field="name" 
                                            currentSort={{
                                                field: queryParams.sortBy,
                                                direction: queryParams.direction
                                            }}
                                            onSort={handleSort} 
                                        />
                                        <SortableHeader 
                                            label="Address" 
                                            field="address" 
                                            currentSort={{
                                                field: queryParams.sortBy,
                                                direction: queryParams.direction
                                            }}
                                            onSort={handleSort} 
                                        />
                                        <SortableHeader 
                                            label="Status" 
                                            field="active" 
                                            currentSort={{
                                                field: queryParams.sortBy,
                                                direction: queryParams.direction
                                            }}
                                            onSort={handleSort} 
                                        />
                                        <th>Location [Long, Lat]</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStations.length > 0 ? (
                                        filteredStations.map((station) => (
                                            <tr key={station.id}>
                                                <td>{station.name}</td>
                                                <td>{station.address}</td>
                                                <td>
                                                    <Badge bg={station.active ? "success" : "secondary"}>
                                                        {station.active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {station.location ? `[${station.location[0]}, ${station.location[1]}]` : 'N/A'}
                                                </td>
                                                <td className="text-end">
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleViewOnMap(station)}
                                                        disabled={!station.location}
                                                    >
                                                        <FaMapMarkerAlt />
                                                    </Button>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleEditStation(station.id)}
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(station)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4">
                                                <FaExclamationTriangle className="me-2 text-warning" />
                                                {isClientFilteringActive 
                                                    ? "No stations match your search criteria" 
                                                    : "No stations found"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            {/* Only show pagination when not filtering and we have pages */}
                            {!isClientFilteringActive && totalPages > 0 && (
                                <div className="pagination-controls d-flex justify-content-between align-items-center mt-4">
                                    <div>
                                        Showing {stations.length} of {totalElements} stations
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
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Map Component */}
            {selectedStationLoc && (
                <Card className="mt-4">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Station Map</h5>
                        <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => setSelectedStationLoc(null)}
                        >
                            Hide Map
                        </Button>
                    </Card.Header>
                    <Card.Body style={{ height: '600px' }}>
                        <MapComponent 
                            isStationMode={true} 
                            selectedStationLoc={selectedStationLoc} 
                        />
                    </Card.Body>
                </Card>
            )}

            {/* Delete Confirmation Modal */}
            <Modal show={deleteDialogOpen} onHide={() => setDeleteDialogOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete station 
                    <strong> {stationToDelete?.name}</strong>?
                    <br/>
                    This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setDeleteDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default StationList;