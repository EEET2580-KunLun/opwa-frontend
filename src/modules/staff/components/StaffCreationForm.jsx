import {useNavigate, useParams, useLocation} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {
    Paper,
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
    Alert,
    CircularProgress,
    FormControlLabel,
    Switch,
} from "@mui/material";
import InputAdornment from '@mui/material/InputAdornment';
import {PhotoCamera, Clear, ArrowBack, Visibility, VisibilityOff} from "@mui/icons-material";
import {useCreateStaffMutation, useUpdateStaffMutation, useUploadStaffAvatarMutation} from "../store/staffApiSlice.js";
import {
    validateEmail,
    validatePassword,
    validateName,
    validateNationalID,
    validateAddress,
    validatePhone,
    validateDOB,
    validateUsername
} from "../util/validationUtils.js";
import {useSelector} from "react-redux";
import {selectCurrentUser} from "../../auth/store/authSlice.js";
import { convertToSnakeCase } from "../../../shared/utils.js";

const StaffForm = ({isEditMode: propIsEditMode = false, initialData: propInitialData = null, onSuccess }) => {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarChanged, setAvatarChanged] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const currentUser =  useSelector(selectCurrentUser)


    // Determine if we're in edit mode from either props or URL
    const isEditMode = propIsEditMode || !!params.id || location.state?.isEditMode;
    const editorRole =  currentUser.role;

    // Get initialData from props or location state
    const routeInitialData = location.state?.initialData;
    const initialData = propInitialData || routeInitialData;

    const [createStaff, {isLoading: isCreating}] = useCreateStaffMutation();
    const [updateStaff, {isLoading: isUpdating}] = useUpdateStaffMutation();
    const [uploadAvatar] = useUploadStaffAvatarMutation();

    const isLoading = isCreating || isUpdating;
    const fileRefs = {
        profilePhoto: useRef(null), frontId: useRef(null), backId: useRef(null)
    };

    const [imagesChanged, setImagesChanged] = useState({
        profilePhoto: false,
        frontId: false,
        backId: false
    });

    // Handler to flip the boolean:
    const handleTogglePassword = () => {
        setShowPassword(show => !show);
    };

    // Initialize form state
    const defaultFormData = {
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
    };

    // Form state
    const [formData, setFormData] = useState(defaultFormData);

    // File upload states
    const [images, setImages] = useState({
        profilePhoto: null,
        frontIdImage: null,
        backIdImage: null,
        profilePhotoPreview: null,
        frontIdPreview: null,
        backIdPreview: null
    });

    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({
        open: false, message: "", severity: "success"
    });

    useEffect(() => {
        handleClearForm()
    }, [isEditMode, routeInitialData]);

    useEffect(() => {
        console.log(editorRole)
        if (editorRole === "ADMIN"){
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    }, [editorRole]);

    const handleBlur = (e) => {
        const { name, value } = e.target;
        let error = "";

        switch (name) {
            case "email":
                if (!validateEmail(value)) {
                    error = "Invalid email format (must end in .com or .vn)";
                }
                break;
            case "password":
                // only validate non-empty password
                if (value && !validatePassword(value)) {
                    error = "Password must be ≥8 chars, include uppercase, lowercase, digit & special char";
                }
                break;
            case "firstName":
            case "middleName":
            case "lastName":
                if (!validateName(value)) {
                    error = "Name must only contain letters (supports Vietnamese)";
                }
                break;
            case "username":
                if (!validateUsername(value)) {
                    error = "Username must be alphanumeric and ≥6 characters";
                }
                break;
            case "nationalId":
                if (!validateNationalID(value)) {
                    error = "National ID must be exactly 12 digits";
                }
                break;
            case "addressNumber":
            case "addressStreet":
            case "addressWard":
            case "addressDistrict":
            case "addressCity":
                if (!validateAddress(value)) {
                    error = "This field is required";
                }
                break;
            case "phone":
                if (!validatePhone(value)) {
                    error = "Phone must be 10 digits starting with 0";
                }
                break;
            case "dateOfBirth":
                if (!validateDOB(value)) {
                    error = "DOB must be dd/mm/yyyy and age ≥18";
                }
                break;
            default:
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // Load initial data if in edit mode
    useEffect(() => {
        if (isEditMode && initialData) {
            // Map the incoming data to form fields
            setFormData({
                email: initialData.email || "",
                password: "",
                firstName: initialData.first_name || "",
                middleName: initialData.middle_name || "",
                lastName: initialData.last_name || "",
                username: initialData.username || "",
                nationalId: initialData.national_id || "",
                role: initialData.role || "",
                addressNumber: initialData.residence_address_entity?.number || "",
                addressStreet: initialData.residence_address_entity?.street || "",
                addressWard: initialData.residence_address_entity?.ward || "",
                addressDistrict: initialData.residence_address_entity?.district || "",
                addressCity: initialData.residence_address_entity?.city || "",
                phone: initialData.phone_number || "",
                dateOfBirth: initialData.date_of_birth ?
                    initialData.date_of_birth.split('-').reverse().join('/') :
                    "",
                shift: initialData.shift || "",
                employed: initialData.employed !== false
            });

            // Set image previews if available - improved handling
            setImages({
                // Keep the file references as null since we're not re-uploading
                profilePhoto: null,
                frontIdImage: null,
                backIdImage: null,

                // Set the preview URLs directly from initialData
                profilePhotoPreview: initialData.profile_picture || null,
                frontIdPreview: initialData.national_id_front_picture || null,
                backIdPreview: initialData.national_id_back_picture || null
            });
        }
    }, [isEditMode, initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors({...errors, [type]: `File must be less than 5MB`});
            return;
        }

        const previewURL = URL.createObjectURL(file);

        // Update state with consistent naming
        setImages(prev => ({
            ...prev,
            [type]: file,
            [`${type.replace('Image', '')}Preview`]: previewURL
        }));

        // Mark this image as changed
        const imageKey = type === 'profilePhoto' ? 'profilePhoto' : 
                        type === 'frontIdImage' ? 'frontId' : 
                        type === 'backIdImage' ? 'backId' : null;
        
        if (imageKey) {
            setImagesChanged(prev => ({
                ...prev,
                [imageKey]: true
            }));
        }

        // If it's a profile photo upload in edit mode, upload it immediately
        if (isEditMode && type === 'profilePhoto' && initialData?.id) {
            try {
                setAvatarUploading(true);
                setAvatarChanged(true);

                // Create a FormData object for the avatar upload
                const avatarFormData = new FormData();
                avatarFormData.append('profilePicture', file);

                // Call the upload mutation
                await uploadAvatar({
                    staffId: initialData.id,
                    formData: avatarFormData
                }).unwrap();

                // Show success notification
                setNotification({
                    open: true,
                    message: "Profile picture updated successfully",
                    severity: "success"
                });
            } catch (error) {
                console.error("Failed to upload avatar:", error);

                // Show error notification
                setNotification({
                    open: true,
                    message: error.data?.message || "Failed to upload profile picture",
                    severity: "error"
                });

                // Revert to previous avatar if there was an error
                if (initialData.profile_picture) {
                    setImages(prev => ({
                        ...prev,
                        profilePhotoPreview: initialData.profile_picture,
                        profilePhoto: null
                    }));
                    setAvatarChanged(false);
                }
            } finally {
                setAvatarUploading(false);
            }
        }

        if (errors[type]) {
            setErrors({...errors, [type]: ""});
        }
    };

    // Fix the clearImage function
    const clearImage = (type) => {
        // Get the correct preview key name
        const previewKey = `${type.replace('Image', '')}Preview`;

        if (images[previewKey]) {
            URL.revokeObjectURL(images[previewKey]);
        }

        setImages(prev => ({
            ...prev, [type]: null, [previewKey]: null
        }));

        // Reset the changed flag for this image
        const imageKey = type === 'profilePhoto' ? 'profilePhoto' : 
                        type === 'frontIdImage' ? 'frontId' : 
                        type === 'backIdImage' ? 'backId' : null;
        
        if (imageKey) {
            setImagesChanged(prev => ({
                ...prev,
                [imageKey]: false
            }));
        }

        if (fileRefs[type.replace('Image', '')] && fileRefs[type.replace('Image', '')].current) {
            fileRefs[type.replace('Image', '')].current.value = '';
        }
    };

    //Validate all fields
    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!validateEmail(formData.email)) {
            newErrors.email = "Invalid email format. The email must end with '.com' or '.vn'";
        }

        // Password validation - only required for new users
        if (!isEditMode && !validatePassword(formData.password)) {
            newErrors.password = "Password must be at least 8 characters and include uppercase, lowercase, digit, and special character";
        } else if (isEditMode && formData.password && !validatePassword(formData.password)) {
            newErrors.password = "If provided, password must meet complexity requirements";
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
            newErrors.username = 'Username can contain only letters, numbers, and space and maximum 20 characters';
        }

        // National ID validation - special handling for edit mode
        if (isEditMode && formData.nationalId.match(/^\*{8}\d{4}$/)) {
            // Valid masked national ID in edit mode - pass validation
        } else if (!validateNationalID(formData.nationalId)) {
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

        // Phone validation - special handling for edit mode
        if (isEditMode && formData.phone.match(/^\*{6}\d{4}$/)) {
            // Valid masked phone in edit mode - pass validation
        } else if (!validatePhone(formData.phone)) {
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

        // Required image uploads for new staff only
        if (!isEditMode) {
            if (!images.frontIdImage && !images.frontIdPreview) {
                newErrors.frontIdImage = 'Front ID image is required';
            }

            if (!images.backIdImage && !images.backIdPreview) {
                newErrors.backIdImage = 'Back ID image is required';
            }
        }

        console.log(newErrors)

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const prepareFormData = () => {
        const staffFormData = new FormData();
        
        // Create a JSON object for staff data
        const staffJsonData = {
            email: formData.email,
            username: !isEditMode ? formData.username : undefined,  // Only include username for new staff
            password: formData.password || undefined,  // Convert empty string to undefined
            firstName: formData.firstName,
            middleName: formData.middleName || '',
            lastName: formData.lastName,
            nationalId: formData.nationalId,
            role: formData.role,
            phoneNumber: formData.phone,
            dateOfBirth: formData.dateOfBirth.split('/').reverse().join('-'),
            shift: formData.shift,
            employed: formData.employed,
            address: {
                number: formData.addressNumber,
                street: formData.addressStreet,
                ward: formData.addressWard,
                district: formData.addressDistrict,
                city: formData.addressCity
            }
        };

        // Remove undefined and empty string fields
        const removeEmptyValues = (obj) => {
            Object.keys(obj).forEach(key => {
                // Check if value is undefined or empty string
                if (obj[key] === undefined || obj[key] === '') {
                    delete obj[key];
                } 
                // Recursively check nested objects
                else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    removeEmptyValues(obj[key]);
                    // Delete empty objects
                    if (Object.keys(obj[key]).length === 0) {
                        delete obj[key];
                    }
                }
            });
            return obj;
        };

        // Clean the data object
        const cleanedJsonData = removeEmptyValues({...staffJsonData});
        
        // Convert the cleaned JSON object to snake_case
        const snakeCaseJsonData = convertToSnakeCase(cleanedJsonData);

        // Add JSON data as a blob with the correct content type
        const staffBlob = new Blob([JSON.stringify(snakeCaseJsonData)], {
            type: 'application/json'
        });
        
        // Add the JSON part (this is the @RequestBody in your controller)
        staffFormData.append('request', staffBlob);
        
        // Add ONLY the changed image files
        // For new staff records, all provided images are included
        if (!isEditMode || imagesChanged.profilePhoto) {
            if (images.profilePhoto) {
                staffFormData.append('profilePicture', images.profilePhoto);
            }
        }

        if (!isEditMode || imagesChanged.frontId) {
            if (images.frontIdImage) {
                staffFormData.append('frontIdPicture', images.frontIdImage);
            }
        }

        if (!isEditMode || imagesChanged.backId) {
            if (images.backIdImage) {
                staffFormData.append('backIdPicture', images.backIdImage);
            }
        }

        return staffFormData;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            console.log("validate failed")
            setNotification({
                open: true, message: "Please fix the error at the field(s) marked with red", severity: "error"
            });
            return;
        }

        const staffFormData = prepareFormData();
        console.log(staffFormData)
        try {
            let response;

            if (isEditMode) {
                response = await updateStaff({ staffId: initialData.id, staffData: staffFormData }).unwrap();
            } else {
                response = await createStaff(staffFormData).unwrap();
            }

            setNotification({
                open: true,
                message: isEditMode ? "Staff updated successfully" : "Staff created successfully",
                severity: "success"
            });

            // If success callback provided, call it
            if (onSuccess && typeof onSuccess === 'function') {
                onSuccess(response);
            }

            // Clear the form if creating new staff, otherwise keep data in edit mode
            if (!isEditMode) {
                handleClearForm();
            }
        } catch (error) {
            console.error(`Failed to ${isEditMode ? 'update' : 'create'} staff account:`, error);

            setNotification({
                open: true,
                message: error.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} staff account`,
                severity: "error"
            });
        }
    };

    const handleClearForm = () => {
        // Reset form data
        setFormData(defaultFormData);

        // Clear all images
        Object.keys(images).forEach(key => {
            if (key.includes('Preview') && images[key]) {
                URL.revokeObjectURL(images[key]);
            }
        });

        setImages({
            profilePhoto: null,
            frontIdImage: null,
            backIdImage: null,
            profilePhotoPreview: null,
            frontIdPreview: null,
            backIdPreview: null
        });

        // Reset file inputs
        Object.values(fileRefs).forEach(ref => {
            if (ref.current) {
                ref.current.value = '';
            }
        });

        // Clear errors
        setErrors({});
    };

    // Closes notification snackbar
    const handleCloseNotification = () => {
        setNotification({
            ...notification, open: false
        });
    };

    return (<Paper
        elevation={3}
        sx={{
            p: 4, maxWidth: 1000, mx: 'auto', my: 4, backgroundColor: '#f8f9fa'
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
            <Box sx={{display: 'flex', alignItems: 'center'}}>
                <IconButton
                    color="inherit"
                    onClick={() => navigate(-1)}
                    sx={{mr: 2}}
                >
                    <ArrowBack/>
                </IconButton>
                <Typography variant="h4" component="h1">
                    {isEditMode ? 'Edit Staff Account' : 'Create Account'}
                </Typography>
            </Box>

            {/* Profile photo upload area */}
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                {/*<Box sx={{position: 'relative'}}>*/}
                {/*    <Avatar*/}
                {/*        src={images.profilePhotoPreview}*/}
                {/*        sx={{*/}
                {/*            width: 100, height: 100, bgcolor: '#fcdf49', border: '2px dashed #4dabf5'*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        {!images.profilePhotoPreview && <Typography variant="h5">?</Typography>}*/}
                {/*    </Avatar>*/}
                {/*    <Tooltip title="Upload profile picture">*/}
                {/*        <IconButton*/}
                {/*            color="primary"*/}
                {/*            aria-label="upload picture"*/}
                {/*            component="label"*/}
                {/*            sx={{*/}
                {/*                position: 'absolute', bottom: -5, right: -5, backgroundColor: 'white'*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            <input*/}
                {/*                ref={fileRefs.profilePhoto}*/}
                {/*                hidden*/}
                {/*                accept="image/*"*/}
                {/*                type="file"*/}
                {/*                onChange={(e) => handleImageUpload(e, 'profilePhoto')}*/}
                {/*            />*/}
                {/*            <PhotoCamera/>*/}
                {/*        </IconButton>*/}
                {/*    </Tooltip>*/}
                {/*</Box>*/}

                <Box sx={{position: 'relative'}}>
                    <Avatar
                        src={images.profilePhotoPreview}
                        sx={{
                            width: 100,
                            height: 100,
                            bgcolor: '#fcdf49',
                            border: avatarChanged ? '2px solid #4caf50' : '2px dashed #4dabf5',
                            opacity: avatarUploading ? 0.7 : 1
                        }}
                    >
                        {!images.profilePhotoPreview && <Typography variant="h5">?</Typography>}
                    </Avatar>

                    {/* Loading indicator */}
                    {avatarUploading && (
                        <CircularProgress
                            size={60}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-30px',
                                marginLeft: '-30px'
                            }}
                        />
                    )}

                    {/* Upload button */}
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
                            disabled={avatarUploading}
                        >
                            <input
                                ref={fileRefs.profilePhoto}
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={(e) => handleImageUpload(e, 'profilePhoto')}
                            />
                            <PhotoCamera />
                        </IconButton>
                    </Tooltip>

                    {/* Changed indicator */}
                    {avatarChanged && isEditMode && !avatarUploading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                bgcolor: '#4caf50',
                                color: 'white',
                                borderRadius: '50%',
                                width: 24,
                                height: 24,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem'
                            }}
                        >
                            new
                        </Box>
                    )}
                </Box>
                <Typography variant="body2" sx={{mt: 1, color: 'white'}}>
                    Upload profile picture
                </Typography>
                {errors.profilePhoto && (<Typography variant="caption" color="error">
                    {errors.profilePhoto}
                </Typography>)}
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
                        onBlur={handleBlur}
                        error={!!errors.email}
                        helperText={errors.email}
                        placeholder="example@domain.com"
                        InputLabelProps={{shrink: true}}
                    />
                </Grid>

                {/* Password */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label={isEditMode ? "Change password (leave blank to keep current)" : "Create a password"}
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={!!errors.password}
                        helperText={errors.password}
                        placeholder="Password must include uppercase, lowercase, number, and special character"
                        InputLabelProps={{shrink: true}}
                        required={!isEditMode}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleTogglePassword}
                                        edge="end"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword
                                            ? <VisibilityOff />
                                            : <Visibility />
                                        }
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
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
                        onBlur={handleBlur}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        placeholder="Enter first name"
                        InputLabelProps={{shrink: true}}
                    />
                </Grid>

                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        label="Middle name"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={!!errors.middleName}
                        helperText={errors.middleName}
                        placeholder="Enter middle name (optional)"
                        InputLabelProps={{shrink: true}}
                    />
                </Grid>

                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        label="Last name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                        placeholder="Enter last name"
                        InputLabelProps={{shrink: true}}
                    />
                </Grid>

                {/* Username */}
                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={!!errors.username}
                        helperText={errors.username}
                        placeholder="Enter username"
                        InputLabelProps={{shrink: true}}
                        sx={{
                            "& .Mui-disabled": {
                                opacity: 0.7,
                                "-webkit-text-fill-color": "#666",
                            }
                        }}
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
                        onBlur={handleBlur}
                        error={!!errors.nationalId}
                        helperText={errors.nationalId}
                        placeholder="12-digit National ID"
                        InputLabelProps={{shrink: true}}
                    />
                </Grid>

                {/* National ID Images */}
                <Grid item xs={6}>
                    <Typography variant="subtitle1" gutterBottom>
                        National ID - Front Side
                    </Typography>
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        {images.frontIdPreview ? (<Box sx={{position: 'relative', width: '100%', mb: 2}}>
                            <img
                                src={images.frontIdPreview}
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
                                sx={{position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.7)'}}
                                onClick={() => clearImage('frontIdImage')}
                            >
                                <Clear/>
                            </IconButton>
                        </Box>) : (<Button
                            variant="outlined"
                            component="label"
                            startIcon={<PhotoCamera/>}
                            sx={{mb: 2, width: '100%', height: '100px'}}
                        >
                            Upload Front ID
                            <input
                                ref={fileRefs.frontId}
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={(e) => handleImageUpload(e, 'frontIdImage')}
                            />
                        </Button>)}
                        {errors.frontIdImage && (<Typography variant="caption" color="error">
                            {errors.frontIdImage}
                        </Typography>)}
                    </Box>
                    {imagesChanged.frontId && isEditMode && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -8,
                                right: 8, // Slightly offset from the close button
                                bgcolor: '#4caf50',
                                color: 'white',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                fontSize: '0.7rem'
                            }}
                        >
                            new
                        </Box>
                    )}
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="subtitle1" gutterBottom>
                        National ID - Back Side
                    </Typography>
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        {images.backIdPreview ? (<Box sx={{position: 'relative', width: '100%', mb: 2}}>
                            <img
                                src={images.backIdPreview}
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
                                sx={{position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.7)'}}
                                onClick={() => clearImage('backIdImage')}
                            >
                                <Clear/>
                            </IconButton>
                        </Box>) : (<Button
                            variant="outlined"
                            component="label"
                            startIcon={<PhotoCamera/>}
                            sx={{mb: 2, width: '100%', height: '100px'}}
                        >
                            Upload Back ID
                            <input
                                ref={fileRefs.backId}
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={(e) => handleImageUpload(e, 'backIdImage')}
                            />
                        </Button>)}
                        {errors.backIdImage && (<Typography variant="caption" color="error">
                            {errors.backIdImage}
                        </Typography>)}
                    </Box>
                    {imagesChanged.backId && isEditMode && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -8,
                                right: 8,
                                bgcolor: '#4caf50',
                                color: 'white',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                fontSize: '0.7rem'
                            }}
                        >
                            new
                        </Box>
                    )}
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
                            disabled={!isAdmin}
                            onBlur={handleBlur}
                            label="Staff role"
                        >
                            <MenuItem value="ADMIN">Admin</MenuItem>
                            <MenuItem value="OPERATOR">Operator</MenuItem>
                            <MenuItem value="TICKET_AGENT">Ticket Agent</MenuItem>
                        </Select>
                        <FormHelperText>{errors.shift}</FormHelperText>
                    </FormControl>
                </Grid>

                {/* Address fields */}
                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        label="Address Number"
                        name="addressNumber"
                        value={formData.addressNumber}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={!!errors.addressNumber}
                        helperText={errors.addressNumber}
                        placeholder="123"
                        InputLabelProps={{shrink: true}}
                    />
                </Grid>

                <Grid item xs={8}>
                    <TextField
                        fullWidth
                        label="Street"
                        name="addressStreet"
                        value={formData.addressStreet}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={!!errors.addressStreet}
                        helperText={errors.addressStreet}
                        placeholder="Nguyen Van Linh"
                        InputLabelProps={{shrink: true}}
                    />
                </Grid>

                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        label="Ward"
                        name="addressWard"
                        value={formData.addressWard}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={!!errors.addressWard}
                        helperText={errors.addressWard}
                        placeholder="Tan Phong"
                        InputLabelProps={{shrink: true}}
                    />
                </Grid>

                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        label="District"
                        name="addressDistrict"
                        value={formData.addressDistrict}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={!!errors.addressDistrict}
                        helperText={errors.addressDistrict}
                        placeholder="District 7"
                        InputLabelProps={{shrink: true}}
                    />
                </Grid>

                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        label="City"
                        name="addressCity"
                        value={formData.addressCity}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={!!errors.addressCity}
                        helperText={errors.addressCity}
                        placeholder="Ho Chi Minh City"
                        InputLabelProps={{shrink: true}}
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
                        onBlur={handleBlur}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        placeholder="0921 123 456"
                        InputLabelProps={{shrink: true}}
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
                        onBlur={handleBlur}
                        error={!!errors.dateOfBirth}
                        helperText={errors.dateOfBirth}
                        placeholder="21/12/1995"
                        InputLabelProps={{shrink: true}}
                    />
                </Grid>

                {/* Shift selection */}
                <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.shift}>
                        <InputLabel
                            id="shift-label">Choose a shift
                        </InputLabel>
                        <Select
                            labelId="shift-label"
                            id="shift"
                            name="shift"
                            value={formData.shift}
                            disabled={!isAdmin}
                            onChange={handleInputChange}
                            label="Choose a shift"
                        >
                            <MenuItem value="DAY">Day: 06:00 AM – 02:00 PM</MenuItem>
                            <MenuItem value="EVENING">Evening: 02:00 PM – 10:00 PM</MenuItem>
                            <MenuItem value="NIGHT">Night: 10:00 PM – 06:00 AM</MenuItem>
                        </Select>
                        <FormHelperText>{errors.shift}</FormHelperText>
                    </FormControl>
                </Grid>

                {/* Employment Status - add this after the Shift selection */}
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <FormControlLabel
                            control={
                                <Switch
                                    disabled={!isAdmin}
                                    checked={formData.employed}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            employed: e.target.checked
                                        });
                                    }}
                                    color="primary"
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography>
                                        Employment Status:
                                    </Typography>
                                    <Typography
                                        sx={{
                                            ml: 1,
                                            fontWeight: 'bold',
                                            color: formData.employed ? 'success.main' : 'error.main'
                                        }}
                                    >
                                        {formData.employed ? 'Employed' : 'Unemployed'}
                                    </Typography>
                                </Box>
                            }
                        />
                        <FormHelperText>{errors.shift}</FormHelperText>
                    </FormControl>
                </Grid>

                {/* Form Actions */}
                <Grid item xs={12} sx={{mt: 3, display: 'flex', justifyContent: 'space-between'}}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleClearForm}
                        disabled={isLoading}
                    >
                        Clear Form
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                        sx={{minWidth: 150}}
                    >
                        {isLoading ? (<>
                            <CircularProgress size={24} sx={{mr: 1}}/>
                            {isEditMode ? 'Updating...' : 'Creating...'}
                        </>) : (isEditMode ? 'Update Staff' : 'Create Staff')}
                    </Button>
                </Grid>
            </Grid>
        </form>

        {/* Notification */}
        <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        >
            <Alert
                onClose={handleCloseNotification}
                severity={notification.severity}
                variant="filled"
                sx={{width: '100%'}}
            >
                {notification.message}
            </Alert>
        </Snackbar>
    </Paper>);
};

export default StaffForm;