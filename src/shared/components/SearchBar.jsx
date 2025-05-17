import React, { useState, useRef } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Search, Sliders } from 'react-bootstrap-icons';

const SearchBar = ({ 
    onSearch, 
    onFilter, 
    placeholder = "Search...",
    showFilterButton = false,
    FilterPopupComponent = null
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});
    const [hasActiveFilters, setHasActiveFilters] = useState(false);
    const filterBtnRef = useRef(null);

    // Handle real-time search as user types
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    // Only used when filtering is enabled
    const handleFilterApply = (filters) => {
        if (!onFilter) return;
        
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
        if (!onFilter) return;
        
        setActiveFilters({});
        setHasActiveFilters(false);
        onFilter({});
    };

    return (
        <div className="search-bar-container mb-4 position-relative">
            <InputGroup>
                <Form.Control
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                />
                <Button 
                    variant="outline-secondary"
                    onClick={() => {
                        // Clear search functionality
                        if (searchTerm) {
                            setSearchTerm('');
                            onSearch('');
                        }
                    }}
                >
                    {searchTerm ? <span>×</span> : <Search />}
                </Button>
                
                {/* Only show filter button if filtering is enabled */}
                {showFilterButton && FilterPopupComponent && (
                    <Button
                        ref={filterBtnRef}
                        variant={hasActiveFilters ? "primary" : "outline-secondary"}
                        onClick={() => setShowFilterPopup(prev => !prev)}
                    >
                        <Sliders />
                        {hasActiveFilters && <span className="ms-2 badge bg-light text-dark">Active</span>}
                    </Button>
                )}
            </InputGroup>

            {/* Render filter popup component if provided and shown */}
            {showFilterPopup && FilterPopupComponent && (
                <FilterPopupComponent
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