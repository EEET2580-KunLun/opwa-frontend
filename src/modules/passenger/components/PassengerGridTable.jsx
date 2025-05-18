import React, { useState } from "react";
import { Button, Table, Modal, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDeletePassengerMutation } from '../store/pawaPassengerApiSlice.js';
import { PLACEHOLDER_USER_IMAGE } from "../../../shared/constant.js";

const PassengerGridTable = ({ passengerData = [] }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [passengerToDelete, setPassengerToDelete] = useState(null);
    const [deletePassenger, { isLoading }] = useDeletePassengerMutation();
    const navigate = useNavigate();

    // Use the default empty array if passengerData is null/undefined
    const passengers = passengerData || [];

    const handleDeleteClick = (passenger) => {
        setPassengerToDelete(passenger);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        // Delete passenger logic
    };

    const handleEditClick = (passenger) => {
        navigate(`/admin/passenger/edit/${passenger.id}`, {
            state: { isEditMode: true, initialData: passenger }
        });
    };

    // Replace the direct purchase logic with redirection to ticket module
    const handlePurchaseClick = (passenger) => {
        // Redirect to ticket purchase page with passenger info in state
        navigate(`/ticket-agent/tickets/sell`, {
            state: { 
                passengerId: passenger.id,
                passengerInfo: passenger,
                redirectSource: 'passenger-management'
            }
        });
    };

    return (
        <>
            <div className="card">
                <Table className="table-hover mb-0">
                    <thead className="bg-primary text-white">
                    <tr>
                        <th>Name</th>
                        <th>National ID</th>
                        <th>Phone</th>
                        <th>DOB</th>
                        <th>Type</th>
                        <th>Special Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {passengers.length > 0 ? (
                        passengers.map(passenger => (
                            <tr key={passenger.id}>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2"
                                            style={{
                                                width: '40px',
                                                height: '40px'
                                            }}>
                                            <img
                                                src={PLACEHOLDER_USER_IMAGE}
                                                alt="User Avatar"
                                                className="avatar-img"
                                            />
                                        </div>
                                        <div className="ms-2">
                                            {passenger.firstName} {passenger.middleName ? `${passenger.middleName} ` : ''}{passenger.lastName}
                                        </div>
                                    </div>
                                </td>
                                <td>{passenger.nationalID}</td>
                                <td>{passenger.phoneNumber}</td>
                                <td>{passenger.dateOfBirth}</td>
                                <td>{passenger.isStudent ? 'Student' : passenger.passengerType}</td>
                                <td>
                                    {passenger.isDisability && <Badge bg="info" className="me-1">Disability</Badge>}
                                    {passenger.isRevolutionaryContribution && <Badge bg="success">Revolutionary</Badge>}
                                </td>
                                <td>
                                    <Button
                                        variant="link"
                                        className="text-success p-0 me-2"
                                        onClick={() => handleEditClick(passenger)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="link"
                                        className="text-primary p-0 me-2"
                                        onClick={() => handlePurchaseClick(passenger)}
                                    >
                                        Purchase
                                    </Button>
                                    <Button
                                        variant="link"
                                        className="text-danger p-0"
                                        onClick={() => handleDeleteClick(passenger)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center py-3">No passenger data available</td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            </div>
            
            {/* Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete passenger
                    <strong> {passengerToDelete?.firstName} {passengerToDelete?.lastName}</strong>?
                    <br/>
                    This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={confirmDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default PassengerGridTable;