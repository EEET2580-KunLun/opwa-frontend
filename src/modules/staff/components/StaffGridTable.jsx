import {Button, Table} from "react-bootstrap";
import {Person} from "react-bootstrap-icons";
import React from "react";


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
                                        <Person color="gray" size={20}/>
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