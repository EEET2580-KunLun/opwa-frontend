import React, { useState, useMemo } from 'react';
import {
    FormGroup,
    FormControlLabel,
    Checkbox,
    TextField,
    Typography,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';

// Helper function to get ONE_WAY price based on station count
const getOneWayPrice = (count) => {
    if (count <= 4) return 8000;
    if (count <= 8) return 12000;
    return 20000; // above 8 stations
};

// Helper function to get ONE_WAY name based on station count
const getOneWayName = (count) => {
    if (count <= 4) return "One-way Ticket up to 4 stations";
    if (count <= 8) return "One-way Ticket up to 8 stations";
    return "One-way Ticket above 8 stations";
};

// Helper to extract the base ticket type from the API key format
const getBaseType = (key) => {
    // Key format is "TYPE-INDEX", we just want "TYPE"
    return key.split('-')[0];
};

export default function TicketTypeSelector({ types, items, onChange }) {
    console.log('Received types:', types);

    // Get unique ticket types, merging ONE_WAY variants
    const uniqueTypes = useMemo(() => {
        const typeMap = {};
        
        if (!types || !types.length) {
            console.error('No ticket types received');
            return [];
        }
        
        types.forEach(type => {
            // Extract the base type from the key (e.g., "ONE_WAY-0" -> "ONE_WAY")
            const baseType = getBaseType(type.key);
            
            // Skip additional ONE_WAY types if we already have one
            if (baseType === 'ONE_WAY' && typeMap['ONE_WAY']) {
                return;
            }
            
            // Store by base type to consolidate ONE_WAY variants
            typeMap[baseType] = {
                ...type,
                type: baseType, // Add the base type as a property
                uniqueKey: baseType // Use base type as the unique key
            };
        });
        
        const result = Object.values(typeMap);
        console.log('Unique types after processing:', result);
        return result;
    }, [types]);
    
    // Station counts state for ONE_WAY tickets
    const [stationCounts, setStationCounts] = useState({});
    
    // Handle station count change
    const handleStationCountChange = (typeKey, count) => {
        const newCounts = { ...stationCounts, [typeKey]: count };
        setStationCounts(newCounts);
        
        // Find existing item for this type
        const item = items.find(i => i.typeKey === typeKey);
        if (item) {
            // Update with new price and name based on station count
            const price = getOneWayPrice(count);
            const name = getOneWayName(count);
            onChange(typeKey, item.quantity, { stationCount: count, price, name });
        }
    };

    return (
        <FormGroup>
            {uniqueTypes.map(type => {
                const typeKey = type.type; // Use the extracted base type
                const item = items.find(i => i.typeKey === typeKey);
                const checked = Boolean(item);
                const qty = item?.quantity || 0;
                const isOneWay = typeKey === 'ONE_WAY';
                
                // For ONE_WAY, get the appropriate station count
                const stationCount = stationCounts[typeKey] || 4; // Default to 4
                
                // Calculate actual price for ONE_WAY based on station count
                const displayPrice = isOneWay ? getOneWayPrice(stationCount) : type.price;

                return (
                    <Box 
                        key={`ticket-type-${typeKey}`} 
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={checked}
                                    onChange={e => {
                                        // When checking a ONE_WAY ticket, pass stationCount and dynamic price
                                        if (isOneWay && e.target.checked) {
                                            const count = stationCount || 4;
                                            const price = getOneWayPrice(count);
                                            const name = getOneWayName(count);
                                            onChange(typeKey, 1, { stationCount: count, price, name });
                                        } else {
                                            onChange(typeKey, e.target.checked ? 1 : 0);
                                        }
                                    }}
                                />
                            }
                            label={isOneWay ? "One-way Ticket" : type.name}
                        />

                        {/* Station count selector for ONE_WAY tickets */}
                        {checked && isOneWay && (
                            <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
                                <InputLabel>Stations</InputLabel>
                                <Select
                                    value={stationCount}
                                    label="Stations"
                                    onChange={(e) => handleStationCountChange(typeKey, e.target.value)}
                                >
                                    {[...Array(15)].map((_, i) => {
                                        const count = i + 1;
                                        return (
                                            <MenuItem key={`station-${count}`} value={count}>
                                                {count} - {getOneWayPrice(count).toLocaleString()} VND
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        )}

                        {checked && (
                            <TextField
                                size="small"
                                type="number"
                                label="Qty"
                                inputProps={{ min: 1 }}
                                value={qty}
                                onChange={e => {
                                    // For ONE_WAY tickets, pass station count with quantity change
                                    if (isOneWay) {
                                        const count = stationCount || 4;
                                        const price = getOneWayPrice(count);
                                        const name = getOneWayName(count);
                                        onChange(typeKey, parseInt(e.target.value, 10) || 1, { stationCount: count, price, name });
                                    } else {
                                        onChange(typeKey, parseInt(e.target.value, 10) || 1);
                                    }
                                }}
                                sx={{ width: 80, mx: 2 }}
                            />
                        )}

                        <Typography sx={{ ml: 'auto' }}>
                            Cost: {displayPrice.toLocaleString()} VND
                        </Typography>
                    </Box>
                );
            })}
        </FormGroup>
    );
}