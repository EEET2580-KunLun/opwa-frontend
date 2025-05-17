import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {useDispatch} from 'react-redux';
import {setLines} from "../store/lineSlice.js";
import {formatTime} from "../../../shared/utils.js";
import {
    Table,
    Button,
    Card,
    Badge,
    Spinner,
    Collapse,
    OverlayTrigger,
    Tooltip,
    Pagination,
    Alert
} from 'react-bootstrap';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaCalendarAlt,
    FaExclamationTriangle,
    FaCheckCircle,
    FaAngleDown,
    FaAngleUp,
    FaInfoCircle,
    FaMapMarkedAlt,
    FaSyncAlt
} from 'react-icons/fa';
import { useGetLinesQuery, useDeleteLineMutation, useResumeLineMutation } from '../store/lineApiSlice.js';
import DeleteConfirmModal from '../../../shared/components/DeleteConfirmModal';
import MapComponent from "../../map/MapComponent.jsx";
import SortableHeader from '../../../shared/components/SortableHeader.jsx';
import SearchBar from '../../../shared/components/SearchBar.jsx';

const LineList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [expandedLine, setExpandedLine] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [lineToDelete, setLineToDelete] = useState(null);
    const [selectedLine, setSelectedLine] = useState(null);
    const [showMap, setShowMap] = useState(false);
    
    // Pagination, sorting, and search state
    const [queryParams, setQueryParams] = useState({
        page: 0,
        size: 10,
        sortBy: 'name',
        direction: 'ASC',
        searchTerm: ''
    });
    
    // Client-side search for when backend doesn't support it
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const isSearchActive = clientSearchTerm.trim() !== '';

    const { 
        data: linesResponse, 
        isLoading, 
        isError, 
        error, 
        refetch 
    } = useGetLinesQuery(queryParams);
    
    const [deleteLine, { isLoading: isDeleting }] = useDeleteLineMutation();
    const [resumeLine, { isLoading: isResuming }] = useResumeLineMutation();

    // Extract data from response
    const lines = linesResponse?.content || [];
    const totalElements = linesResponse?.total_elements || 0;
    const totalPages = linesResponse?.total_pages || 0;
    const currentPage = linesResponse?.page || 0;
    const isLastPage = linesResponse?.last || false;
    
    // Filter lines by search term if client-side search is active
    const filteredLines = isSearchActive 
        ? lines.filter(line => 
            line.name.toLowerCase().includes(clientSearchTerm.toLowerCase()))
        : lines;

    const parseIsoDurationToMinutes = (iso) => {
        if (!iso || typeof iso !== 'string') return null;
        // Match PT<number><unit>, where unit can be H, M or S
        const m = iso.match(/^PT(\d+)([HMS])$/);
        if (!m) return null;
        const value = parseInt(m[1], 10);
        const unit  = m[2];
        switch (unit) {
            case 'H': return value * 60;
            case 'M': return value;
            case 'S': return Math.round(value / 60);
            default:  return null;
        }
    };

    useEffect(() => {
        if(lines) {
            dispatch(setLines(lines));
        }
    },[lines, dispatch]);

    const handleCreateLine = () => {
        navigate('/operator/lines/create');
    };

    const handleEditLine = (lineId) => {
        navigate(`/operator/lines/${lineId}/edit`);
    };

    const handleViewSchedule = (lineId) => {
        navigate(`/operator/lines/${lineId}/schedule`);
    };

    const handleSuspendLine = (lineId) => {
        navigate(`/operator/lines/${lineId}/suspend`);
    };

    const handleViewMap = (line) => {
        setSelectedLine(line);
        setShowMap(true);
    };

    // Handle search
    const handleSearch = (term) => {
        setClientSearchTerm(term);
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
            page: pageNumber - 1 // Convert from 1-based to 0-based
        }));
    };

    // Add a new action button in the existing actions column
    const addMapButton = (line) => (
        <OverlayTrigger
            placement="top"
            overlay={<Tooltip>View on Map</Tooltip>}
        >
            <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => handleViewMap(line)}
            >
                <FaMapMarkedAlt />
            </Button>
        </OverlayTrigger>
    );

    const handleResumeLine = async (lineId) => {
        try {
            await resumeLine(lineId).unwrap();
            toast.success('Line resumed successfully');
        } catch (err) {
            toast.error(`Failed to resume line: ${err.data?.message || 'Unknown error'}`);
        }
    };

    const handleDeleteClick = (line) => {
        setLineToDelete(line);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!lineToDelete) return;

        try {
            await deleteLine(lineToDelete.id).unwrap();
            toast.success('Line deleted successfully');
            setShowDeleteModal(false);
        } catch (err) {
            toast.error(`Failed to delete line: ${err.data?.message || 'Unknown error'}`);
        }
    };

    const toggleLineExpand = (lineId) => {
        setExpandedLine(expandedLine === lineId ? null : lineId);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge bg="success">Active</Badge>;
            case 'EMERGENCY':
                return <Badge bg="danger">Emergency</Badge>;
            case 'MAINTENANCE':
                return <Badge bg="warning">Maintenance</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    // Helper function to get sorted stations without modifying the original array
    const getSortedStations = (stations) => {
        if (!stations || !Array.isArray(stations)) return [];
        return [...stations].sort((a, b) => a.sequence - b.sequence);
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (isError) {
        return (
            <Card className="border-danger mb-4">
                <Card.Body className="text-center">
                    <Card.Title className="text-danger">
                        <FaExclamationTriangle className="me-2" />
                        Error Loading Metro Lines
                    </Card.Title>
                    <Card.Text>
                        {error.data?.message || 'Could not load metro lines. Please try again.'}
                    </Card.Text>
                    <Button variant="outline-primary" onClick={refetch}>
                        Try Again
                    </Button>
                </Card.Body>
            </Card>
        );
    }

    return (
        <>
            <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Metro Lines</h4>
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
                            onClick={handleCreateLine}
                        >
                            <FaPlus className="me-2" />
                            Create New Line
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    <SearchBar onSearch={handleSearch}
                        placeholder="Search lines by name..." 
                    />
                    
                    {isSearchActive && (
                        <Alert variant="info" className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                Searching for "{clientSearchTerm}" - 
                                Found {filteredLines.length} of {lines.length} lines
                            </div>
                            <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                onClick={() => handleSearch('')}
                            >
                                Clear Search
                            </Button>
                        </Alert>
                    )}
                    
                    <Table responsive hover className="align-middle">
                        <thead>
                        <tr>
                            <SortableHeader 
                                label="Line Name" 
                                field="name" 
                                currentSort={{
                                    field: queryParams.sortBy,
                                    direction: queryParams.direction
                                }}
                                onSort={handleSort} 
                            />
                            <th>Start Station</th>
                            <th>End Station</th>
                            <SortableHeader 
                                label="First Departure" 
                                field="firstDepartureTime" 
                                currentSort={{
                                    field: queryParams.sortBy,
                                    direction: queryParams.direction
                                }}
                                onSort={handleSort} 
                            />
                            <SortableHeader 
                                label="Frequency" 
                                field="frequency" 
                                currentSort={{
                                    field: queryParams.sortBy,
                                    direction: queryParams.direction
                                }}
                                onSort={handleSort} 
                            />
                            <SortableHeader 
                                label="Status" 
                                field="status" 
                                currentSort={{
                                    field: queryParams.sortBy,
                                    direction: queryParams.direction
                                }}
                                onSort={handleSort} 
                            />
                            <th>Actions</th>
                            <th>Details</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredLines.length > 0 ? (
                            filteredLines.map((line) => (
                                <React.Fragment key={line.id}>
                                    <tr>
                                        <td>{line.name}</td>
                                        <td>
                                            {line.stations?.length > 0
                                                ? line.stations.find(s => s.sequence === 0)?.station_name || 'N/A'
                                                : 'N/A'}
                                        </td>
                                        <td>
                                            {line.stations?.length > 0
                                                ? line.stations[line.stations.length - 1]?.station_name || 'N/A'
                                                : 'N/A'}
                                        </td>
                                        <td>{formatTime(line.first_departure_time)}</td>
                                        <td>{line.frequency} min</td>
                                        <td>{getStatusBadge(line.status)}</td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={<Tooltip>Edit Line</Tooltip>}
                                                >
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleEditLine(line.id)}
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                </OverlayTrigger>

                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={<Tooltip>View Schedule</Tooltip>}
                                                >
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => handleViewSchedule(line.id)}
                                                    >
                                                        <FaCalendarAlt />
                                                    </Button>
                                                </OverlayTrigger>

                                                {addMapButton(line)}

                                                {line.status === 'ACTIVE' ? (
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip>Suspend Line</Tooltip>}
                                                    >
                                                        <Button
                                                            variant="outline-warning"
                                                            size="sm"
                                                            onClick={() => handleSuspendLine(line.id)}
                                                        >
                                                            <FaExclamationTriangle />
                                                        </Button>
                                                    </OverlayTrigger>
                                                ) : (
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip>Resume Line</Tooltip>}
                                                    >
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            onClick={() => handleResumeLine(line.id)}
                                                            disabled={isResuming}
                                                        >
                                                            {isResuming ? (
                                                                <Spinner animation="border" size="sm" />
                                                            ) : (
                                                                <FaCheckCircle />
                                                            )}
                                                        </Button>
                                                    </OverlayTrigger>
                                                )}

                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={<Tooltip>Delete Line</Tooltip>}
                                                >
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(line)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </OverlayTrigger>
                                            </div>
                                        </td>
                                        <td>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => toggleLineExpand(line.id)}
                                                aria-expanded={expandedLine === line.id}
                                            >
                                                {expandedLine === line.id ? <FaAngleUp /> : <FaAngleDown />}
                                            </Button>
                                        </td>
                                    </tr>
                                    {/* Expandable station details */}
                                    <tr>
                                        <td colSpan={8} className="p-0">
                                            <Collapse in={expandedLine === line.id}>
                                                {/* Existing station details code */}
                                                <div>
                                                    <Card className="border-0 m-3">
                                                        <Card.Header className="bg-light">
                                                            <div className="d-flex align-items-center">
                                                                <FaInfoCircle className="me-2 text-info" />
                                                                <h6 className="mb-0">Station Details</h6>
                                                            </div>
                                                        </Card.Header>
                                                        <Card.Body>
                                                            {line.stations?.length > 0 ? (
                                                                <Table size="sm" className="mb-0">
                                                                    <thead>
                                                                    <tr>
                                                                        <th>Sequence</th>
                                                                        <th>Station Name</th>
                                                                        <th>Time from Previous</th>
                                                                    </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                    {getSortedStations(line.stations).map((station, index) => (
                                                                        <tr key={`${line.id}-station-${index}`}>
                                                                            <td>{station.sequence}</td>
                                                                            <td>{station.station_name}</td>
                                                                            <td>
                                                                                {station.sequence === 0
                                                                                    ? 'Start Station'
                                                                                    : (() => {
                                                                                        const mins = parseIsoDurationToMinutes(
                                                                                            station.time_from_previous_station
                                                                                        );
                                                                                        return mins != null ? `${mins} minutes` : 'N/A';
                                                                                    })()}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                    </tbody>
                                                                </Table>
                                                            ) : (
                                                                <div className="text-center text-muted py-3">
                                                                    No stations defined for this line
                                                                </div>
                                                            )}
                                                        </Card.Body>
                                                    </Card>
                                                </div>
                                            </Collapse>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="text-center py-5">
                                    <div className="text-muted">
                                        <FaInfoCircle className="me-2" />
                                        {isSearchActive ? 'No lines match your search criteria' : 'No metro lines found'}
                                    </div>
                                    {!isSearchActive && (
                                        <Button
                                            variant="outline-primary"
                                            className="mt-3"
                                            onClick={handleCreateLine}
                                        >
                                            <FaPlus className="me-2" />
                                            Create First Line
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                    
                    {/* Only show pagination when not filtering client-side and we have pages */}
                    {!isSearchActive && totalPages > 0 && (
                        <div className="pagination-controls d-flex justify-content-between align-items-center mt-4">
                            <div>
                                Showing {filteredLines.length} of {totalElements} lines
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
                </Card.Body>
            </Card>

            {/* Map Component */}
            {showMap && (
                <Card className="mb-4">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">
                            Metro Line Map {selectedLine && `- ${selectedLine.name}`}
                        </h4>
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowMap(false)}
                        >
                            Hide Map
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        <div style={{ height: '750px' }}>
                            <MapComponent selectedTrip={selectedLine} isStationMode={false} selectedStationLoc={null}/>
                        </div>
                    </Card.Body>
                </Card>
            )}

            <DeleteConfirmModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Metro Line"
                message={`Are you sure you want to delete the metro line "${lineToDelete?.name}"? This action cannot be undone.`}
                isLoading={isDeleting}
            />
        </>
    );
};

export default LineList;