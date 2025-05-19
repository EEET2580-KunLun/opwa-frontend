import React, { useState } from "react";
import { Button, Table, Modal, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { PencilFill, CreditCardFill, TrashFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { PLACEHOLDER_USER_IMAGE } from "../../../shared/constant.js";
import {toast} from "sonner";

const PassengerGrid = ({ passengerData = [] }) => {
    const navigate = useNavigate();

    // Use the default empty array if passengerData is null/undefined
    const passengers = passengerData || [];

    console.log('Number of passengers:', passengerData?.length);

    const handlePurchaseClick = (passenger) => {
        console.log('Clicked purchase for:', passenger);
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
                                    <div className="d-flex">

                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip>Purchase a ticket for this passenger</Tooltip>}
                                        >
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2 d-flex align-items-center"
                                                onClick={() => handlePurchaseClick(passenger)}
                                            >
                                                <CreditCardFill className="me-1" size={14} />
                                                <span className="d-none d-md-inline">Purchase</span>
                                            </Button>
                                        </OverlayTrigger>

                                    </div>
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

        </>
    );
};

export default PassengerGrid;