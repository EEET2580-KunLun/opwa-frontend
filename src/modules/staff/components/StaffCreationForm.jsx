import {useNavigate} from "react-router-dom";
import {useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {Paper,
        TextField,
        Button,
        Grid,
        FormControl,
        InputLabel,
        Select,
        MenuItem,
        Typography,
        Box,
        Avatar,
        IconButton,
        Tooltip,
        FormHelperText,
        Snackbar,
        Alert} from "@mui/material";
import {PhotoCamera, Clear} from "@mui/icons-material";
import {useCreateStaffMutation} from "../store/staffApiSlice.js";
import {validateEmail, validatePassword, validateName, validateNationalID, validateAddress, validatePhone, validateDOB, validateUsername} from "../util/validationUtils.js";

const StaffCreationForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [createStaff, {isLoading}] = useCreateStaffMutation();

    const frontIdRef = useRef(null);
    const backIdRef = useRef(null);
    const profilePhotoRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstName: "",
        middleName: "",
        lastName: "",
        username: "",
        nationalId: "",
        role: "",
        addressNumber: "",
        addressStreet: "",
        addressWard: "",
        addressDistrict: "",
        addressCity: "",
        phone: "",
        dateOfBirth: "",
        shift: "",
        employed: true
    });

    // File upload states
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [frontIdImage, setFrontIdImage] = useState(null);
    const [backIdImage, setBackIdImage] = useState(null);

    // Store preview urls for images
    const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
    const [frontIdPreview, setFrontIdPreview] = useState(null);
    const [backIdPreview, setBackIdPreview] = useState(null);

    const [errors, setErrors] = useState({});

    // Form validation state
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if(errors[name]){
            setErrors({
                ...errors,
                [name]: ""
            });
        }
    };

    const handleProfilePhotoUpload = (e) => {
        const file = e.target.files[0];
        if(file){
            // Check file size (max 5MB)
            if(file.size > 5 * 1024 * 1024){
                setErrors({
                    ...errors,
                    profilePhoto: "Profile photo must be less than 5MB"
                });
                return;
            }

            setProfilePhoto(file);
            const previewURL = URL.createObjectURL(file);
            setProfilePhotoPreview(previewURL);

            if(errors.profilePhoto){
                setErrors({
                    ...errors,
                    profilePhoto: ""
                });
            }
        }
    };

    const handleFrontIdUpload = (e) => {
        const file = e.target.files[0];
        if(file){
            if(file.size > 5 * 1024 * 1024){
                setErrors({
                    ...errors,
                    frontIdImage: "Front ID image must be less than 5MB"
                });
                return;
            }
            setFrontIdImage(file);
            const previewURL = URL.createObjectURL(file);
            setFrontIdPreview(previewURL);

            if(errors.frontIdImage){
                setErrors({
                    ...errors,
                    frontIdImage: ""
                })
            }
        }
    };

    const handleBackIdUpload = (e) => {
        const file = e.target.files[0];
        if(file){
            if (file.size > 5 * 1024 * 1024) {
                setErrors({
                    ...errors,
                    backIdImage: 'Back ID image must be less than 5MB'
                });
                return;
            }

            setBackIdImage(file);
            const previewURL = URL.createObjectURL(file);
            setBackIdPreview(previewURL);

            if (errors.backIdImage) {
                setErrors({
                    ...errors,
                    backIdImage: ''
                });
            }
        }
    };

    // Validate all fields
    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if(!validateEmail(formData.email)){
            newErrors.email = "Invalid email format. The email must end with '.com' or '.vn'";
        }

        // Password validation
        if(!validatePassword(formData.password)){
            newErrors.password = "Password must be at least 8 characters and include uppercase, lowercase, digit, and special character";
        }

        // Name validations
        if (!validateName(formData.firstName)) {
            newErrors.firstName = 'First name must contain only letters and support Vietnamese characters';
        }

        if (formData.middleName && !validateName(formData.middleName)) {
            newErrors.middleName = 'Middle name must contain only letters and support Vietnamese characters';
        }

        if (!validateName(formData.lastName)) {
            newErrors.lastName = 'Last name must contain only letters and support Vietnamese characters';
        }

        if (!validateUsername(formData.username)) {
            newErrors.username = 'Username must be alphanumeric and at least 6 characters';
        }

        // National ID validation
        if (!validateNationalID(formData.nationalId)) {
            newErrors.nationalId = 'National ID must be exactly 12 digits';
        }

        // Role validation
        if (!formData.role) {
            newErrors.role = 'Role is required';
        }

        // Address validation
        if (!validateAddress(formData.addressNumber)) {
            newErrors.addressNumber = 'Address number is required';
        }

        if (!validateAddress(formData.addressStreet)) {
            newErrors.addressStreet = 'Street is required';
        }

        if (!validateAddress(formData.addressWard)) {
            newErrors.addressWard = 'Ward is required';
        }

        if (!validateAddress(formData.addressDistrict)) {
            newErrors.addressDistrict = 'District is required';
        }

        if (!validateAddress(formData.addressCity)) {
            newErrors.addressCity = 'City is required';
        }

        // Phone validation
        if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Phone must be 10 digits starting with 0';
        }

        // Date of birth validation
        if (!validateDOB(formData.dateOfBirth)) {
            newErrors.dateOfBirth = 'Date of birth must be in format dd/mm/yyyy and at least 6 years ago';
        }

        // Shift validation
        if (!formData.shift) {
            newErrors.shift = 'Shift is required';
        }

        // Required image uploads (Red Savina level)
        if (!frontIdImage) {
            newErrors.frontIdImage = 'Front ID image is required';
        }

        if (!backIdImage) {
            newErrors.backIdImage = 'Back ID image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!validateForm()){
            setNotification({
                open: true,
                message: "Please fix the error at the field(s) marked with red",
                severity: "error"
            });
            return;
        }

        const staffFormData = new FormData();

        // Append fields with correct names for the backend
        staffFormData.append('email', formData.email);
        staffFormData.append('username', formData.username);
        staffFormData.append('password', formData.password);
        staffFormData.append('firstName', formData.firstName);
        staffFormData.append('middleName', formData.middleName || '');
        staffFormData.append('lastName', formData.lastName);
        staffFormData.append('nationalId', formData.nationalId);
        staffFormData.append('role', formData.role);
        staffFormData.append('phoneNumber', formData.phone);
        staffFormData.append('dateOfBirth', formData.dateOfBirth);
        staffFormData.append('shift', formData.shift);
        staffFormData.append('employed', formData.employed);

        // Add address fields as separate form fields
        staffFormData.append("address.number", formData.addressNumber);
        staffFormData.append("address.street", formData.addressStreet);
        staffFormData.append("address.ward", formData.addressWard);
        staffFormData.append("address.district", formData.addressDistrict);
        staffFormData.append("address.city", formData.addressCity);

        // Append files with UPDATED field names
        if (profilePhoto) {
            staffFormData.append('profilePicture', profilePhoto);
        }

        if (frontIdImage) {
            staffFormData.append('frontIdPicture', frontIdImage);
        }

        if (backIdImage) {
            staffFormData.append('backIdPicture', backIdImage);
        }

        // Debug: log FormData contents
        console.log('FormData contents:');
        for (let [key, value] of staffFormData.entries()) {
            console.log(key, value);
        }

        try {
            const response = await createStaff(staffFormData).unwrap();

            setNotification({
                open: true,
                message: "Staff created successfully",
                severity: "success"
            });

            // Clear the form
            handleClearForm();
        } catch (error) {
            console.error("Failed to create staff account: ", error);
            console.error("Error details:", error.data);

            setNotification({
                open: true,
                message: error.data?.message || "Failed to create staff account",
                severity: "error"
            });
        }
    };

    const handleClearForm = () => {
        setFormData({
            email: '',
            password: '',
            firstName: '',
            middleName: '',
            lastName: '',
            username: '',
            nationalId: '',
            role: '',
            addressNumber: '',
            addressStreet: '',
            addressWard: '',
            addressDistrict: '',
            addressCity: '',
            phone: '',
            dateOfBirth: '',
            shift: '',
            employed: true
        });

        // Clear file upload and preview
        setProfilePhoto(null);
        setFrontIdImage(null);
        setBackIdImage(null);

        if(profilePhotoPreview){
            URL.revokeObjectURL(profilePhotoPreview);
            setProfilePhotoPreview(null);
        }

        if (frontIdPreview) {
            URL.revokeObjectURL(frontIdPreview);
            setFrontIdPreview(null);
        }

        if (backIdPreview) {
            URL.revokeObjectURL(backIdPreview);
            setBackIdPreview(null);
        }

        // reset file input
        if (profilePhotoRef.current) {
            profilePhotoRef.current.value = '';
        }

        if (frontIdRef.current) {
            frontIdRef.current.value = '';
        }

        if (backIdRef.current) {
            backIdRef.current.value = '';
        }

        // clear errors
        setErrors({});
    };


    // Closes notification snackbar
    const handleCloseNotification = () => {
        setNotification({
            ...notification,
            open: false
            }
        );
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 4,
                maxWidth: 1000,
                mx: 'auto',
                my: 4,
                backgroundColor: '#f8f9fa'
            }}
        >
            {/* Header with blue background */}
            <Box
                sx={{
                    bgcolor: '#0038b8',
                    color: 'white',
                    p: 3,
                    mb: 4,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Typography variant="h4" component="h1">
                    Create Account
                </Typography>

                {/* Profile photo upload area */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={profilePhotoPreview}
                            sx={{
                                width: 100,
                                height: 100,
                                bgcolor: '#fcdf49',
                                border: '2px dashed #4dabf5'
                            }}
                        >
                            {!profilePhotoPreview && <Typography variant="h5">?</Typography>}
                        </Avatar>
                        <Tooltip title="Upload profile picture">
                            <IconButton
                                color="primary"
                                aria-label="upload picture"
                                component="label"
                                sx={{
                                    position: 'absolute',
                                    bottom: -5,
                                    right: -5,
                                    backgroundColor: 'white'
                                }}
                            >
                                <input
                                    ref={profilePhotoRef}
                                    hidden
                                    accept="image/*"
                                    type="file"
                                    onChange={handleProfilePhotoUpload}
                                />
                                <PhotoCamera />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, color: 'white' }}>
                        Upload picture profile
                    </Typography>
                    {errors.profilePhoto && (
                        <Typography variant="caption" color="error">
                            {errors.profilePhoto}
                        </Typography>
                    )}
                </Box>
            </Box>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Email */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            placeholder="example@domain.com"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Password */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Create a password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            placeholder="Password must include uppercase, lowercase, number, and special character"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Name fields */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="First name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                            placeholder="Enter first name"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Middle name"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleInputChange}
                            error={!!errors.middleName}
                            helperText={errors.middleName}
                            placeholder="Enter middle name (optional)"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Last name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                            placeholder="Enter last name"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            error={!!errors.username}
                            helperText={errors.username}
                            placeholder="Enter username"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* National ID */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="National ID"
                            name="nationalId"
                            value={formData.nationalId}
                            onChange={handleInputChange}
                            error={!!errors.nationalId}
                            helperText={errors.nationalId}
                            placeholder="12-digit National ID"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* National ID Images (Red Savina level) */}
                    <Grid item xs={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            National ID - Front Side
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {frontIdPreview ? (
                                <Box sx={{ position: 'relative', width: '100%', mb: 2 }}>
                                    <img
                                        src={frontIdPreview}
                                        alt="National ID Front"
                                        style={{
                                            width: '100%',
                                            maxHeight: '200px',
                                            objectFit: 'contain',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <IconButton
                                        sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.7)' }}
                                        onClick={() => {
                                            URL.revokeObjectURL(frontIdPreview);
                                            setFrontIdPreview(null);
                                            setFrontIdImage(null);
                                            if (frontIdRef.current) {
                                                frontIdRef.current.value = '';
                                            }
                                        }}
                                    >
                                        <Clear />
                                    </IconButton>
                                </Box>
                            ) : (
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<PhotoCamera />}
                                    sx={{ mb: 2, width: '100%', height: '100px' }}
                                >
                                    Upload Front ID
                                    <input
                                        ref={frontIdRef}
                                        hidden
                                        accept="image/*"
                                        type="file"
                                        onChange={handleFrontIdUpload}
                                    />
                                </Button>
                            )}
                            {errors.frontIdImage && (
                                <Typography variant="caption" color="error">
                                    {errors.frontIdImage}
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            National ID - Back Side
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {backIdPreview ? (
                                <Box sx={{ position: 'relative', width: '100%', mb: 2 }}>
                                    <img
                                        src={backIdPreview}
                                        alt="National ID Back"
                                        style={{
                                            width: '100%',
                                            maxHeight: '200px',
                                            objectFit: 'contain',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <IconButton
                                        sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.7)' }}
                                        onClick={() => {
                                            URL.revokeObjectURL(backIdPreview);
                                            setBackIdPreview(null);
                                            setBackIdImage(null);
                                            if (backIdRef.current) {
                                                backIdRef.current.value = '';
                                            }
                                        }}
                                    >
                                        <Clear />
                                    </IconButton>
                                </Box>
                            ) : (
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<PhotoCamera />}
                                    sx={{ mb: 2, width: '100%', height: '100px' }}
                                >
                                    Upload Back ID
                                    <input
                                        ref={backIdRef}
                                        hidden
                                        accept="image/*"
                                        type="file"
                                        onChange={handleBackIdUpload}
                                    />
                                </Button>
                            )}
                            {errors.backIdImage && (
                                <Typography variant="caption" color="error">
                                    {errors.backIdImage}
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    {/* Role selection */}
                    <Grid item xs={12}>
                        <FormControl fullWidth error={!!errors.role}>
                            <InputLabel id="role-label">Staff role</InputLabel>
                            <Select
                                labelId="role-label"
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                label="Staff role"
                            >
                                <MenuItem value="ADMIN">Admin</MenuItem>
                                <MenuItem value="OPERATOR">Operator</MenuItem>
                                <MenuItem value="TICKET_AGENT">Ticket Agent</MenuItem>
                            </Select>
                            {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {/* Address fields (split as per Red Savina level) */}
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Address Number"
                            name="addressNumber"
                            value={formData.addressNumber}
                            onChange={handleInputChange}
                            error={!!errors.addressNumber}
                            helperText={errors.addressNumber}
                            placeholder="123"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={8}>
                        <TextField
                            fullWidth
                            label="Street"
                            name="addressStreet"
                            value={formData.addressStreet}
                            onChange={handleInputChange}
                            error={!!errors.addressStreet}
                            helperText={errors.addressStreet}
                            placeholder="Nguyen Van Linh"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Ward"
                            name="addressWard"
                            value={formData.addressWard}
                            onChange={handleInputChange}
                            error={!!errors.addressWard}
                            helperText={errors.addressWard}
                            placeholder="Tan Phong"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="District"
                            name="addressDistrict"
                            value={formData.addressDistrict}
                            onChange={handleInputChange}
                            error={!!errors.addressDistrict}
                            helperText={errors.addressDistrict}
                            placeholder="District 7"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="City"
                            name="addressCity"
                            value={formData.addressCity}
                            onChange={handleInputChange}
                            error={!!errors.addressCity}
                            helperText={errors.addressCity}
                            placeholder="Ho Chi Minh City"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Phone */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            error={!!errors.phone}
                            helperText={errors.phone}
                            placeholder="0921 123 456"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Date of birth */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Date of birth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            error={!!errors.dateOfBirth}
                            helperText={errors.dateOfBirth}
                            placeholder="21/12/1995"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Shift selection */}
                    <Grid item xs={12}>
                        <FormControl fullWidth error={!!errors.shift}>
                            <InputLabel id="shift-label">Choose a shift</InputLabel>
                            <Select
                                labelId="shift-label"
                                id="shift"
                                name="shift"
                                value={formData.shift}
                                onChange={handleInputChange}
                                label="Choose a shift"
                            >
                                <MenuItem value="DAY">Day: 06:00 AM – 02:00 PM</MenuItem>
                                <MenuItem value="EVENING">Evening: 02:00 PM – 10:00 PM</MenuItem>
                                <MenuItem value="NIGHT">Night: 10:00 PM – 06:00 AM</MenuItem>
                            </Select>
                            {errors.shift && <FormHelperText>{errors.shift}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {/* Form action buttons */}
                    <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            variant="outlined"
                            onClick={handleClearForm}
                            sx={{ px: 5, py: 1.5, bgcolor: '#e0e0e0', color: '#f44336' }}
                        >
                            CLEAR FORM
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isLoading}
                            sx={{ px: 5, py: 1.5 }}
                        >
                            CREATE ACCOUNT
                        </Button>
                    </Grid>
                </Grid>
            </form>

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
        </Paper>
    );
}

export default StaffCreationForm;