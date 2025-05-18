import React, { useState, useEffect } from 'react';
import {
    Form,
    Button,
    Card,
    Alert,
    Spinner,
    Table,
    Row,
    Col
} from 'react-bootstrap';
import { 
    useGetPawaTicketTypesQuery,
    usePurchaseTicketsForPassengerMutation
} from '../../ticket/store/pawaTicketApiSlice';

const PassengerTicketPurchase = ({ passengers = [] }) => {
    const { data: ticketTypes = [], isLoading: isLoadingTickets } = useGetPawaTicketTypesQuery();
    const [purchaseTickets, { isLoading: isPurchasing }] = usePurchaseTicketsForPassengerMutation();
    
    const [selectedPassengerId, setSelectedPassengerId] = useState('');
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [purchaseResult, setPurchaseResult] = useState(null);
    const [error, setError] = useState(null);
    
    // Reset selected tickets when passenger changes
    useEffect(() => {
        setSelectedTickets([]);
    }, [selectedPassengerId]);
    
    // Get selected passenger details
    const selectedPassenger = passengers.find(p => p.id === selectedPassengerId);
    
    // Remove a ticket from the selection
    const removeTicket = (index) => {
        const newTickets = [...selectedTickets];
        newTickets.splice(index, 1);
        setSelectedTickets(newTickets);
    };

        // Add this function to handle dynamic pricing for ONE_WAY tickets
    const calculateOneWayPrice = (stationCount) => {
        if (stationCount <= 4) return 8000;
        if (stationCount <= 8) return 12000;
        return 20000; // above 8 stations
    };

    // Update the addTicket function to set the correct initial price
    const addTicket = (ticketType) => {
        // Default station counts for ONE_WAY tickets
        const stationCount = ticketType.type === 'ONE_WAY' ? 4 : 0;
        
        // Calculate the correct price for ONE_WAY tickets
        const price = ticketType.type === 'ONE_WAY' 
            ? calculateOneWayPrice(stationCount) 
            : ticketType.price;
        
        setSelectedTickets([...selectedTickets, {
            type: ticketType.type,
            name: ticketType.name,
            price: price,
            stationCount: stationCount,
            basePrice: ticketType.price // Store the base price for non-ONE_WAY tickets
        }]);
    };

    // Update the updateStationCount function to recalculate price
    const updateStationCount = (index, count) => {
        const newTickets = [...selectedTickets];
        const stationCount = parseInt(count, 10);
        newTickets[index].stationCount = stationCount;
        
        // Recalculate price for ONE_WAY tickets
        if (newTickets[index].type === 'ONE_WAY') {
            newTickets[index].price = calculateOneWayPrice(stationCount);
        }
        
        setSelectedTickets(newTickets);
    };
    
    // Calculate total amount
    const totalAmount = selectedTickets.reduce((sum, ticket) => sum + ticket.price, 0);
    
        // Add helper function to calculate age
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 0;
        
        // Parse the DOB format from DD/MM/YYYY to a Date object
        const parts = dateOfBirth.split('/');
        if (parts.length !== 3) return 0;
        
        const birthDate = new Date(parts[2], parts[1] - 1, parts[0]); // Year, Month (0-indexed), Day
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        
        // Adjust age if birthday hasn't occurred yet this year
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };

    // Improve the isTicketTypeAvailable function
    const isTicketTypeAvailable = (ticketType) => {
        if (!selectedPassenger) return false;
        
        // Get the passenger's age
        const age = calculateAge(selectedPassenger.dateOfBirth);
        
        // Check all possible requirements
        for (const requirement of ticketType.requirements) {
            switch (requirement) {
                case 'STUDENT':
                    if (!selectedPassenger.isStudent && !selectedPassenger.studentID) {
                        return false;
                    }
                    break;
                case 'DISABLED':
                    if (!selectedPassenger.isDisability) {
                        return false;
                    }
                    break;
                case 'REVOCONTRIBUTE':
                    if (!selectedPassenger.isRevolutionaryContribution) {
                        return false;
                    }
                    break;
                case 'CHILDREN':
                    if (age >= 12) { // Assuming children are defined as under 12
                        return false;
                    }
                    break;
                case 'ELDER':
                    if (age < 60) { // Assuming elders are defined as 60+
                        return false;
                    }
                    break;
                case 'RIGHTLINE':
                    // This would require additional logic if line-specific tickets are implemented
                    // For now, assume all passengers can use all lines
                    break;
                default:
                    break;
            }
        }
        
        return true;
    };
    
    // Handle purchase
    const handlePurchase = async () => {
        if (!selectedPassenger) {
            setError("Please select a passenger before purchasing tickets");
            return;
        }
        
        if (selectedTickets.length === 0) {
            setError("Please select at least one ticket");
            return;
        }
        
        if (!selectedPassenger.userId) {
            setError("The selected passenger doesn't have a valid user ID");
            return;
        }
        
        try {
            setError(null);
            setPurchaseResult(null);
            
            // Format request to match API expectations
            const purchaseRequest = {
                userId: selectedPassenger.userId,
                email: selectedPassenger.email || "",
                type: selectedTickets.map(ticket => ticket.type),
                stationCount: selectedTickets.map(ticket => 
                            ticket.type === 'ONE_WAY' ? ticket.stationCount : 0
                        )
                    };
                    
                    console.log("Sending purchase request:", purchaseRequest);
                    const result = await purchaseTickets(purchaseRequest).unwrap();
                    console.log("Purchase result:", result);
                    
                    setPurchaseResult(result);
                    setSelectedTickets([]);
                    
                    // Show success message
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                } catch (err) {
                    console.error('Purchase failed:', err);
                    
                    // Handle different types of errors
                    if (err.status === 401) {
                        setError("Authentication error. Please log in again.");
                    } else if (err.status === 403) {
                        setError("You don't have permission to purchase tickets for this passenger.");
                    } else {
                        setError(err.data?.message || 'Failed to purchase tickets. Please try again later.');
                    }
                }
            };
    
    return (
        <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Purchase Tickets for Passenger</h5>
            </Card.Header>
            <Card.Body>
                {/* Passenger Selection */}
                <Form.Group className="mb-3">
                    <Form.Label>Select Passenger</Form.Label>
                    <Form.Select 
                        value={selectedPassengerId}
                        onChange={(e) => setSelectedPassengerId(e.target.value)}
                    >
                        <option value="">-- Select a passenger --</option>
                        {passengers.map(passenger => (
                            <option key={passenger.id} value={passenger.id}>
                                {passenger.firstName} {passenger.middleName} {passenger.lastName} - {passenger.nationalID}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                
                {selectedPassenger && (
                    <>
                        {/* Passenger Details */}
                        <Card className="mb-3">
                            <Card.Body>
                                <h6>Passenger Details</h6>
                                <Row>
                                    <Col md={6}>
                                        <p><strong>Name:</strong> {selectedPassenger.firstName} {selectedPassenger.middleName} {selectedPassenger.lastName}</p>
                                        <p><strong>National ID:</strong> {selectedPassenger.nationalID}</p>
                                        <p><strong>DOB:</strong> {selectedPassenger.dateOfBirth}</p>
                                    </Col>
                                    <Col md={6}>
                                        <p><strong>Phone:</strong> {selectedPassenger.phoneNumber}</p>
                                        <p>
                                            <strong>Special Status:</strong> {' '}
                                            {selectedPassenger.isStudent && 'Student, '}
                                            {selectedPassenger.isDisability && 'Disability, '}
                                            {selectedPassenger.isRevolutionaryContribution && 'Revolutionary Contribution'}
                                            {!selectedPassenger.isStudent && !selectedPassenger.isDisability && !selectedPassenger.isRevolutionaryContribution && 'None'}
                                        </p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="mb-3">
                            <Card.Header>
                                <h6 className="mb-0">Passenger Eligibility</h6>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <div className="mb-2">
                                            <span className={selectedPassenger.isStudent ? "text-success" : "text-muted"}>
                                                {selectedPassenger.isStudent ? "✓" : "✗"} Student Status
                                            </span>
                                        </div>
                                        <div className="mb-2">
                                            <span className={selectedPassenger.isDisability ? "text-success" : "text-muted"}>
                                                {selectedPassenger.isDisability ? "✓" : "✗"} Disability Status
                                            </span>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="mb-2">
                                            <span className={selectedPassenger.isRevolutionaryContribution ? "text-success" : "text-muted"}>
                                                {selectedPassenger.isRevolutionaryContribution ? "✓" : "✗"} Revolutionary Contribution
                                            </span>
                                        </div>
                                        <div className="mb-2">
                                            <span className={calculateAge(selectedPassenger.dateOfBirth) < 12 ? "text-success" : "text-muted"}>
                                                {calculateAge(selectedPassenger.dateOfBirth) < 12 ? "✓" : "✗"} Child (Under 12)
                                            </span>
                                        </div>
                                        <div className="mb-2">
                                            <span className={calculateAge(selectedPassenger.dateOfBirth) >= 60 ? "text-success" : "text-muted"}>
                                                {calculateAge(selectedPassenger.dateOfBirth) >= 60 ? "✓" : "✗"} Elder (60+)
                                            </span>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        
                        {/* Ticket Selection */}
                        <div className="mb-3">
                            <h6>Available Ticket Types</h6>
                            {isLoadingTickets ? (
                                <div className="text-center py-3">
                                    <Spinner animation="border" size="sm" /> Loading ticket types...
                                </div>
                            ) : (
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {ticketTypes.map(ticketType => (
                                        <Button
                                            key={`${ticketType.type}-${ticketType.name}`}
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => addTicket(ticketType)}
                                            disabled={!isTicketTypeAvailable(ticketType)}
                                            title={!isTicketTypeAvailable(ticketType) ? 
                                                'Passenger does not meet requirements for this ticket type' : 
                                                ''}
                                        >
                                            {ticketType.name} - {ticketType.price.toLocaleString()} VND
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Selected Tickets */}
                        {selectedTickets.length > 0 && (
                            <div className="mb-3">
                                <h6>Selected Tickets</h6>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Ticket Type</th>
                                            <th>Price</th>
                                            <th>Stations</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTickets.map((ticket, index) => (
                                            <tr key={index}>
                                                <td>{ticket.name}</td>
                                                <td>{ticket.price.toLocaleString()} VND</td>
                                                <td>
                                                    {ticket.type === 'ONE_WAY' ? (
                                                        <Form.Select
                                                            size="sm"
                                                            value={ticket.stationCount}
                                                            onChange={(e) => updateStationCount(index, e.target.value)}
                                                        >
                                                            <option value="4">Up to 4 stations (8,000 VND)</option>
                                                            <option value="8">5-8 stations (12,000 VND)</option>
                                                            <option value="12">Above 8 stations (20,000 VND)</option>
                                                        </Form.Select>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </td>
                                                <td>
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        onClick={() => removeTicket(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                                            <td><strong>{totalAmount.toLocaleString()} VND</strong></td>
                                        </tr>
                                    </tbody>
                                </Table>
                                
                                <div className="d-flex justify-content-end">
                                    <Button
                                        variant="primary"
                                        onClick={handlePurchase}
                                        disabled={isPurchasing || selectedTickets.length === 0}
                                    >
                                        {isPurchasing ? (
                                            <>
                                                <Spinner animation="border" size="sm" /> Processing...
                                            </>
                                        ) : (
                                            'Purchase Tickets'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        {/* Purchase Result */}
                        {purchaseResult && (
                            <Alert variant="success" className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Purchase Successful!</h5>
                                    <Button 
                                        variant="outline-success" 
                                        size="sm"
                                        onClick={() => {
                                            // Here you could implement a print function
                                            window.print();
                                        }}
                                    >
                                        Print Receipt
                                    </Button>
                                </div>
                                
                                <div className="border-bottom pb-2 mb-3">
                                    <p className="mb-1"><strong>Passenger:</strong> {selectedPassenger.firstName} {selectedPassenger.lastName}</p>
                                    <p className="mb-1"><strong>Transaction ID:</strong> {purchaseResult.transactionId}</p>
                                    <p className="mb-1"><strong>Date:</strong> {new Date(purchaseResult.purchaseTime).toLocaleString()}</p>
                                    <p className="mb-1"><strong>Status:</strong> <span className="text-success">{purchaseResult.status}</span></p>
                                    <p className="mb-1"><strong>Payment Method:</strong> {purchaseResult.paymentMethod}</p>
                                </div>
                                
                                <h6>Purchased Tickets:</h6>
                                <Table bordered size="sm" className="mb-3">
                                    <thead>
                                        <tr>
                                            <th>Ticket Type</th>
                                            <th>Price</th>
                                            <th>Stations</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchaseResult.tickets.map(ticket => (
                                            <tr key={ticket.id}>
                                                <td>{ticket.type}</td>
                                                <td>{ticket.price.toLocaleString()} VND</td>
                                                <td>{ticket.stationCount || 'N/A'}</td>
                                                <td>{ticket.status}</td>
                                            </tr>
                                        ))}
                                        <tr className="table-primary">
                                            <td colSpan="1"><strong>Total</strong></td>
                                            <td colSpan="3"><strong>{purchaseResult.totalAmount.toLocaleString()} VND</strong></td>
                                        </tr>
                                    </tbody>
                                </Table>
                                
                                <div className="text-muted mt-3">
                                    <small>* Tickets must be activated before use.</small><br/>
                                    <small>* Ticket validity begins upon activation.</small>
                                </div>
                            </Alert>
                        )}
                        
                        {/* Error Message */}
                        {error && (
                            <Alert variant="danger" className="mt-3">
                                {error}
                            </Alert>
                        )}
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default PassengerTicketPurchase;