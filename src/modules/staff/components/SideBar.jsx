import {Button, Col, Nav} from "react-bootstrap";
import {Person} from "react-bootstrap-icons";
import React from "react";

const SideBar = () => {
    return(
        <Col md={2} className="bg-light min-vh-100 border-end">
            <div className="p-3">
                <Button variant="primary" className="w-100 mb-3">View staff</Button>
                <Nav className="flex-column">
                    <Nav.Link className="px-0">Metro Lines Management</Nav.Link>
                    <Nav.Link className="px-0 fw-bold">View staff</Nav.Link>
                    <Nav.Link className="px-0">Dashboard</Nav.Link>
                </Nav>
            </div>
            <div className="position-absolute bottom-0 start-0 w-100 border-top p-3">
                <div className="d-flex align-items-center mb-3">
                    <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                        <Person color="white" size={24} />
                    </div>
                    <div>
                        <div className="fw-bold">Admin</div>
                    </div>
                </div>
                <Button variant="outline-secondary" className="w-100">
                    Log out
                </Button>
            </div>
        </Col>
    )
}

export default SideBar;