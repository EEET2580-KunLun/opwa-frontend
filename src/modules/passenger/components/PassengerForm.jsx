import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Form,
    Button,
    Card,
    Row,
    Col,
    Alert,
    Spinner
} from 'react-bootstrap';
import { 
    useCreatePassengerMutation,
    useUpdatePassengerMutation,
    useGetPassengerByIdQuery
} from '../store/pawaPassengerApiSlice';

const PassengerForm = () => {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    
    // Determine if we're in edit mode
    const isEditMode = !!params.id || location.state?.isEditMode;
    
    // Get initial data from location state if available
    const initialData = location.state?.initialData;
    
    // Fetch passenger data if in edit mode and no initial data
    const { data: fetchedPassenger, isLoading: isFetchingPassenger } = 
        useGetPassengerByIdQuery(params.id, { skip: !isEditMode || !!initialData });
    
    // Mutations for create/update
    const [createPassenger, { isLoading: isCreating }] = useCreatePassengerMutation();
    const [updatePassenger, { isLoading: isUpdating }] = useUpdatePassengerMutation();
    
    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        nationalID: '',
        phoneNumber: '',
        dateOfBirth: '',
        studentID: '',
        isDisability: false,
        isRevolutionaryContribution: false,
        email: ''
    });
    
    const [errors, setErrors] = useState({});
    const [submitResult, setSubmitResult] = useState(null);
    
    // Load data into form when available
    useEffect(() => {
        if (isEditMode) {
            const passengerData = initialData || fetchedPassenger;
            if (passengerData) {
                setFormData({
                    firstName: passengerData.firstName || '',
                    middleName: passengerData.middleName || '',
                    lastName: passengerData.lastName || '',
                    nationalID: passengerData.nationalID || '',
                    phoneNumber: passengerData.phoneNumber || '',
                    dateOfBirth: passengerData.dateOfBirth || '',
                    studentID: passengerData.studentID || '',
                    isDisability: passengerData.isDisability || false,
                    isRevolutionaryContribution: passengerData.isRevolutionaryContribution || false,
                    email: passengerData.email || ''
                });
            }
        }
    }, [isEditMode, initialData, fetchedPassenger]);
    
    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        
        // Clear error when field is changed
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };
    
    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.nationalID) {
            newErrors.nationalID = 'National ID is required';
        } else if (!/^\d{9,12}$/.test(formData.nationalID)) {
            newErrors.nationalID = 'National ID must be 9-12 digits';
        }
        
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\d{9,11}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Phone number must be 9-11 digits';
        }
        
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            setSubmitResult(null);
            
            if (isEditMode) {
                const result = await updatePassenger({
                    id: params.id || initialData.id,
                    ...formData
                }).unwrap();
                
                setSubmitResult({
                    type: 'success',
                    message: 'Passenger updated successfully'
                });
                
                // Navigate back after successful update
                setTimeout(() => {
                    navigate('/admin/passenger');
                }, 1500);
            } else {
                const result = await createPassenger(formData).unwrap();
                
                setSubmitResult({
                    type: 'success',
                    message: 'Passenger created successfully'
                });
                
                // Clear form or navigate away
                setTimeout(() => {
                    navigate('/admin/passenger');
                }, 1500);
            }
        } catch (err) {
            console.error('Submission failed:', err);
            setSubmitResult({
                type: 'error',
                message: err.data?.message || 'Failed to save passenger'
            });
        }
    };
    
    // Handle cancel
    const handleCancel = () => {
        navigate('/admin/passenger');
    };
    
    // Show loading if fetching passenger data
    if (isEditMode && !initialData && isFetchingPassenger) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" />
                <p className="mt-2">Loading passenger data...</p>
            </div>
        );
    }
    
    return (
        <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">{isEditMode ? 'Edit Passenger' : 'Create New Passenger'}</h5>
            </Card.Header>
            <Card.Body>
                {submitResult && (
                    <Alert variant={submitResult.type === 'success' ? 'success' : 'danger'} className="mb-3">
                        {submitResult.message}
                    </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    isInvalid={!!errors.firstName}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.firstName}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Middle Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="middleName"
                                    value={formData.middleName}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    isInvalid={!!errors.lastName}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.lastName}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>National ID*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nationalID"
                                    value={formData.nationalID}
                                    onChange={handleChange}
                                    isInvalid={!!errors.nationalID}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.nationalID}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    isInvalid={!!errors.phoneNumber}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.phoneNumber}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Date of Birth*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    placeholder="DD/MM/YYYY"
                                    isInvalid={!!errors.dateOfBirth}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.dateOfBirth}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    isInvalid={!!errors.email}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.email}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Student ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="studentID"
                                    value={formData.studentID}
                                    onChange={handleChange}
                                />
                                <Form.Text className="text-muted">
                                    Required for student discount tickets
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3 mt-4">
                                <Form.Check
                                    type="checkbox"
                                    label="Disability Status"
                                    name="isDisability"
                                    checked={formData.isDisability}
                                    onChange={handleChange}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Revolutionary Contribution"
                                    name="isRevolutionaryContribution"
                                    checked={formData.isRevolutionaryContribution}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <Button variant="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary"
                            disabled={isCreating || isUpdating}
                        >
                            {(isCreating || isUpdating) ? (
                                <>
                                    <Spinner animation="border" size="sm" /> 
                                    {isEditMode ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                isEditMode ? 'Update Passenger' : 'Create Passenger'
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default PassengerForm;