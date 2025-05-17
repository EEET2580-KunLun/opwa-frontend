import React, {useEffect, useRef, useMemo, useState} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSelector } from 'react-redux';
import { selectLines } from "../line/store/lineSlice.js";

const getLineColor = (index, lineId) => {
    const colors = [
        '#FF5733', // Orange-red
        '#33FF57', // Bright green
        '#3357FF', // Blue
        '#F033FF', // Purple
        '#FF33A8', // Pink
        '#33FFF6', // Cyan
        '#FFD433', // Yellow
        '#8C33FF', // Violet
        '#FF8C33', // Orange
        '#33FFBD'  // Mint
    ];

    // Use array index as primary method to assign colors
    if (typeof index === 'number' && index >= 0) {
        return colors[index % colors.length];
    }

    // Fallback to ID-based method only if needed
    if (typeof lineId === 'string') {
        let sum = 0;
        for (let i = 0; i < lineId.length; i++) {
            sum += lineId.charCodeAt(i);
        }
        return colors[sum % colors.length];
    }

    return colors[0];
};

export default function MapComponent({ isStationMode=false ,selectedTrip = null, selectedStationLoc = null}) {
    const lines = useSelector(selectLines);
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);
    const [mapInitialized, setMapInitialized] = useState(false);

    // Station Mode, move current location to selected station
    useEffect(() => {
        if (map.current && isStationMode && selectedStationLoc) {
            console.log("Flying to selected station location:", selectedStationLoc);
            map.current.flyTo({
                center: selectedStationLoc,
                zoom: 15,
                speed: 0.5
            });
        }
    } , [isStationMode, selectedStationLoc]);

    // Create GeoJSON for each line
    const lineGeoJSONs = useMemo(() => {
        if (!lines || !Array.isArray(lines)) {
            return [];
        }

        return lines.map((line, index) => {
            if (!line.stations || !Array.isArray(line.stations) || line.stations.length < 2) {
                return null;
            }

            const sortedStations = [...line.stations].sort((a, b) => a.sequence - b.sequence);
            const coordinates = sortedStations
                .map(station => station.location)
                .filter(location => Array.isArray(location) && location.length === 2);

            if (coordinates.length < 2) {
                return null;
            }

            // Use index-based color assignment to ensure unique colors
            const lineColor = getLineColor(index, line.id);
            console.log(`Line ${index}: ${line.name}, ID: ${line.id}, Color: ${lineColor}`);

            return {
                type: 'Feature',
                properties: {
                    id: line.id,
                    name: line.name,
                    color: lineColor,
                    index: index // Store index for reference
                },
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                }
            };
        }).filter(Boolean);
    }, [lines]);


    // Extract all stations and count how many lines use each station
    const stationData = useMemo(() => {
        if (!lines || !Array.isArray(lines)) {
            return [];
        }

        const stationMap = new Map();

        // Track which lines use each station
        lines.forEach((line, index) => {
            if (!line.stations || !Array.isArray(line.stations)) return;

            const sortedStations = [...line.stations].sort((a, b) => a.sequence - b.sequence);
            const startStation = sortedStations[0];
            const endStation = sortedStations[sortedStations.length - 1];

            // Use the index-based color here too
            const lineColor = getLineColor(index, line.id);

            sortedStations.forEach(station => {
                if (!station.station_id || !station.location) return;

                const isStartOrEnd = (station.station_id === startStation?.station_id ||
                    station.station_id === endStation?.station_id);

                if (!stationMap.has(station.station_id)) {
                    stationMap.set(station.station_id, {
                        id: station.station_id,
                        name: station.station_name,
                        location: station.location,
                        lines: [{
                            id: line.id,
                            name: line.name,
                            color: lineColor,
                            isStart: station.station_id === startStation?.station_id,
                            isEnd: station.station_id === endStation?.station_id
                        }],
                        isEndpoint: isStartOrEnd
                    });
                } else {
                    const stationInfo = stationMap.get(station.station_id);
                    stationInfo.lines.push({
                        id: line.id,
                        name: line.name,
                        color: lineColor,
                        isStart: station.station_id === startStation?.station_id,
                        isEnd: station.station_id === endStation?.station_id
                    });
                    stationInfo.isEndpoint = stationInfo.isEndpoint || isStartOrEnd;
                }
            });
        });

        return Array.from(stationMap.values());
    }, [lines]);
    // Initialize map
    useEffect(() => {
        if (map.current) return; // Map already initialized

        try {
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: 'https://api.maptiler.com/maps/basic-v2/style.json?key=Jww0Ox5st1lhwcL9M0Lz',
                center: [106.69808516948363, 10.772759203806952],
                zoom: 12
            });

            // Add navigation controls
            map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
            map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
            map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

            map.current.on('load', () => {
                setMapInitialized(true);
            });
        } catch (error) {
            console.error("Error initializing map:", error);
        }

        return () => {
            if (map.current) {
                // Clean up markers
                markersRef.current.forEach(marker => marker.remove());
                markersRef.current = [];

                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Add lines to the map
    useEffect(() => {
        if (!mapInitialized || !map.current || lineGeoJSONs.length === 0) return;

        try {
            // Remove existing line layers and sources
            const style = map.current.getStyle();
            if (style && style.layers) {
                style.layers.forEach(layer => {
                    if (layer.id.startsWith('line-layer-')) {
                        map.current.removeLayer(layer.id);
                    }
                });
            }

            if (style && style.sources) {
                Object.keys(style.sources).forEach(source => {
                    if (source.startsWith('line-')) {
                        map.current.removeSource(source);
                    }
                });
            }

            // Add new line layers and sources
            lineGeoJSONs.forEach(line => {
                const sourceId = `line-${line.properties.id}`;
                const layerId = `line-layer-${line.properties.id}`;

                map.current.addSource(sourceId, {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [line]
                    }
                });

                // Make sure we have a valid color - provide a default if undefined
                const lineColor = line.properties.color || '#FF5733';

                // Debug logging
                console.log(`Adding layer ${layerId} with color ${lineColor}`);

                map.current.addLayer({
                    id: layerId,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': lineColor,
                        'line-width': 5,
                        'line-opacity': selectedTrip ?
                            (selectedTrip.id === line.properties.id ? 1 : 0.4) : 1
                    }
                });
            });
        } catch (error) {
            console.error("Error adding lines to map:", error);
        }
    }, [lineGeoJSONs, mapInitialized, selectedTrip]);

    // Add station markers
    useEffect(() => {
        if (!mapInitialized || !map.current || stationData.length === 0) return;

        try {
            // Remove existing markers
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];

            // Add new markers
            stationData.forEach(station => {
                if (!station.location || !Array.isArray(station.location) || station.location.length !== 2) {
                    return;
                }

                // Calculate circle size based on number of lines
                // that use this station (min 14px, max 28px)
                const baseSize = 14;
                const sizeIncrease = 4;
                const lineCount = station.lines.length;
                const circleSize = Math.min(baseSize + (lineCount - 1) * sizeIncrease, 28);

                // Filter for selected trip if any
                const relevantLines = selectedTrip
                    ? station.lines.filter(line => line.id === selectedTrip.id)
                    : station.lines;

                if (selectedTrip && relevantLines.length === 0) {
                    // Skip stations not on the selected line
                    return;
                }

                // Create the marker element
                const el = document.createElement('div');
                el.className = 'station-marker';
                el.style.position = 'relative';

                // Create the circle
                const circle = document.createElement('div');
                circle.style.width = `${circleSize}px`;
                circle.style.height = `${circleSize}px`;
                circle.style.borderRadius = '50%';
                circle.style.backgroundColor = 'white';
                circle.style.border = '2px solid #333';
                circle.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                circle.style.position = 'absolute';
                circle.style.left = '50%';
                circle.style.top = '50%';
                circle.style.transform = 'translate(-50%, -50%)';

                // Check if this is a start/end station for any line
                const endpointInfo = station.lines.find(line => line.isStart || line.isEnd);

                if (endpointInfo) {
                    circle.style.backgroundColor = endpointInfo.color;
                    circle.style.borderColor = 'white';
                }

                el.appendChild(circle);

                // Create the label with station name
                const label = document.createElement('div');
                label.textContent = station.name;
                label.style.position = 'absolute';
                label.style.top = '100%';
                label.style.left = '50%';
                label.style.transform = 'translateX(-50%)';
                label.style.marginTop = '4px';
                label.style.whiteSpace = 'nowrap';
                label.style.fontSize = '12px';
                label.style.fontWeight = 'bold';
                label.style.padding = '3px 6px';
                label.style.borderRadius = '3px';

                if (station.isEndpoint) {
                    label.style.backgroundColor = 'rgba(0,0,0,0.7)';
                    label.style.color = 'white';
                } else {
                    label.style.backgroundColor = 'white';
                    label.style.color = '#333';
                    label.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
                }

                el.appendChild(label);

                const marker = new maplibregl.Marker({
                    element: el,
                    anchor: 'bottom'
                })
                    .setLngLat(station.location)
                    .addTo(map.current);

                markersRef.current.push(marker);
            });
        } catch (error) {
            console.error("Error adding station markers to map:", error);
        }
    }, [stationData, selectedTrip, mapInitialized]);

    return (
        <div ref={mapContainer} style={{width: '100%', height: '750px', borderRadius: '8px'}}/>
    );
}