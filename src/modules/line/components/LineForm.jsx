import React, {useState, useEffect, useRef} from 'react';
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
import {
    nameValidationRules,
    statusValidationRules,
    frequencyValidationRules,
    stationsValidationRules } from '../util/validationUtils'

const LineForm = () => {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();
    const originalNameRef = useRef("");
    const [dropPosition, setDropPosition] = useState(null); // Track drop position

    const [selectedStations, setSelectedStations] = useState([]);
    const [stationToAdd, setStationToAdd] = useState('');
    const [timeValue, setTimeValue] = useState(36000); // Default to 10:00 AM (36000 seconds)

    const {
        register,
        handleSubmit,
        control,
        setValue,
        trigger,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            name: '',
            frequency: 10,
            status: 'ACTIVE',
            stations: []
        },
        mode: 'onBlur',
    });

    const { data: stations, isLoading: stationsLoading } = useGetStationsQuery()
    const { data: line, isLoading: lineLoading } = useGetLineByIdQuery(id, { skip: !isEditing })
    const [createLine, { isLoading: isCreating }] = useCreateLineMutation()
    const [updateLine, { isLoading: isUpdating }] = useUpdateLineMutation()
    const isLoading = stationsLoading || lineLoading || isCreating || isUpdating

    // Load line data into form when editing
    useEffect(() => {
        if (isEditing && line) {
            originalNameRef.current = line.name
            reset({
                name: line.name,
                frequency: line.frequency,
                status: line.status,
                stations: [] // will be overwritten by selectedStations effect
            });

            // Convert milliseconds to seconds for TimePicker
            if (line.first_departure_time) {
                const seconds = Math.floor(line.first_departure_time / 1000);
                setTimeValue(seconds);

                // Log the time value being set
                console.log("Setting time value:", seconds);
                console.log("Time in HH:MM:", new Date(seconds * 1000).toLocaleTimeString());
            }

            if (line.stations) {
                const sorted = [...line.stations].sort((a, b) => a.sequence - b.sequence)
                setSelectedStations(
                    sorted.map((s, idx) => ({
                        station_id: s.station_id,
                        station_name: s.station_name,
                        sequence: idx,
                        time_from_previous_station:
                            idx === 0
                                ? 0
                                : typeof s.time_from_previous_station === 'string' &&
                                s.time_from_previous_station.startsWith('PT')
                                    ? parseInt(s.time_from_previous_station.replace(/\D/g, ''), 10)
                                    : parseInt(s.time_from_previous_station, 10) || 5
                    }))
                )
            }
        }
    }, [isEditing, line, reset]);

    useEffect(() => {
        // Tell RHF that the hidden "stations" field is now our latest array
        setValue('stations', selectedStations, { shouldValidate: true })
        // Immediately re-run its validation rule
        trigger('stations')
    }, [selectedStations, setValue, trigger])

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

    // Modified moveStation function for insertion instead of swapping
    const moveStation = (fromIndex, toIndex) => {
        const newStations = [...selectedStations];
        const [movedItem] = newStations.splice(fromIndex, 1);

        // Insert at the target position
        newStations.splice(toIndex, 0, movedItem);

        // Resequence after reordering
        const resequenced = newStations.map((station, idx) => ({
            ...station,
            sequence: idx
        }));

        setSelectedStations(resequenced);
        setDropPosition(null); // Reset drop indicator
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
                time_from_previous_station: `PT${s.time_from_previous_station}M`
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

    // Updated DraggableStationItem component with drop indicators
    const DraggableStationItem = ({ station, index, moveStation, onRemove, onTimeChange }) => {
        const [{ isDragging }, drag] = useDrag({
            type: 'STATION',
            item: { index },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
            end: () => setDropPosition(null) // Clear indicator when drag ends
        });

        const [{ isOver }, drop] = useDrop({
            accept: 'STATION',
            hover: (draggedItem, monitor) => {
                if (draggedItem.index === index) return;

                // Determine if hovering in the upper or lower half of the row
                const hoverBoundingRect = ref.current?.getBoundingClientRect();
                if (!hoverBoundingRect) return;

                const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
                const clientOffset = monitor.getClientOffset();
                const hoverClientY = clientOffset.y - hoverBoundingRect.top;

                // Only perform the move when the mouse crosses the middle of the row
                if (draggedItem.index < index && hoverClientY < hoverMiddleY) return;
                if (draggedItem.index > index && hoverClientY > hoverMiddleY) return;

                // Set the position where we want to show the drop indicator
                setDropPosition(hoverClientY < hoverMiddleY ? index : index + 1);
            },
            drop: (draggedItem) => {
                if (draggedItem.index === index) return;
                moveStation(draggedItem.index, dropPosition);
            },
            collect: (monitor) => ({
                isOver: monitor.isOver()
            })
        });

        const ref = useRef(null);

        return (
            <>
                {dropPosition === index && (
                    <tr className="drop-indicator">
                        <td colSpan="4">
                            <div className="drop-line" style={{
                                height: '3px',
                                backgroundColor: '#007bff',
                                width: '100%',
                                margin: '0'
                            }}></div>
                        </td>
                    </tr>
                )}
                <tr
                    ref={(node) => {
                        ref.current = node;
                        drag(drop(node));
                    }}
                    style={{
                        opacity: isDragging ? 0.5 : 1,
                        cursor: 'move',
                        backgroundColor: isOver ? 'rgba(0,123,255,0.1)' : 'transparent'
                    }}
                >
                    <td>{index + 1}</td>
                    <td>{station.station_name}</td>
                    <td>
                        <Form.Control
                            type="number"
                            min="1"
                            disabled={index === 0}
                            value={index === 0 ? 0 : station.time_from_previous_station}
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
                {dropPosition === index + 1 && (
                    <tr className="drop-indicator">
                        <td colSpan="4">
                            <div className="drop-line" style={{
                                height: '3px',
                                backgroundColor: '#007bff',
                                width: '100%',
                                margin: '0'
                            }}></div>
                        </td>
                    </tr>
                )}
            </>
        );
    };

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
                                    {...register('name', nameValidationRules(originalNameRef.current))}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.name?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="lineStatus">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    isInvalid={!!errors.status}
                                    {...register('status', statusValidationRules)}
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
                                    isValid={!!errors.frequency}
                                    placeholder="e.g., 10"
                                    isInvalid={!!errors.frequency}
                                    {...register('frequency', frequencyValidationRules)}
                                />
                                {errors.frequency && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.frequency.message}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* hidden controller for stations validation */}
                    <Controller
                        name="stations"
                        control={control}
                        rules={stationsValidationRules}
                        render={() => null}
                    />

                    <Card className="mb-4">
                        <Card.Header>
                            <h5>Stations</h5>
                            <div className="text-muted">Drag stations to reorder</div>
                        </Card.Header>
                        <Card.Body>
                            {errors.stations && (
                                <div className="text-danger mb-2">
                                    {errors.stations.message}
                                </div>
                            )}

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
                        <Button variant="primary" type="submit" disabled={isLoading}>
                            {isLoading
                                ? <Spinner as="span" animation="border" size="sm" />
                                : <FaSave />}
                            {isEditing ? ' Update' : ' Create'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default LineForm;