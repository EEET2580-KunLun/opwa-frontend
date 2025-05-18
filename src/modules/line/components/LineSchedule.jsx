import React, {useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatTime, formatTimeForDate } from "../../../shared/utils.js";
import {
    Card,
    Button,
    Spinner,
    Table,
    Row,
    Col,
    Badge,
    Pagination,
    Modal,
    Form
} from 'react-bootstrap';
import {
    FaArrowLeft,
    FaCalendarPlus,
    FaClock,
    FaExclamationTriangle,
    FaInfoCircle,
    FaSyncAlt,
    FaCalendarAlt
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
    
    // Add state for modal and date selection
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [departureTime, setDepartureTime] = useState(new Date());

    // Existing query hooks
    const {
        data: line,
        isLoading: lineLoading,
        error: lineError
    } = useGetLineByIdQuery(id);

    const {
        data: scheduleOverview,
        isLoading: overviewLoading,
        error: overviewError,
        refetch: refetchOverview
    } = useGetLineScheduleQuery(id);

    const {
        data: trips,
        isLoading: tripsLoading,
        error: tripsError,
        refetch: refetchTrips
    } = useGetLineTripsQuery(
        { id, page, size: pageSize },
    );

    const [
        generateSchedule,
        { isLoading: isGenerating }
    ] = useGenerateLineScheduleMutation();

    const handleGoBack = () => {
        navigate('/operator/lines');
    };

    // Modified to open the modal instead of generating immediately
    const handleOpenScheduleModal = () => {
        setShowScheduleModal(true);
    };

    const handleCloseScheduleModal = () => {
        setShowScheduleModal(false);
    };

    const handleGenerateSchedule = async () => {
        try {
            // Convert the date to Unix timestamp (milliseconds since epoch)
            const unixTimestamp = Math.floor(departureTime.getTime());
            
            const scheduleData = {
                departure_time: unixTimestamp
            };

            await generateSchedule({ id, scheduleData }).unwrap();
            toast.success('Schedule generated successfully');
            handleCloseScheduleModal();
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
        // Log for debugging
        console.log(`Changing page from ${page} to ${newPage}`);
        setPage(newPage);
    };

    useEffect(() => {
        console.log(`Page: ${page}, Trips data:`, trips);
    }, [page, trips]);

    const calculateTotalPages = () => {
        if (!scheduleOverview?.total_trip_count) return 1;
        return Math.ceil(scheduleOverview.total_trip_count / pageSize);
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

    // Show error state if there's any error after loading
    if (overviewError || tripsError) {
        return (
            <Card className="border-danger">
                <Card.Body className="text-center">
                    <Card.Title className="text-danger">
                        <FaExclamationTriangle className="me-2" />
                        Error Loading Schedule
                    </Card.Title>
                    <Card.Text>
                        {(overviewError || tripsError)?.data?.message || 'Could not load the schedule. Please try again.'}
                    </Card.Text>
                    <Button variant="primary" onClick={handleGoBack}>
                        <FaArrowLeft className="me-2" /> Back to Line List
                    </Button>
                </Card.Body>
            </Card>
        );
    }

    const scheduleModal = (
        <Modal show={showScheduleModal} onHide={handleCloseScheduleModal}>
            <Modal.Header closeButton>
                <Modal.Title>Generate Schedule</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Departure Start Time (Optional)</Form.Label>
                    <div className="input-group">
                        <span className="input-group-text">
                            <FaCalendarAlt />
                        </span>
                        <DatePicker
                            selected={departureTime}
                            onChange={(date) => setDepartureTime(date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            timeCaption="Time"
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="form-control"
                        />
                    </div>
                    <Form.Text className="text-muted">
                        Choose when the schedule should begin. If not specified, the system will use the line's default first departure time.
                    </Form.Text>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseScheduleModal}>
                    Cancel
                </Button>
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
            </Modal.Footer>
        </Modal>
    );

    return (
        <>
            {scheduleModal}
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button variant="outline-secondary" onClick={handleGoBack}>
                    <FaArrowLeft className="me-2" /> Back to Lines
                </Button>
                <h3 className="mb-0">
                    {line?.name} - Schedule
                </h3>
                <Button
                    variant="primary"
                    onClick={handleOpenScheduleModal}
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
                                {line?.stations?.find(s => s.sequence === 0)?.station_name || 'N/A'}
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
                                    scheduleOverview?.total_trip_count || '0'
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
                            ) : scheduleOverview?.first_two_trips?.length > 0 ? (
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
                                    {scheduleOverview.first_two_trips.map((trip) => (
                                        <tr key={trip.id}>
                                            <td>{trip.trip_code}</td>
                                            <td>{formatTimeForDate(trip.departure_time)}</td>
                                            <td>{formatTimeForDate(trip.arrival_time)}</td>
                                            <td>
                                                {trip.departure_time && trip.arrival_time
                                                    ? `${Math.floor((new Date(trip.arrival_time) - new Date(trip.departure_time)) / 60000)} min`
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
                            ) : scheduleOverview?.last_two_trips?.length > 0 ? (
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
                                    {scheduleOverview.last_two_trips.map((trip) => (
                                        <tr key={trip.id}>
                                            <td>{trip.trip_code}</td>
                                            <td>{formatTimeForDate(trip.departure_time)}</td>
                                            <td>{formatTimeForDate(trip.arrival_time)}</td>
                                            <td>
                                                {trip.departure_time && trip.arrival_time
                                                    ? `${Math.floor((new Date(trip.arrival_time) - new Date(trip.departure_time)) / 60000)} min`
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
                                        <td>{trip.trip_code}</td>
                                        <td>{formatTimeForDate(trip.departure_time)}</td>
                                        <td>{formatTimeForDate(trip.arrival_time)}</td>
                                        <td>
                                            {trip.departure_time && trip.arrival_time
                                                ? `${Math.floor((new Date(trip.arrival_time) - new Date(trip.departure_time)) / 60000)} min`
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
                                onClick={handleOpenScheduleModal}
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