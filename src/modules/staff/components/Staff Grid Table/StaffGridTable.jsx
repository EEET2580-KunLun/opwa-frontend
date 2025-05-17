import {Button, Table, Modal, Badge} from "react-bootstrap";
import React, {useState} from "react";
import {PLACEHOLDER_USER_IMAGE} from "../../../../shared/constant.js";
import {selectCurrentUser} from "../../../auth/store/authSlice.js";
import {useSelector} from "react-redux";
import {useStaffGridTable} from "./hooks/useStaffGridTable.js";
import {useNavigate} from "react-router-dom";
import SortableHeader from "../../../../shared/components/SortableHeader.jsx";

const StaffGridTable = ({ 
    staffData = [], 
    currentSort = { field: 'firstName', direction: 'ASC' },
    onSort 
}) => {
    const currentUser = useSelector(selectCurrentUser);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const { deleteStaff, isLoading } = useStaffGridTable(staffToDelete || {});
    const navigate = useNavigate();

    // Use the default empty array if staffData is null/undefined
    const staffs = staffData || [];

    const handleDeleteClick = (staff) => {
        setStaffToDelete(staff);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!staffToDelete) return;

        try {
            await deleteStaff();
            setShowConfirmModal(false);
        } catch (error) {
            console.error("Error during deletion:", error);
        }
    };

    const handleEditClick = (staff) => {
        // Navigate to the edit page with staff data
        navigate(`/admin/staff/edit/${staff.id}`, {
            state: { initialData: staff }
        });
    };

    return (
        <>
            <div className="card">
                <Table className="table-hover mb-0">
                    <thead className="bg-primary text-white">
                    <tr>
                        <SortableHeader 
                            label="Name" 
                            field="firstName" 
                            currentSort={currentSort}
                            onSort={onSort} 
                        />
                        <SortableHeader 
                            label="Email" 
                            field="email" 
                            currentSort={currentSort}
                            onSort={onSort} 
                        />
                        <SortableHeader 
                            label="Phone" 
                            field="phoneNumber" 
                            currentSort={currentSort}
                            onSort={onSort} 
                        />
                        <SortableHeader 
                            label="Role" 
                            field="role" 
                            currentSort={currentSort}
                            onSort={onSort} 
                        />
                        <SortableHeader 
                            label="Shift" 
                            field="shift" 
                            currentSort={currentSort}
                            onSort={onSort} 
                        />
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {staffs.length > 0 ? (
                        staffs.map(staff => {
                            const isCurrentUser = currentUser.id === staff.id;
                            return (
                                <tr key={staff.id} className={isCurrentUser ? "bg-light" : ""}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div
                                                className={`${isCurrentUser ? 'bg-primary' : 'bg-light'} rounded-circle d-flex align-items-center justify-content-center me-2`}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    border: isCurrentUser ? '2px solid #0d6efd' : 'none'
                                                }}>
                                                <img
                                                    src={typeof staff?.profile_picture === 'string' ? staff.profile_picture : PLACEHOLDER_USER_IMAGE}
                                                    alt="User Avatar"
                                                    className="avatar-img"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = PLACEHOLDER_USER_IMAGE;
                                                    }}
                                                />
                                            </div>
                                            <div className="ms-2">
                                                {staff.first_name} {staff.middle_name ? `${staff.middle_name} ` : ''}{staff.last_name}
                                                {isCurrentUser && <Badge bg="primary" className="ms-2">You</Badge>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{staff.email}</td>
                                    <td>{staff.phone_number}</td>
                                    <td>{staff.role}</td>
                                    <td>{staff.shift}</td>
                                    <td>
                                        <Button
                                            variant="link"
                                            className={"text-success p-0 me-3"}
                                            onClick={() => {
                                                handleEditClick(staff);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="link"
                                            className={isCurrentUser ? "text-secondary p-0" : "text-danger p-0"}
                                            onClick={() => {
                                                handleDeleteClick(staff);
                                            }}
                                            disabled={isCurrentUser}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-3">No staff data available</td>
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
                    Are you sure you want to delete staff member
                    <strong> {staffToDelete?.first_name} {staffToDelete?.last_name}</strong>?
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

export default StaffGridTable;