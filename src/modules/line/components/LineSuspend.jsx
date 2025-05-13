import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Card,
    Form,
    Button,
    Row,
    Col,
    Spinner,
    Badge,
    ToggleButton,
    ToggleButtonGroup
} from 'react-bootstrap';
import {
    FaArrowLeft,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaSave,
    FaTimes
} from 'react-icons/fa';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    useGetLineByIdQuery,
    useSuspendLineMutation
} from '../store/lineApiSlice.js';

const LineSuspend = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [suspensionScope, setSuspensionScope] = useState('ENTIRE_LINE');
    const [selectedStations, setSelectedStations] = useState([]);

    const { data: line, isLoading: lineLoading, error: lineError } = useGetLineByIdQuery(id);
    const [suspendLine, { isLoading: isSuspending }] = useSuspendLineMutation();

    const { register, handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            reason: '',
            suspension_type: 'EMERGENCY', // Changed from suspensionType to suspension_type
            expected_restoration_time: null // Changed from expectedRestorationTime to expected_restoration_time
        }
    });

    const handleGoBack = () => {
        navigate('/operator/lines');
    };

    const handleScopeChange = (val) => {
        setSuspensionScope(val);

        // Reset selected stations when switching to entire line
        if (val === 'ENTIRE_LINE') {
            setSelectedStations([]);
        }
    };

    const handleStationToggle = (stationId) => {
        setSelectedStations(prev =>
            prev.includes(stationId)
                ? prev.filter(id => id !== stationId)
                : [...prev, stationId]
        );
    };

    const onSubmit = async (data) => {
        // Validate selected stations if scope is specific stations
        if (suspensionScope === 'SPECIFIC_STATIONS' && selectedStations.length === 0) {
            toast.error('Please select at least one station');
            return;
        }

        const suspensionData = {
            reason: data.reason,
            suspension_type: data.suspension_type, // Changed from suspensionType to suspension_type
            affected_station_ids: suspensionScope === 'SPECIFIC_STATIONS' ? selectedStations : [], // Changed from affectedStationIds to affected_station_ids
            expected_restoration_time: data.expected_restoration_time // Changed from expectedRestorationTime to expected_restoration_time
        };

        try {
            await suspendLine(id, suspensionData).unwrap();
            toast.success('Line suspended successfully');
            navigate('/operator/lines');
        } catch (error) {
            toast.error(`Failed to suspend line: ${error.data?.message || 'Unknown error'}`);
        }
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

    // If line is already suspended, show message
    if (line?.status !== 'ACTIVE') {
        return (
            <Card className="border-warning">
                <Card.Body className="text-center">
                    <Card.Title className="text-warning">
                        <FaExclamationTriangle className="me-2" />
                        Line Already Suspended
                    </Card.Title>
                    <Card.Text>
                        This metro line is already in {line.status} status.
                    </Card.Text>
                    <Button variant="primary" onClick={handleGoBack}>
                        <FaArrowLeft className="me-2" /> Back to Line List
                    </Button>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card>
            <Card.Header className="bg-warning text-dark">
                <div className="d-flex align-items-center">
                    <FaExclamationTriangle className="me-2" />
                    <h4 className="mb-0">Suspend Metro Line: {line?.name}</h4>
                </div>
            </Card.Header>

            <Card.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="suspensionType">
                                <Form.Label>Suspension Type</Form.Label>
                                <Form.Select
                                    {...register('suspension_type', { required: 'Suspension type is required' })} // Changed from suspensionType to suspension_type
                                    isInvalid={!!errors.suspension_type} // Changed from suspensionType to suspension_type
                                >
                                    <option value="EMERGENCY">Emergency</option>
                                    <option value="MAINTENANCE">Scheduled Maintenance</option>
                                </Form.Select>
                                {errors.suspension_type && ( // Changed from suspensionType to suspension_type
                                    <Form.Control.Feedback type="invalid">
                                        {errors.suspension_type.message} {/* Changed from suspensionType to suspension_type */}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="expectedRestorationTime">
                                <Form.Label>Expected Restoration Time (Optional)</Form.Label>
                                <Controller
                                    control={control}
                                    name="expected_restoration_time" // Changed from expectedRestorationTime to expected_restoration_time
                                    render={({ field }) => (
                                        <DatePicker
                                            selected={field.value}
                                            onChange={(date) => field.onChange(date)}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            placeholderText="Select date and time"
                                            minDate={new Date()}
                                            className="form-control"
                                        />
                                    )}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="reason">
                        <Form.Label>Suspension Reason</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Explain why this line or segment is being suspended"
                            {...register('reason', {
                                required: 'Reason is required',
                                minLength: {
                                    value: 5,
                                    message: 'Reason must be at least 5 characters'
                                }
                            })}
                            isInvalid={!!errors.reason}
                        />
                        {errors.reason && (
                            <Form.Control.Feedback type="invalid">
                                {errors.reason.message}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>

                    <Card className="mb-3">
                        <Card.Header>
                            <Form.Label className="mb-0">Suspension Scope</Form.Label>
                        </Card.Header>
                        <Card.Body>
                            <ToggleButtonGroup
                                type="radio"
                                name="suspensionScope"
                                value={suspensionScope}
                                onChange={handleScopeChange}
                                className="w-100 mb-3"
                            >
                                <ToggleButton
                                    id="scope-entire-line"
                                    value="ENTIRE_LINE"
                                    variant="outline-danger"
                                >
                                    Entire Line
                                </ToggleButton>
                                <ToggleButton
                                    id="scope-specific-stations"
                                    value="SPECIFIC_STATIONS"
                                    variant="outline-warning"
                                >
                                    Specific Stations
                                </ToggleButton>
                            </ToggleButtonGroup>

                            {suspensionScope === 'SPECIFIC_STATIONS' && (
                                <div className="mt-3">
                                    <Form.Label>Select Affected Stations</Form.Label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {line?.stations?.sort((a, b) => a.sequence - b.sequence).map((station) => (
                                            <Button
                                                key={station.station_id} // Changed from stationId to station_id
                                                variant={selectedStations.includes(station.station_id) ? 'danger' : 'outline-secondary'} // Changed from stationId to station_id
                                                size="sm"
                                                onClick={() => handleStationToggle(station.station_id)} // Changed from stationId to station_id
                                                className="mb-2"
                                            >
                                                {station.station_name} {/* Changed from stationName to station_name */}
                                            </Button>
                                        ))}
                                    </div>
                                    {selectedStations.length === 0 && (
                                        <div className="text-danger mt-2 small">
                                            Please select at least one station
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    <div className="alert alert-warning">
                        <FaExclamationTriangle className="me-2" />
                        <strong>Warning:</strong> Suspending this line will affect all scheduled trips and notify passengers using the PAWA app.
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button
                            variant="secondary"
                            onClick={handleGoBack}
                            disabled={isSuspending}
                        >
                            <FaTimes className="me-1" /> Cancel
                        </Button>
                        <Button
                            variant="danger"
                            type="submit"
                            disabled={isSuspending}
                        >
                            {isSuspending ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Suspending...
                                </>
                            ) : (
                                <>
                                    <FaExclamationTriangle className="me-1" /> Suspend Line
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default LineSuspend;