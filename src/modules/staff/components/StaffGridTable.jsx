import {Button, Table} from "react-bootstrap";
import React from "react";
import {PLACEHOLDER_USER_IMAGE} from "../../../shared/constant.js";

const staffGridTable = ({ staffData = [] }) => {
    // Use the default empty array if staffData is null/undefined
    const data = staffData || [];
    return (
        <div className="card">
            <Table className="table-hover mb-0">
                <thead className="bg-primary text-white">
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Shift</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {data.length > 0 ? (
                    data.map(staff => (
                        <tr key={staff.id}>
                            <td>
                                <div className="d-flex align-items-center">
                                    <div
                                        className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{width: '40px', height: '40px'}}>
                                        <img
                                            src={typeof staff?.profile_picture === 'string' ? staff.profile_picture : PLACEHOLDER_USER_IMAGE}
                                            alt="User Avatar"
                                            className="avatar-img"
                                            onError={(e) => {
                                                e.target.onerror = null; // Prevents looping
                                                e.target.src = PLACEHOLDER_USER_IMAGE; // Fallback image
                                            }}
                                        />
                                    </div>
                                    {staff.name}
                                </div>
                            </td>
                            <td>{staff.email}</td>
                            <td>{staff.phone}</td>
                            <td>{staff.role}</td>
                            <td>{staff.shift}</td>
                            <td>
                                <Button variant="link" className="text-success p-0 me-3">Edit</Button>
                                <Button variant="link" className="text-danger p-0">Delete</Button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="text-center py-3">No staff data available</td>
                    </tr>
                )}
                </tbody>
            </Table>
        </div>
    )
}

export default staffGridTable;