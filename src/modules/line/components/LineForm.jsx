import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import {
    Form,
    Button,
    Card,
    Row,
    Col,
    Spinner,
    Table,
    InputGroup
} from 'react-bootstrap';
import {
    FaPlus,
    FaTrash,
    FaArrowUp,
    FaArrowDown,
    FaSave,
    FaTimes,
    FaExclamationTriangle
} from 'react-icons/fa';
import TimePicker from 'react-bootstrap-time-picker';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    useGetLineByIdQuery,
    useCreateLineMutation,
    useUpdateLineMutation,
    useGetStationsQuery
} from '../store/lineApiSlice';

// Draggable station item for reordering
const DraggableStationItem = ({ station, index, moveStation, onRemove, onTimeChange }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'STATION',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: 'STATION',
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveStation(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });

    return (
        <tr
            ref={(node) => drag(drop(node))}
            style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
        >
            <td>{index + 1}</td>
            <td>{station.station_name}</td>
            <td>
                <Form.Control
                    type="number"
                    min="1"
                    disabled={index === 0}
                    value={index === 0 ? 0 : station.time_from_previous_station || 5}
                    onChange={(e) => onTimeChange(index, parseInt(e.target.value))}
                />
            </td>
            <td className="text-center">
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onRemove(index)}
                >
                    <FaTrash />
                </Button>
            </td>
        </tr>
    );
};

const LineForm = () => {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();

    const [selectedStations, setSelectedStations] = useState([]);
    const [stationToAdd, setStationToAdd] = useState('');
    const [timeValue, setTimeValue] = useState(36000); // Default to 10:00 AM (36000 seconds)

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            name: '',
            frequency: 10,
            status: 'ACTIVE'
        }
    });

    // Get stations for dropdown
    const { data: stations, isLoading: stationsLoading } = useGetStationsQuery();

    // Get line data if editing
    const { data: line, isLoading: lineLoading } = useGetLineByIdQuery(id, {
        skip: !isEditing
    });

    // Create/update mutations
    const [createLine, { isLoading: isCreating }] = useCreateLineMutation();
    const [updateLine, { isLoading: isUpdating }] = useUpdateLineMutation();

    const isLoading = stationsLoading || lineLoading || isCreating || isUpdating;

    // Load line data into form when editing
    useEffect(() => {
        if (isEditing && line) {
            reset({
                name: line.name,
                frequency: line.frequency,
                status: line.status
            });

            // Convert milliseconds to seconds for TimePicker
            if (line.first_departure_time) {
                const seconds = Math.floor(line.first_departure_time / 1000);
                setTimeValue(seconds);

                // Log the time value being set
                console.log("Setting time value:", seconds);
                console.log("Time in HH:MM:", new Date(seconds * 1000).toLocaleTimeString());
            }

            // Set selected stations
            if (line.stations && line.stations.length > 0) {
                // Sort stations by sequence
                const sortedStations = [...line.stations].sort((a, b) => a.sequence - b.sequence);

                setSelectedStations(
                    sortedStations.map(station => ({
                        station_id: station.station_id,
                        station_name: station.station_name,
                        sequence: station.sequence,
                        time_from_previous_station: station.sequence === 0 ? 0 : station.time_from_previous_station
                    }))
                );
            }
        }
    }, [isEditing, line, reset]);

    const handleTimeChange = (seconds) => {
        setTimeValue(seconds);

        // Log the time change for debugging
        console.log("Time changed to (seconds):", seconds);

        // Create a time-only Date object to display readable time
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        console.log(`Time selected: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    };

    const handleStationAdd = () => {
        if (!stationToAdd) return;

        // Find the selected station info
        const stationToAddObj = stations.find(station => station.id === stationToAdd);
        if (!stationToAddObj) return;

        // Check if station is already selected
        if (selectedStations.some(s => s.station_id === stationToAdd)) {
            toast.error('This station is already in the line');
            return;
        }

        // Add new station with next sequence
        setSelectedStations([
            ...selectedStations,
            {
                station_id: stationToAddObj.id,
                station_name: stationToAddObj.name,
                sequence: selectedStations.length,
                time_from_previous_station: selectedStations.length === 0 ? 0 : 5 // Default 5 minutes from previous
            }
        ]);

        // Reset selection
        setStationToAdd('');
    };

    const handleStationRemove = (index) => {
        const newStations = [...selectedStations];
        newStations.splice(index, 1);

        // Resequence stations after removal
        const resequenced = newStations.map((station, idx) => ({
            ...station,
            sequence: idx
        }));

        setSelectedStations(resequenced);
    };

    const handleStationTimeChange = (index, minutes) => {
        const newStations = [...selectedStations];
        newStations[index] = {
            ...newStations[index],
            time_from_previous_station: minutes
        };
        setSelectedStations(newStations);
    };

    const moveStation = (fromIndex, toIndex) => {
        const newStations = [...selectedStations];
        const [movedStation] = newStations.splice(fromIndex, 1);
        newStations.splice(toIndex, 0, movedStation);

        // Resequence stations after reordering
        const resequenced = newStations.map((station, idx) => ({
            ...station,
            sequence: idx
        }));

        setSelectedStations(resequenced);
    };

    const onSubmit = async (data) => {
        // Validate stations
        if (selectedStations.length < 2) {
            toast.error('A metro line must have at least two stations');
            return;
        }

        // Log time information for debugging
        console.log("Time from picker (seconds):", timeValue);

        // Create a time-only Date object for better time calculation
        const hours = Math.floor(timeValue / 3600);
        const minutes = Math.floor((timeValue % 3600) / 60);
        console.log(`Time in HH:MM: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);

        // Calculate milliseconds for API
        const timeInMilliseconds = timeValue * 1000;
        console.log("Time in milliseconds:", timeInMilliseconds);

        // Verify with a date object
        const timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);
        console.log("Time as Date object:", timeDate);
        console.log("Readable time:", timeDate.toLocaleTimeString());

        // Prepare line data
        const lineData = {
            name: data.name,
            first_departure_time: timeInMilliseconds, // Convert seconds to milliseconds
            frequency: data.frequency,
            status: data.status,
            stations: selectedStations.map(s => ({
                station_id: s.station_id,
                station_name: s.station_name,
                sequence: s.sequence,
                time_from_previous_station: s.time_from_previous_station
            }))
        };

        // Log the final data being sent
        console.log("Creating line with data:", lineData);

        try {
            if (isEditing) {
                await updateLine({ id, ...lineData }).unwrap();
                toast.success('Metro line updated successfully');
            } else {
                await createLine(lineData).unwrap();
                toast.success('Metro line created successfully');
            }

            // Navigate back to line list
            navigate('/operator/lines');
        } catch (err) {
            console.error("Error details:", err);
            toast.error(`Failed to ${isEditing ? 'update' : 'create'} line: ${err.data?.message || 'Unknown error'}`);
        }
    };

    const handleCancel = () => {
        navigate('/operator/lines');
    };

    if (lineLoading && isEditing) {
        return (
            <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <Card>
            <Card.Header>
                <h4>{isEditing ? 'Edit Metro Line' : 'Create New Metro Line'}</h4>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="lineName">
                                <Form.Label>Line Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g., Line 1"
                                    isInvalid={!!errors.name}
                                    {...register('name', { required: 'Line name is required' })}
                                />
                                {errors.name && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.name.message}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="lineStatus">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    isInvalid={!!errors.status}
                                    {...register('status', { required: 'Status is required' })}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="EMERGENCY">Emergency</option>
                                </Form.Select>
                                {errors.status && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.status.message}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="firstDepartureTime">
                                <Form.Label>First Departure Time</Form.Label>
                                {/* Use TimePicker with our custom state */}
                                <TimePicker
                                    start="05:00"
                                    end="23:00"
                                    step={30}
                                    format={24}
                                    value={timeValue}
                                    onChange={handleTimeChange}
                                />
                                <div className="text-muted mt-1">
                                    Selected time: {Math.floor(timeValue / 3600).toString().padStart(2, '0')}:
                                    {Math.floor((timeValue % 3600) / 60).toString().padStart(2, '0')}
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="frequency">
                                <Form.Label>Train Frequency (minutes)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max="60"
                                    placeholder="e.g., 10"
                                    isInvalid={!!errors.frequency}
                                    {...register('frequency', {
                                        required: 'Frequency is required',
                                        min: { value: 1, message: 'Frequency must be at least 1 minute' },
                                        max: { value: 60, message: 'Frequency must not exceed 60 minutes' }
                                    })}
                                />
                                {errors.frequency && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.frequency.message}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Card className="mb-4">
                        <Card.Header>
                            <h5>Stations</h5>
                            <div className="text-muted">Drag stations to reorder</div>
                        </Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col>
                                    <InputGroup>
                                        <Form.Select
                                            value={stationToAdd}
                                            onChange={(e) => setStationToAdd(e.target.value)}
                                            disabled={stationsLoading}
                                        >
                                            <option value="">Select a station to add...</option>
                                            {stations?.map((station) => (
                                                <option key={station.id} value={station.id}>
                                                    {station.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Button
                                            variant="outline-primary"
                                            onClick={handleStationAdd}
                                            disabled={!stationToAdd || stationsLoading}
                                        >
                                            <FaPlus className="me-1" /> Add
                                        </Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            {stationsLoading ? (
                                <div className="text-center py-3">
                                    <Spinner animation="border" role="status" size="sm" />
                                    <span className="ms-2">Loading stations...</span>
                                </div>
                            ) : selectedStations.length > 0 ? (
                                <DndProvider backend={HTML5Backend}>
                                    <Table responsive className="align-middle">
                                        <thead>
                                        <tr>
                                            <th>Sequence</th>
                                            <th>Station Name</th>
                                            <th>Minutes from Previous</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {selectedStations.map((station, index) => (
                                            <DraggableStationItem
                                                key={`station-${station.station_id || index}`}
                                                station={station}
                                                index={index}
                                                moveStation={moveStation}
                                                onRemove={handleStationRemove}
                                                onTimeChange={handleStationTimeChange}
                                            />
                                        ))}
                                        </tbody>
                                    </Table>
                                </DndProvider>
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <FaExclamationTriangle className="mb-2" size={24} />
                                    <p>No stations added to this line yet.</p>
                                    <p>A metro line must have at least two stations.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-end gap-2">
                        <Button
                            variant="secondary"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            <FaTimes className="me-1" /> Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    {isEditing ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <FaSave className="me-1" /> {isEditing ? 'Update' : 'Create'} Line
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default LineForm;