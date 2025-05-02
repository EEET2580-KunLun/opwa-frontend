import React, { useState, useRef, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Avatar,
    Grid,
    TextField,
    Button,
    CircularProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Snackbar,
    Alert,
    Divider,
} from '@mui/material';
import {
    Edit as EditIcon,
    PhotoCamera,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Visibility as VisibilityIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import {
    useFetchAllStaffMutation,
    useUpdateStaffMutation,
    useUploadStaffAvatarMutation,
    useDeleteStaffAvatarMutation
} from '../store/staffApiSlice.js';
import { validatePhone, validateAddress, validateFileSize, validateFileType } from '../util/validationUtils.js';

/**
 * Staff Profile Component
 *
 * Allows staff to view and edit their profile information based on Red Savina level requirements
 * Handles both basic profile viewing and editing functionality
 * Supports uploading and updating National ID images (front and back)
 */
const StaffProfile = () => {
    // Get current user from Redux state or local storage
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};

    // State for loading current profile
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [staffProfile, setStaffProfile] = useState(null);

    // Mutations
    const [fetchStaffById] = useFetchAllStaffMutation();
    const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
    const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadStaffAvatarMutation();
    const [deleteAvatar, { isLoading: isDeletingAvatar }] = useDeleteStaffAvatarMutation();

    // State for edit mode
    const [isEditMode, setIsEditMode] = useState(false);

    // State for notifications
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    // State for form data
    const [formData, setFormData] = useState({
        phoneNumber: '',
        number: '',
        street: '',
        ward: '',
        district: '',
        city: '',
    });

    // References for file inputs
    const frontIdInputRef = useRef(null);
    const backIdInputRef = useRef(null);
    const profilePhotoInputRef = useRef(null);

    // State for preview images
    const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
    const [frontIdPreview, setFrontIdPreview] = useState(null);
    const [backIdPreview, setBackIdPreview] = useState(null);

    // State for file data
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [frontIdImage, setFrontIdImage] = useState(null);
    const [backIdImage, setBackIdImage] = useState(null);

    // State for ID image dialog
    const [idImageDialog, setIdImageDialog] = useState({
        open: false,
        title: '',
        imageUrl: ''
    });

    // Form validation errors
    const [errors, setErrors] = useState({});

    // Fetch current staff profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser.id) return;

            setIsLoading(true);
            setIsError(false);

            try {
                const response = await fetchStaffById({ id: currentUser.id }).unwrap();
                if (response && response.data) {
                    setStaffProfile(response.data);
                } else {
                    setIsError(true);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [currentUser.id, fetchStaffById]);

    // Set form data when profile is loaded
    useEffect(() => {
        if (staffProfile) {
            // Extract address components
            const addressData = {
                number: '',
                street: '',
                ward: '',
                district: '',
                city: ''
            };

            if (staffProfile.residenceAddressEntity) {
                const address = staffProfile.residenceAddressEntity;
                addressData.number = address.number || '';
                addressData.street = address.street || '';
                addressData.ward = address.ward || '';
                addressData.district = address.district || '';
                addressData.city = address.city || '';
            }

            // Set form data
            setFormData({
                phoneNumber: staffProfile.phoneNumber || '',
                ...addressData
            });

            // Set avatar preview
            if (staffProfile.avatarUrl) {
                setProfilePhotoPreview(staffProfile.avatarUrl);
            }

            // Set National ID image previews if available
            if (staffProfile.nationalIdFrontImage) {
                setFrontIdPreview(staffProfile.nationalIdFrontImage);
            }

            if (staffProfile.nationalIdBackImage) {
                setBackIdPreview(staffProfile.nationalIdBackImage);
            }
        }
    }, [staffProfile]);

    /**
     * Handles input changes for text fields
     * @param {Object} e - Event object
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error for this field
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    /**
     * Validates the form data
     * @returns {boolean} - Whether the form is valid
     */
    const validateForm = () => {
        const newErrors = {};

        // Validate phone
        if (!validatePhone(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Phone must be 10 digits starting with 0';
        }

        // Validate address components
        if (!validateAddress(formData.number)) {
            newErrors.number = 'Address number is invalid';
        }

        if (!validateAddress(formData.street)) {
            newErrors.street = 'Street is invalid';
        }

        if (!validateAddress(formData.ward)) {
            newErrors.ward = 'Ward is invalid';
        }

        if (!validateAddress(formData.district)) {
            newErrors.district = 'District is invalid';
        }

        if (!validateAddress(formData.city)) {
            newErrors.city = 'City is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handles profile photo upload
     * @param {Object} e - Event object
     */
    const handleProfilePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!validateFileSize(file)) {
            setErrors({ ...errors, profilePhoto: 'Image must be less than 5MB' });
            return;
        }

        if (!validateFileType(file)) {
            setErrors({ ...errors, profilePhoto: 'Only JPEG and PNG images are allowed' });
            return;
        }

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setProfilePhotoPreview(previewUrl);
        setProfilePhoto(file);

        // Clear errors
        if (errors.profilePhoto) {
            setErrors({ ...errors, profilePhoto: '' });
        }
    };

    /**
     * Handles front ID image upload
     * @param {Object} e - Event object
     */
    const handleFrontIdUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!validateFileSize(file)) {
            setErrors({ ...errors, frontId: 'Image must be less than 5MB' });
            return;
        }

        if (!validateFileType(file)) {
            setErrors({ ...errors, frontId: 'Only JPEG and PNG images are allowed' });
            return;
        }

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setFrontIdPreview(previewUrl);
        setFrontIdImage(file);

        // Clear errors
        if (errors.frontId) {
            setErrors({ ...errors, frontId: '' });
        }
    };

    /**
     * Handles back ID image upload
     * @param {Object} e - Event object
     */
    const handleBackIdUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!validateFileSize(file)) {
            setErrors({ ...errors, backId: 'Image must be less than 5MB' });
            return;
        }

        if (!validateFileType(file)) {
            setErrors({ ...errors, backId: 'Only JPEG and PNG images are allowed' });
            return;
        }

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setBackIdPreview(previewUrl);
        setBackIdImage(file);

        // Clear errors
        if (errors.backId) {
            setErrors({ ...errors, backId: '' });
        }
    };

    /**
     * Handles form submission for profile update
     */
    const handleSubmit = async () => {
        if (!validateForm()) {
            setNotification({
                open: true,
                message: 'Please fix the validation errors',
                severity: 'error'
            });
            return;
        }

        if (!staffProfile || !staffProfile.id) {
            setNotification({
                open: true,
                message: 'Profile not found',
                severity: 'error'
            });
            return;
        }

        try {
            // Create updated staff data
            const updatedStaff = {
                ...staffProfile,
                phoneNumber: formData.phoneNumber,
                residenceAddressEntity: {
                    number: formData.number,
                    street: formData.street,
                    ward: formData.ward,
                    district: formData.district,
                    city: formData.city
                }
            };

            // Update staff profile
            const response = await updateStaff({
                id: staffProfile.id,
                staffData: updatedStaff
            }).unwrap();

            if (response && response.data) {
                setStaffProfile(response.data);

                // Handle avatar upload if needed
                if (profilePhoto) {
                    const formData = new FormData();
                    formData.append('file', profilePhoto);

                    const avatarResponse = await uploadAvatar({
                        staffId: staffProfile.id,
                        formData
                    }).unwrap();

                    if (avatarResponse && avatarResponse.data) {
                        // Update profile with new avatar URL
                        setStaffProfile(prevProfile => ({
                            ...prevProfile,
                            avatarUrl: avatarResponse.data.avatarUrl
                        }));
                    }
                }

                // National ID images would need a separate endpoint
                // This would be implemented in future updates

                setNotification({
                    open: true,
                    message: 'Profile updated successfully',
                    severity: 'success'
                });

                // Exit edit mode
                setIsEditMode(false);

                // Reset file inputs
                if (profilePhotoInputRef.current) {
                    profilePhotoInputRef.current.value = '';
                }
                setProfilePhoto(null);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setNotification({
                open: true,
                message: error.data?.message || 'Failed to update profile',
                severity: 'error'
            });
        }
    };

    /**
     * Cancels edit mode and resets form data
     */
    const handleCancelEdit = () => {
        // Reset form data from profile
        if (staffProfile) {
            const addressData = {
                number: '',
                street: '',
                ward: '',
                district: '',
                city: ''
            };

            if (staffProfile.residenceAddressEntity) {
                const address = staffProfile.residenceAddressEntity;
                addressData.number = address.number || '';
                addressData.street = address.street || '';
                addressData.ward = address.ward || '';
                addressData.district = address.district || '';
                addressData.city = address.city || '';
            }

            setFormData({
                phoneNumber: staffProfile.phoneNumber || '',
                ...addressData
            });
        }

        // Reset image states
        if (profilePhotoPreview && profilePhoto) {
            URL.revokeObjectURL(profilePhotoPreview);
            setProfilePhotoPreview(staffProfile?.avatarUrl || null);
        }

        if (frontIdPreview && frontIdImage) {
            URL.revokeObjectURL(frontIdPreview);
            setFrontIdPreview(staffProfile?.nationalIdFrontImage || null);
        }

        if (backIdPreview && backIdImage) {
            URL.revokeObjectURL(backIdPreview);
            setBackIdPreview(staffProfile?.nationalIdBackImage || null);
        }

        // Reset file states
        setProfilePhoto(null);
        setFrontIdImage(null);
        setBackIdImage(null);

        // Reset file inputs
        if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = '';
        if (frontIdInputRef.current) frontIdInputRef.current.value = '';
        if (backIdInputRef.current) backIdInputRef.current.value = '';

        // Clear errors
        setErrors({});

        // Exit edit mode
        setIsEditMode(false);
    };

    /**
     * Opens the ID image dialog
     */
    const handleOpenIdImageDialog = (title, imageUrl) => {
        setIdImageDialog({
            open: true,
            title,
            imageUrl
        });
    };

    /**
     * Closes the ID image dialog
     */
    const handleCloseIdImageDialog = () => {
        setIdImageDialog({
            ...idImageDialog,
            open: false
        });
    };

    /**
     * Closes notification
     */
    const handleCloseNotification = () => {
        setNotification({
            ...notification,
            open: false
        });
    };

    /**
     * Removes avatar
     */
    const handleRemoveAvatar = async () => {
        if (!staffProfile || !staffProfile.id) return;

        try {
            await deleteAvatar(staffProfile.id).unwrap();

            // Update local state
            setStaffProfile(prevProfile => ({
                ...prevProfile,
                avatarUrl: null
            }));

            setProfilePhotoPreview(null);

            setNotification({
                open: true,
                message: 'Avatar removed successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error removing avatar:', error);
            setNotification({
                open: true,
                message: error.data?.message || 'Failed to remove avatar',
                severity: 'error'
            });
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Show error state
    if (isError) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Typography color="error" variant="h6">
                    Error loading profile. Please try again later.
                </Typography>
            </Box>
        );
    }

    // Return null if profile not loaded
    if (!staffProfile) {
        return null;
    }

    // Get shift display text
    const getShiftDisplay = (shift) => {
        switch (shift) {
            case 'DAY':
                return 'Day: 06:00 AM – 02:00 PM';
            case 'EVENING':
                return 'Evening: 02:00 PM – 10:00 PM';
            case 'NIGHT':
                return 'Night: 10:00 PM – 06:00 AM';
            default:
                return shift;
        }
    };

    return (
        <Container maxWidth="lg">
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 2, md: 4 },
                    my: 4,
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <Typography
                    variant="h4"
                    component="h1"
                    align="center"
                    gutterBottom
                    sx={{
                        mb: 4,
                        color: '#1a3a7c',
                        fontWeight: 'bold'
                    }}
                >
                    My Profile
                </Typography>

                {/* Edit button - visible only in view mode */}
                {!isEditMode && (
                    <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditMode(true)}
                        >
                            Edit profile
                        </Button>
                    </Box>
                )}

                <Grid container spacing={4}>
                    {/* Left column - Profile picture & basic info */}
                    <Grid item xs={12} md={4}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                mb: 4
                            }}
                        >
                            {/* Profile picture with edit capability */}
                            <Box sx={{ position: 'relative', mb: 2 }}>
                                <Avatar
                                    src={profilePhotoPreview}
                                    alt={`${staffProfile.firstName} ${staffProfile.lastName}`}
                                    sx={{
                                        width: 150,
                                        height: 150,
                                        border: '2px solid #1976d2'
                                    }}
                                />
                                {isEditMode && (
                                    <Tooltip title="Change profile picture">
                                        <IconButton
                                            aria-label="upload profile picture"
                                            component="label"
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                },
                                            }}
                                        >
                                            <input
                                                ref={profilePhotoInputRef}
                                                hidden
                                                accept="image/jpeg,image/png"
                                                type="file"
                                                onChange={handleProfilePhotoUpload}
                                            />
                                            <PhotoCamera />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>

                            {/* Username display */}
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 'bold',
                                    mb: 1
                                }}
                            >
                                @{staffProfile.username || `${staffProfile.firstName.toLowerCase()}-${staffProfile.lastName.toLowerCase()}`}
                            </Typography>

                            {/* Role and shift display */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body1" color="text.secondary">
                                    Role: {staffProfile.role || 'N/A'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Shift: {getShiftDisplay(staffProfile.shift) || 'N/A'}
                                </Typography>
                            </Box>

                            {/* National ID section */}
                            <Box sx={{ width: '100%', mt: 4 }}>
                                <Typography variant="h6" gutterBottom>
                                    National ID
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Typography variant="body1">
                                    {staffProfile.nationalId || 'Not provided'}
                                </Typography>

                                {/* National ID images - to be implemented in the future */}
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                    National ID image upload will be available in a future update.
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right column - Profile details */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Personal Information
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Grid container spacing={3}>
                                {/* First Name */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        value={staffProfile.firstName || ''}
                                        InputProps={{ readOnly: true }}
                                        variant={isEditMode ? "outlined" : "filled"}
                                    />
                                </Grid>

                                {/* Last Name */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        value={staffProfile.lastName || ''}
                                        InputProps={{ readOnly: true }}
                                        variant={isEditMode ? "outlined" : "filled"}
                                    />
                                </Grid>

                                {/* Email */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        value={staffProfile.email || ''}
                                        InputProps={{ readOnly: true }}
                                        variant={isEditMode ? "outlined" : "filled"}
                                    />
                                </Grid>

                                {/* Phone */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        error={!!errors.phoneNumber}
                                        helperText={errors.phoneNumber}
                                        InputProps={{ readOnly: !isEditMode }}
                                        variant={isEditMode ? "outlined" : "filled"}
                                        placeholder="0921 123 456"
                                    />
                                </Grid>

                                {/* Date of Birth */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Date of Birth"
                                        value={staffProfile.dateOfBirth ? new Date(staffProfile.dateOfBirth).toLocaleDateString() : ''}
                                        InputProps={{ readOnly: true }}
                                        variant={isEditMode ? "outlined" : "filled"}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Address Section */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Residence Address
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Grid container spacing={3}>
                                {/* Address Number */}
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Number"
                                        name="number"
                                        value={formData.number}
                                        onChange={handleInputChange}
                                        error={!!errors.number}
                                        helperText={errors.number}
                                        InputProps={{ readOnly: !isEditMode }}
                                        variant={isEditMode ? "outlined" : "filled"}
                                    />
                                </Grid>

                                {/* Street */}
                                <Grid item xs={12} sm={8}>
                                    <TextField
                                        fullWidth
                                        label="Street"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        error={!!errors.street}
                                        helperText={errors.street}
                                        InputProps={{ readOnly: !isEditMode }}
                                        variant={isEditMode ? "outlined" : "filled"}
                                    />
                                </Grid>

                                {/* Ward */}
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Ward"
                                        name="ward"
                                        value={formData.ward}
                                        onChange={handleInputChange}
                                        error={!!errors.ward}
                                        helperText={errors.ward}
                                        InputProps={{ readOnly: !isEditMode }}
                                        variant={isEditMode ? "outlined" : "filled"}
                                    />
                                </Grid>

                                {/* District */}
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="District"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        error={!!errors.district}
                                        helperText={errors.district}
                                        InputProps={{ readOnly: !isEditMode }}
                                        variant={isEditMode ? "outlined" : "filled"}
                                    />
                                </Grid>

                                {/* City */}
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        error={!!errors.city}
                                        helperText={errors.city}
                                        InputProps={{ readOnly: !isEditMode }}
                                        variant={isEditMode ? "outlined" : "filled"}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Edit mode buttons */}
                        {isEditMode && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleCancelEdit}
                                    startIcon={<CancelIcon />}
                                    sx={{ mr: 2 }}
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmit}
                                    startIcon={<SaveIcon />}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            {/* ID Image Dialog */}
            <Dialog
                open={idImageDialog.open}
                onClose={handleCloseIdImageDialog}
                maxWidth="md"
            >
                <DialogTitle>{idImageDialog.title}</DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleCloseIdImageDialog}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    {idImageDialog.imageUrl && (
                        <img
                            src={idImageDialog.imageUrl}
                            alt={idImageDialog.title}
                            style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Notification Snackbar */}
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

export default StaffProfile;