import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Table,
    Button,
    Card,
    Badge,
    Spinner,
    Collapse,
    OverlayTrigger,
    Tooltip
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
    FaInfoCircle
} from 'react-icons/fa';
import { useGetLinesQuery, useDeleteLineMutation, useResumeLineMutation } from '../../../app/config/api/lineApi';
import DeleteConfirmModal from '../../../shared/components/DeleteConfirmModal';

const LineList = () => {
    const navigate = useNavigate();
    const [expandedLine, setExpandedLine] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [lineToDelete, setLineToDelete] = useState(null);

    const { data: lines, isLoading, isError, error, refetch } = useGetLinesQuery();
    const [deleteLine, { isLoading: isDeleting }] = useDeleteLineMutation();
    const [resumeLine, { isLoading: isResuming }] = useResumeLineMutation();

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

    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                    <Button
                        variant="primary"
                        className="d-flex align-items-center"
                        onClick={handleCreateLine}
                    >
                        <FaPlus className="me-2" />
                        Create New Line
                    </Button>
                </Card.Header>
                <Card.Body>
                    <Table responsive hover className="align-middle">
                        <thead>
                        <tr>
                            <th>Line Name</th>
                            <th>Start Station</th>
                            <th>End Station</th>
                            <th>First Departure</th>
                            <th>Frequency</th>
                            <th>Status</th>
                            <th>Actions</th>
                            <th>Details</th>
                        </tr>
                        </thead>
                        <tbody>
                        {lines?.map((line) => (
                            <React.Fragment key={line.id}>
                                <tr>
                                    <td>{line.name}</td>
                                    <td>
                                        {line.stations?.length > 0
                                            ? line.stations.find(s => s.sequence === 0)?.stationName || 'N/A'
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        {line.stations?.length > 0
                                            ? line.stations[line.stations.length - 1]?.stationName || 'N/A'
                                            : 'N/A'}
                                    </td>
                                    <td>{formatTime(line.firstDepartureTime)}</td>
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
                                <tr>
                                    <td colSpan={8} className="p-0">
                                        <Collapse in={expandedLine === line.id}>
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
                                                                {getSortedStations(line.stations).map((station) => (
                                                                    <tr key={`${line.id}-${station.stationId}`}>
                                                                        <td>{station.sequence}</td>
                                                                        <td>{station.stationName}</td>
                                                                        <td>
                                                                            {station.sequence === 0
                                                                                ? 'Start Station'
                                                                                : `${station.timeFromPreviousStation || 'N/A'} minutes`}
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
                        ))}

                        {(!lines || lines.length === 0) && (
                            <tr>
                                <td colSpan={8} className="text-center py-5">
                                    <div className="text-muted">
                                        <FaInfoCircle className="me-2" />
                                        No metro lines found
                                    </div>
                                    <Button
                                        variant="outline-primary"
                                        className="mt-3"
                                        onClick={handleCreateLine}
                                    >
                                        <FaPlus className="me-2" />
                                        Create First Line
                                    </Button>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

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