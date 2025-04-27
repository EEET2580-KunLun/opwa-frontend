import {Button, Form, InputGroup} from "react-bootstrap";
import {Search} from "react-bootstrap-icons";
import React from "react";

const SearchBar = () => {
    return(
        <div className="d-flex mb-3">
            <InputGroup className="me-2" style={{ maxWidth: '250px' }}>
                <InputGroup.Text className="bg-white border-end-0">
                    <Search />
                </InputGroup.Text>
                <Form.Control
                    placeholder="Search staff"
                    className="border-start-0"
                />
            </InputGroup>
            <Button variant="light" className="border">
                Filter
            </Button>
        </div>
    )
}

export default SearchBar;