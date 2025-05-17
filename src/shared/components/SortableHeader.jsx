import React from 'react';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';

const SortableHeader = ({ label, field, currentSort, onSort }) => {
    const isSorted = currentSort.field === field;
    const direction = currentSort.direction || 'ASC';
    
    const handleClick = () => {
        const newDirection = isSorted && direction === 'ASC' ? 'DESC' : 'ASC';
        onSort(field, newDirection);
    };
    
    return (
        <th 
            onClick={handleClick} 
            style={{ cursor: 'pointer' }}
            className="user-select-none"
        >
            <div className="d-flex align-items-center">
                {label}
                <span className="ms-2">
                    {isSorted ? (
                        direction === 'ASC' ? <FaSortUp /> : <FaSortDown />
                    ) : (
                        <FaSort style={{ opacity: 0.3 }} />
                    )}
                </span>
            </div>
        </th>
    );
};

export default SortableHeader;