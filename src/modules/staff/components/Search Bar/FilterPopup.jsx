import { Button, Form, Row, Col } from "react-bootstrap";
import { useState } from "react";
import { X } from 'react-bootstrap-icons';

const FilterPopup = ({ onClose, onApply, onClear, activeFilters = {} }) => {
    const [filters, setFilters] = useState({...activeFilters});

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleClear = () => {
        setFilters({});
        onClear();
    };

    // Generate year options from 1960 to current year
    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= 1960; year--) {
            years.push(
                <option key={year} value={year}>
                    {year}
                </option>
            );
        }
        return years;
    };

    return (
        <div className="filter-popup card position-absolute start-0 mt-1 shadow-lg" style={{zIndex: 1000, width: '450px'}}>
            <div className="card-header d-flex justify-content-between align-items-center bg-light">
                <h5 className="mb-0">Advanced Filter</h5>
                <Button variant="link" className="p-0 text-dark" onClick={onClose}>
                    <X size={20}/>
                </Button>
            </div>
            <div className="card-body">
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                value={filters.role || ''}
                                onChange={(e) => handleFilterChange('role', e.target.value)}
                            >
                                <option value="">Any Role</option>
                                <option value="TICKET_AGENT">Ticket Agent</option>
                                <option value="ADMIN">Admin</option>
                                <option value="OPERATOR">Operator</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Shift</Form.Label>
                            <Form.Select
                                value={filters.shift || ''}
                                onChange={(e) => handleFilterChange('shift', e.target.value)}
                            >
                                <option value="">Any Shift</option>
                                <option value="DAY">Day</option>
                                <option value="EVENING">Evening</option>
                                <option value="NIGHT">Night</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Employment Status</Form.Label>
                            <Form.Select
                                value={filters.employed === undefined ? '' : filters.employed.toString()}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                        handleFilterChange('employed', undefined);
                                    } else {
                                        handleFilterChange('employed', value === 'true');
                                    }
                                }}
                            >
                                <option value="">Any Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter city"
                                value={filters.city || ''}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>District</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter district"
                                value={filters.district || ''}
                                onChange={(e) => handleFilterChange('district', e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Birth Year (Before)</Form.Label>
                            <Form.Select
                                value={filters.birthYearBefore || ''}
                                onChange={(e) => handleFilterChange('birthYearBefore', e.target.value)}
                            >
                                <option value="">Any Year</option>
                                {generateYearOptions()}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
            </div>
            <div className="card-footer d-flex justify-content-between bg-light">
                <Button variant="outline-danger" onClick={handleClear}>Clear Filters</Button>
                <div>
                    <Button variant="outline-secondary" className="me-2" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleApply}>Apply Filters</Button>
                </div>
            </div>
        </div>
    );
};

export default FilterPopup;