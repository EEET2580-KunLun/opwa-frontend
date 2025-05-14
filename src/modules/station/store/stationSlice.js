import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    stations: [],
    currentStation: null,
    isLoading: false,
    error: null
};

const stationSlice = createSlice({
    name: 'station',
    initialState,
    reducers: {
        setStations: (state, action) => {
            state.stations = action.payload;
        },
        setCurrentStation: (state, action) => {
            state.currentStation = action.payload;
        },
        addStation: (state, action) => {
            state.stations.push(action.payload);
        },
        updateStationInList: (state, action) => {
            const index = state.stations.findIndex(station => station.id === action.payload.id);
            if (index !== -1) {
                state.stations[index] = action.payload;
            }
        },
        removeStation: (state, action) => {
            state.stations = state.stations.filter(station => station.id !== action.payload);
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setStations,
    setCurrentStation,
    addStation,
    updateStationInList,
    removeStation,
    setLoading,
    setError
} = stationSlice.actions;

export const selectStations = state => state.station.stations;
export const selectCurrentStation = state => state.station.currentStation;
export const selectStationLoading = state => state.station.isLoading;
export const selectStationError = state => state.station.error;

export default stationSlice.reducer;