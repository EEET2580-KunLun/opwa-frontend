import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    Paper, 
    Button, 
    TextField,
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress,
    FormControlLabel,
    Switch
} from '@mui/material';
import { 
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFetchAllStationsQuery, useDeleteStationMutation } from '../store/stationApiSlice';
import { useDispatch } from 'react-redux';
import { setStations, removeStation } from '../store/stationSlice';
import MapComponent from "../../map/MapComponent.jsx";

const StationList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // State for filtering and pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [showActive, setShowActive] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // State for delete confirmation dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [stationToDelete, setStationToDelete] = useState(null);

    const [selectedStationLoc, setSelectedStationLoc] = useState(null);

    // Fetch stations
    const { data: stationsData, isLoading, isError, refetch } = useFetchAllStationsQuery();
    const [deleteStation, { isLoading: isDeleting }] = useDeleteStationMutation();

    // Store stations in Redux when data is fetched
    useEffect(() => {
        if (stationsData?.data) {
            dispatch(setStations(stationsData.data));
        }
    }, [stationsData, dispatch]);

    // Filter stations based on search query and active status
    const filteredStations = stationsData?.data?.filter(station => {
        const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            station.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = showActive ? station.active : true;
        return matchesSearch && matchesStatus;
    }) || [];


    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Delete handlers
    const handleDeleteClick = (station) => {
        setStationToDelete(station);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteStation(stationToDelete.id).unwrap();
            dispatch(removeStation(stationToDelete.id));
            setDeleteDialogOpen(false);
            setStationToDelete(null);
        } catch (error) {
            console.error('Failed to delete station:', error);
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setStationToDelete(null);
    };

    // Navigation handlers
    const handleCreateStation = () => {
        navigate('/admin/stations/create');
    };

    const handleEditStation = (id) => {
        navigate(`/admin/stations/${id}/edit`);
    };

    const handleViewOnMap = (station) => {
        setSelectedStationLoc(station.location);
    };


    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) {
        return (
            <Container>
                <Typography variant="h6" color="error" sx={{ p: 2 }}>
                    Error loading stations. Please try again later.
                </Typography>
                <Button variant="contained" onClick={refetch}>
                    Retry
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h2">
                        Stations
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        onClick={handleCreateStation}
                    >
                        Add Station
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            label="Search Stations"
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                            }}
                            sx={{ mr: 2 }}
                        />
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={showActive} 
                                    onChange={(e) => setShowActive(e.target.checked)} 
                                />
                            }
                            label="Show Active Only"
                        />
                    </Box>
                </Box>

                <TableContainer>
                    <Table size="medium">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Address</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Location [Long, Lat]</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStations
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((station) => (
                                    <TableRow key={station.id}>
                                        <TableCell>{station.name}</TableCell>
                                        <TableCell>{station.address}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={station.active ? "Active" : "Inactive"}
                                                color={station.active ? "success" : "default"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {station.location ? `[${station.location[0]}, ${station.location[1]}]` : 'N/A'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                aria-label="view on map"
                                                color="info"
                                                onClick={() => handleViewOnMap(station)}
                                                disabled={!station.location}
                                            >
                                                <LocationOnIcon />
                                            </IconButton>
                                            <IconButton
                                                aria-label="edit"
                                                color="primary"
                                                onClick={() => handleEditStation(station.id)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                aria-label="delete"
                                                color="error"
                                                onClick={() => handleDeleteClick(station)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {filteredStations.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No stations found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredStations.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirm Station Deletion"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete station "{stationToDelete?.name}"? 
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>Cancel</Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        color="error" 
                        autoFocus
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ mt: 4 }}>
                <MapComponent isStationMode={true} selectedStationLoc={selectedStationLoc} />
            </Box>
        </Container>
    );
};

export default StationList;