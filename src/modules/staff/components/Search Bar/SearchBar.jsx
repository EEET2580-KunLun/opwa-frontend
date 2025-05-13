import React, { useState, useRef } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Search, Sliders } from 'react-bootstrap-icons';
import FilterPopup from './FilterPopup.jsx';

const SearchBar = ({ onSearch, onFilter }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});
    const [hasActiveFilters, setHasActiveFilters] = useState(false);
    const filterBtnRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        if (e.target.value === '') {
            onSearch('');
        }
    };

    const handleFilterApply = (filters) => {
        setActiveFilters(filters);

        // Check if any filter has a value
        const hasFilters = Object.values(filters).some(value =>
            value !== undefined && value !== '' &&
            (typeof value !== 'string' || value.trim() !== '')
        );

        setHasActiveFilters(hasFilters);
        onFilter(filters);
    };

    const clearFilters = () => {
        setActiveFilters({});
        setHasActiveFilters(false);
        onFilter({});
    };

    return (
        <div className="search-bar-container mb-4 position-relative">
            <Form onSubmit={handleSearch}>
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder="Search staff by name, email, or username..."
                        value={searchTerm}
                        onChange={handleInputChange}
                    />
                    <Button type="submit" variant="outline-secondary">
                        <Search />
                    </Button>
                    <Button
                        ref={filterBtnRef}
                        variant={hasActiveFilters ? "primary" : "outline-secondary"}
                        onClick={() => setShowFilterPopup(prev => !prev)}
                    >
                        <Sliders />
                        {hasActiveFilters && <span className="ms-2 badge bg-light text-dark">Active</span>}
                    </Button>
                </InputGroup>
            </Form>

            {showFilterPopup && (
                <FilterPopup
                    onClose={() => setShowFilterPopup(false)}
                    onApply={handleFilterApply}
                    onClear={clearFilters}
                    activeFilters={activeFilters}
                />
            )}
        </div>
    );
};

export default SearchBar;