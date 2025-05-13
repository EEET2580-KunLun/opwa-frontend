import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaExclamationTriangle, FaMapMarkerAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGetLineByIdQuery } from '../store/lineApiSlice.js';

// This is needed because Leaflet's default marker images are loaded relative to the CSS file
// but in Vite/Webpack these paths are different
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

// Custom marker icons
const startIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const endIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const intermediateIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const LineMap = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mapCenter, setMapCenter] = useState([10.7769, 106.7009]); // Default to Ho Chi Minh City
    const [zoom, setZoom] = useState(12);
    const [stationsWithCoords, setStationsWithCoords] = useState([]);

    const {
        data: line,
        isLoading,
        error
    } = useGetLineByIdQuery(id);

    useEffect(() => {
        if (line && line.stations && line.stations.length > 0) {
            // Filter stations that have coordinates
            // Changed property names to match snake_case in backend
            const stationsWithValidCoords = line.stations
                .filter(station => station.location && station.location.length >= 2)
                .sort((a, b) => a.sequence - b.sequence)
                .map(station => ({
                    ...station,
                    // Extract latitude and longitude from location array [longitude, latitude]
                    longitude: station.location[0],
                    latitude: station.location[1]
                }));

            setStationsWithCoords(stationsWithValidCoords);

            // If stations have coordinates, center the map on the first station
            if (stationsWithValidCoords.length > 0) {
                const firstStation = stationsWithValidCoords[0];
                setMapCenter([firstStation.latitude, firstStation.longitude]);
            }
        }
    }, [line]);

    const handleGoBack = () => {
        navigate('/operator/lines');
    };

    const getMarkerIcon = (index, total) => {
        if (index === 0) {
            return startIcon;
        } else if (index === total - 1) {
            return endIcon;
        } else {
            return intermediateIcon;
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-danger">
                <Card.Body className="text-center">
                    <Card.Title className="text-danger">
                        <FaExclamationTriangle className="me-2" />
                        Error Loading Metro Line
                    </Card.Title>
                    <Card.Text>
                        {error.data?.message || 'Could not load the metro line. Please try again.'}
                    </Card.Text>
                    <Button variant="primary" onClick={handleGoBack}>
                        <FaArrowLeft className="me-2" /> Back to Line List
                    </Button>
                </Card.Body>
            </Card>
        );
    }

    const totalStations = stationsWithCoords.length;

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <FaMapMarkerAlt className="me-2 text-danger" />
                    <h4 className="mb-0">{line?.name} - Map View</h4>
                </div>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleGoBack}
                >
                    <FaArrowLeft className="me-1" /> Back
                </Button>
            </Card.Header>

            <Card.Body>
                {stationsWithCoords.length === 0 ? (
                    <Alert variant="warning">
                        <FaExclamationTriangle className="me-2" />
                        No station coordinates available for this line. Please update station information to add geographical coordinates.
                    </Alert>
                ) : (
                    <>
                        <div className="mb-3">
                            <div className="d-flex flex-wrap gap-3 mb-2">
                                <div className="d-flex align-items-center">
                                    <div style={{ width: 15, height: 15, backgroundColor: 'green', borderRadius: '50%' }} className="me-2"></div>
                                    <span>Start Station: {stationsWithCoords[0]?.station_name}</span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div style={{ width: 15, height: 15, backgroundColor: 'red', borderRadius: '50%' }} className="me-2"></div>
                                    <span>End Station: {stationsWithCoords[totalStations - 1]?.station_name}</span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div style={{ width: 15, height: 15, backgroundColor: 'blue', borderRadius: '50%' }} className="me-2"></div>
                                    <span>Intermediate Stations</span>
                                </div>
                            </div>
                            <small className="text-muted">Total stations with coordinates: {totalStations}</small>
                        </div>

                        <div style={{ height: '500px', width: '100%' }}>
                            <MapContainer
                                center={mapCenter}
                                zoom={zoom}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {stationsWithCoords.map((station, index) => (
                                    <Marker
                                        key={station.station_id || index}
                                        position={[station.latitude, station.longitude]}
                                        icon={getMarkerIcon(index, totalStations)}
                                    >
                                        <Tooltip permanent={index === 0 || index === totalStations - 1}>
                                            {station.station_name}
                                        </Tooltip>
                                        <Popup>
                                            <div>
                                                <strong>{station.station_name}</strong><br />
                                                Sequence: {station.sequence + 1}<br />
                                                {index > 0 && (
                                                    <>Time from previous: {station.time_from_previous_station?.minutes || station.time_from_previous_station || 'N/A'} minutes<br /></>
                                                )}
                                                Coordinates: [{station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}]
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default LineMap;