import { useState, useCallback } from 'react';

// Generic sorting function for arrays of objects or ids/entities
function sortArray(data, config, entities) {
    if (!config?.key) return data;

    // If entities are provided, data is an array of ids, otherwise array of objects
    const getValue = (item) => {
        const obj = entities ? entities[item] : item;
        return obj?.[config.key];
    };

    const sorted = [...data].sort((a, b) => {
        const aValue = getValue(a);
        const bValue = getValue(b);

        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return sorted;
}

export default function useSort(initialKey = 'createdAt', initialDirection = 'desc') {
    const [sortConfig, setSortConfig] = useState({ key: initialKey, direction: initialDirection });

    // For table headers
    const handleSort = useCallback((key) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
            } else {
                return { key, direction: 'desc' };
            }
        });
    }, []);

    // For sorting data
    const sortData = useCallback((data, entities) => {
        return sortArray(data, sortConfig, entities);
    }, [sortConfig]);

    return { sortConfig, handleSort, setSortConfig, sortData };
}
