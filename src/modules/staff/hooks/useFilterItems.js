import { useState, useMemo } from 'react';

export const useFilterItems = ({ items, itemsPerPage, filterFn, searchFn }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter items based on filterFn and searchFn
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const passesFilter = filterFn ? filterFn(item) : true;
            const passesSearch = searchFn ? searchFn(item, searchTerm) : true;
            return passesFilter && passesSearch;
        });
    }, [items, searchTerm, filterFn, searchFn]);

    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    // Calculate total pages
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    // When search term changes, reset to first page
    const handleSearchTermChange = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    return {
        currentItems,
        currentPage,
        totalPages,
        setSearchTerm: handleSearchTermChange,
        setCurrentPage,
        handlePageChange
    };
};