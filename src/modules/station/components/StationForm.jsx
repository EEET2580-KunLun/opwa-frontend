import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Grid,
    FormControlLabel,
    Switch,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
    useCreateStationMutation,
    useUpdateStationMutation,
    useFetchStationByIdQuery
} from '../store/stationApiSlice';
import {
    validateStationName,
    validateAddress,
    validateLocation
} from '../util/validationUtils';

const StationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    // Station form state
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        isActive: true,
        longitude: '',
        latitude: ''
    });

    // Validation errors
    const [errors, setErrors] = useState({});

    // Notification state
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    // Fetch station data if editing
    const { data: stationData, isLoading: isFetchingStation } = useFetchStationByIdQuery(
        id, { skip: !isEditMode }
    );

    // Mutations
    const [createStation, { isLoading: isCreating }] = useCreateStationMutation();
    const [updateStation, { isLoading: isUpdating }] = useUpdateStationMutation();

    // Set form data when station data is fetched (for edit mode)
    useEffect(() => {
        if (isEditMode && stationData?.data) {
            const station = stationData.data;
            setFormData({
                name: station.name || '',
                address: station.address || '',
                isActive: station.is_active,
                longitude: station.location ? station.location[0].toString() : '',
                latitude: station.location ? station.location[1].toString() : ''
            });
        }
    }, [isEditMode, stationData]);

    // Input change handler
    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate all fields
    const validateForm = () => {
        const newErrors = {};

        // Validate name
        if (!validateStationName(formData.name)) {
            newErrors.name = 'Name must be between 2 and 100 characters';
        }

        // Validate address
        if (!validateAddress(formData.address)) {
            newErrors.address = 'Address must be between 5 and 200 characters';
        }

        // Validate location
        const longitude = parseFloat(formData.longitude);
        const latitude = parseFloat(formData.latitude);
        
        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
            newErrors.longitude = 'Longitude must be between -180 and 180';
        }
        
        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
            newErrors.latitude = 'Latitude must be between -90 and 90';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setNotification({
                open: true,
                message: 'Please fix the validation errors',
                severity: 'error'
            });
            return;
        }

        try {
            const stationData = {
                name: formData.name,
                address: formData.address,
                isActive: formData.isActive,
                location: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
            };

            let result;
            if (isEditMode) {
                result = await updateStation({ id, stationData }).unwrap();
                setNotification({
                    open: true,
                    message: 'Station updated successfully',
                    severity: 'success'
                });
            } else {
                result = await createStation(stationData).unwrap();
                setNotification({
                    open: true,
                    message: 'Station created successfully',
                    severity: 'success'
                });
            }

            // Navigate back to stations list after a short delay
            setTimeout(() => {
                navigate('/admin/stations');
            }, 1500);
        } catch (error) {
            console.error('Error saving station:', error);
            
            let errorMessage = 'Failed to save station';
            
            // Handle authentication errors
            if (error.status === 401) {
                errorMessage = 'Your session has expired. Please refresh the page or log in again.';
            } else if (error.data?.message) {
                errorMessage = error.data.message;
            }
            
            setNotification({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    // Cancel form
    const handleCancel = () => {
        navigate('/admin/stations');
    };

    // Close notification
    const handleCloseNotification = () => {
        setNotification(prev => ({
            ...prev,
            open: false
        }));
    };

    if (isEditMode && isFetchingStation) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {isEditMode ? 'Edit Station' : 'Create New Station'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Station Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                error={!!errors.name}
                                helperText={errors.name}
                                inputProps={{ maxLength: 100 }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                error={!!errors.address}
                                helperText={errors.address}
                                inputProps={{ maxLength: 200 }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Longitude"
                                name="longitude"
                                type="number"
                                value={formData.longitude}
                                onChange={handleInputChange}
                                error={!!errors.longitude}
                                helperText={errors.longitude || 'Enter a value between -180 and 180'}
                                inputProps={{
                                    step: 'any',
                                    min: -180,
                                    max: 180
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Latitude"
                                name="latitude"
                                type="number"
                                value={formData.latitude}
                                onChange={handleInputChange}
                                error={!!errors.latitude}
                                helperText={errors.latitude || 'Enter a value between -90 and 90'}
                                inputProps={{
                                    step: 'any',
                                    min: -90,
                                    max: 90
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        name="isActive"
                                        color="primary"
                                    />
                                }
                                label="Active Station"
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                disabled={isCreating || isUpdating}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isCreating || isUpdating}
                            >
                                {isCreating || isUpdating ? 'Saving...' : isEditMode ? 'Update Station' : 'Create Station'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default StationForm;