// src/modules/line/components/LineSchedule.jsx (continued)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Card,
    Button,
    Spinner,
    Table,
    Row,
    Col,
    Badge,
    Pagination
} from 'react-bootstrap';
import {
    FaArrowLeft,
    FaCalendarPlus,
    FaClock,
    FaExclamationTriangle,
    FaInfoCircle,
    FaSyncAlt
} from 'react-icons/fa';
import {
    useGetLineByIdQuery,
    useGetLineScheduleQuery,
    useGetLineTripsQuery,
    useGenerateLineScheduleMutation
} from '../store/lineApiSlice.js';

const LineSchedule = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);

    // Fetch line details
    const {
        data: line,
        isLoading: lineLoading,
        error: lineError
    } = useGetLineByIdQuery(id);

    // Fetch schedule overview (first/last two trips)
    const {
        data: scheduleOverview,
        isLoading: overviewLoading,
        error: overviewError,
        refetch: refetchOverview
    } = useGetLineScheduleQuery(id);

    // Fetch paginated trips
    const {
        data: trips,
        isLoading: tripsLoading,
        error: tripsError,
        refetch: refetchTrips
    } = useGetLineTripsQuery({ id, page, size: pageSize });

    // Generate schedule mutation
    const [
        generateSchedule,
        { isLoading: isGenerating }
    ] = useGenerateLineScheduleMutation();

    const isLoading = lineLoading || overviewLoading || tripsLoading || isGenerating;
    const hasError = lineError || overviewError || tripsError;

    const handleGoBack = () => {
        navigate('/operator/lines');
    };

    const handleGenerateSchedule = async () => {
        try {
            await generateSchedule(id).unwrap();
            toast.success('Schedule generated successfully');
            refetchOverview();
            refetchTrips();
        } catch (error) {
            toast.error(`Failed to generate schedule: ${error.data?.message || 'Unknown error'}`);
        }
    };

    const handleRefresh = () => {
        refetchOverview();
        refetchTrips();
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const calculateTotalPages = () => {
        if (!scheduleOverview?.totalTripCount) return 1;
        return Math.ceil(scheduleOverview.totalTripCount / pageSize);
    };

    const renderPagination = () => {
        const totalPages = calculateTotalPages();
        if (totalPages <= 1) return null;

        const paginationItems = [];

        // Previous button
        paginationItems.push(
            <Pagination.Prev
                key="prev"
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                disabled={page === 0}
            />
        );

        // First page
        paginationItems.push(
            <Pagination.Item
                key={0}
                active={page === 0}
                onClick={() => handlePageChange(0)}
            >
                1
            </Pagination.Item>
        );

        // Ellipsis if needed
        if (page > 2) {
            paginationItems.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
        }

        // Pages around current
        for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) {
            paginationItems.push(
                <Pagination.Item
                    key={i}
                    active={page === i}
                    onClick={() => handlePageChange(i)}
                >
                    {i + 1}
                </Pagination.Item>
            );
        }

        // Ellipsis if needed
        if (page < totalPages - 3) {
            paginationItems.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
        }

        // Last page
        if (totalPages > 1) {
            paginationItems.push(
                <Pagination.Item
                    key={totalPages - 1}
                    active={page === totalPages - 1}
                    onClick={() => handlePageChange(totalPages - 1)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }

        // Next button
        paginationItems.push(
            <Pagination.Next
                key="next"
                onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
            />
        );

        return <Pagination>{paginationItems}</Pagination>;
    };

    if (lineLoading) {
        return (
            <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (lineError) {
        return (
            <Card className="border-danger">
                <Card.Body className="text-center">
                    <Card.Title className="text-danger">
                        <FaExclamationTriangle className="me-2" />
                        Error Loading Metro Line
                    </Card.Title>
                    <Card.Text>
                        {lineError.data?.message || 'Could not load the metro line. Please try again.'}
                    </Card.Text>
                    <Button variant="primary" onClick={handleGoBack}>
                        <FaArrowLeft className="me-2" /> Back to Line List
                    </Button>
                </Card.Body>
            </Card>
        );
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button variant="outline-secondary" onClick={handleGoBack}>
                    <FaArrowLeft className="me-2" /> Back to Lines
                </Button>
                <h3 className="mb-0">
                    {line?.name} - Schedule
                </h3>
                <Button
                    variant="primary"
                    onClick={handleGenerateSchedule}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <FaCalendarPlus className="me-2" /> Generate Schedule
                        </>
                    )}
                </Button>
            </div>

            <Card className="mb-4">
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Line Details</h5>
                        <Badge bg={line?.status === 'ACTIVE' ? 'success' : line?.status === 'MAINTENANCE' ? 'warning' : 'danger'}>
                            {line?.status}
                        </Badge>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <div className="mb-3">
                                <strong>First Departure:</strong><br />
                                {formatTime(line?.first_departure_time)}
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="mb-3">
                                <strong>Train Frequency:</strong><br />
                                {line?.frequency} minutes
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="mb-3">
                                <strong>Start Station:</strong><br />
                                {line?.stations?.find(s => s.sequence === 0)?.stationName || 'N/A'}
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="mb-3">
                                <strong>End Station:</strong><br />
                                {line?.stations?.length > 0
                                    ? line.stations[line.stations.length - 1]?.station_name || 'N/A'
                                    : 'N/A'}
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <div>
                                <strong>Total Trip Count:</strong>{' '}
                                {overviewLoading ? (
                                    <Spinner animation="border" size="sm" />
                                ) : (
                                    scheduleOverview?.totalTripCount || '0'
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">First Two Trips</h5>
                        </Card.Header>
                        <Card.Body>
                            {overviewLoading ? (
                                <div className="text-center py-3">
                                    <Spinner animation="border" size="sm" />
                                    <span className="ms-2">Loading...</span>
                                </div>
                            ) : scheduleOverview?.firstTwoTrips?.length > 0 ? (
                                <Table responsive>
                                    <thead>
                                    <tr>
                                        <th>Trip Code</th>
                                        <th>Departure</th>
                                        <th>Arrival</th>
                                        <th>Duration</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {scheduleOverview.firstTwoTrips.map((trip) => (
                                        <tr key={trip.id}>
                                            <td>{trip.tripCode}</td>
                                            <td>{formatTime(trip.departureTime)}</td>
                                            <td>{formatTime(trip.arrivalTime)}</td>
                                            <td>
                                                {trip.departureTime && trip.arrivalTime
                                                    ? `${Math.round((new Date(trip.arrivalTime) - new Date(trip.departureTime)) / 60000)} min`
                                                    : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <div className="text-center py-3 text-muted">
                                    <FaInfoCircle className="mb-2" size={24} />
                                    <p>No trips scheduled yet.</p>
                                    <p>Generate a schedule to create trips.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Last Two Trips</h5>
                        </Card.Header>
                        <Card.Body>
                            {overviewLoading ? (
                                <div className="text-center py-3">
                                    <Spinner animation="border" size="sm" />
                                    <span className="ms-2">Loading...</span>
                                </div>
                            ) : scheduleOverview?.lastTwoTrips?.length > 0 ? (
                                <Table responsive>
                                    <thead>
                                    <tr>
                                        <th>Trip Code</th>
                                        <th>Departure</th>
                                        <th>Arrival</th>
                                        <th>Duration</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {scheduleOverview.lastTwoTrips.map((trip) => (
                                        <tr key={trip.id}>
                                            <td>{trip.tripCode}</td>
                                            <td>{formatTime(trip.departureTime)}</td>
                                            <td>{formatTime(trip.arrivalTime)}</td>
                                            <td>
                                                {trip.departureTime && trip.arrivalTime
                                                    ? `${Math.round((new Date(trip.arrivalTime) - new Date(trip.departureTime)) / 60000)} min`
                                                    : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <div className="text-center py-3 text-muted">
                                    <FaInfoCircle className="mb-2" size={24} />
                                    <p>No trips scheduled yet.</p>
                                    <p>Generate a schedule to create trips.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">All Trips</h5>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={tripsLoading}
                    >
                        <FaSyncAlt className={tripsLoading ? 'spin' : ''} />
                    </Button>
                </Card.Header>
                <Card.Body>
                    {tripsLoading ? (
                        <div className="text-center py-3">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading trips...</span>
                            </Spinner>
                        </div>
                    ) : trips?.length > 0 ? (
                        <>
                            <Table responsive hover>
                                <thead>
                                <tr>
                                    <th>Trip Code</th>
                                    <th>Departure</th>
                                    <th>Arrival</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {trips.map((trip) => (
                                    <tr
                                        key={trip.id}
                                        className={trip.suspended ? 'text-danger' : ''}
                                    >
                                        <td>{trip.tripCode}</td>
                                        <td>{formatTime(trip.departureTime)}</td>
                                        <td>{formatTime(trip.arrivalTime)}</td>
                                        <td>
                                            {trip.departureTime && trip.arrivalTime
                                                ? `${Math.round((new Date(trip.arrivalTime) - new Date(trip.departureTime)) / 60000)} min`
                                                : 'N/A'}
                                        </td>
                                        <td>
                                            {trip.suspended ? (
                                                <Badge bg="danger">Suspended</Badge>
                                            ) : (
                                                <Badge bg="success">Active</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>

                            <div className="d-flex justify-content-center mt-3">
                                {renderPagination()}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <FaClock className="mb-3 text-muted" size={32} />
                            <h5>No Trips Available</h5>
                            <p className="text-muted">
                                This metro line doesn't have any scheduled trips yet.
                            </p>
                            <Button
                                variant="primary"
                                onClick={handleGenerateSchedule}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FaCalendarPlus className="me-2" /> Generate Schedule Now
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </>
    );
};

export default LineSchedule;