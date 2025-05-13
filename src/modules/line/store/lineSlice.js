import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    lines: [],
    currentLine: null,
    lineSchedule: null,
    lineTrips: [],
    isLoading: false,
    error: null
};

const lineSlice = createSlice({
    name: 'line',
    initialState,
    reducers: {
        setLines: (state, action) => {
            state.lines = action.payload;
        },
        setCurrentLine: (state, action) => {
            state.currentLine = action.payload;
        },
        setLineSchedule: (state, action) => {
            state.lineSchedule = action.payload;
        },
        setLineTrips: (state, action) => {
            state.lineTrips = action.payload;
        },
        addLine: (state, action) => {
            state.lines.push(action.payload);
        },
        updateLineInList: (state, action) => {
            const index = state.lines.findIndex(line => line.id === action.payload.id);
            if (index !== -1) {
                state.lines[index] = action.payload;
            }
        },
        removeLine: (state, action) => {
            state.lines = state.lines.filter(line => line.id !== action.payload);
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearLineState: (state) => {
            state.currentLine = null;
            state.lineSchedule = null;
            state.lineTrips = [];
        }
    }
});

export const {
    setLines,
    setCurrentLine,
    setLineSchedule,
    setLineTrips,
    addLine,
    updateLineInList,
    removeLine,
    setLoading,
    setError,
    clearLineState
} = lineSlice.actions;

// Selectors
export const selectLines = state => state.line.lines;
export const selectCurrentLine = state => state.line.currentLine;
export const selectLineSchedule = state => state.line.lineSchedule;
export const selectLineTrips = state => state.line.lineTrips;
export const selectLineLoading = state => state.line.isLoading;
export const selectLineError = state => state.line.error;

export default lineSlice.reducer;