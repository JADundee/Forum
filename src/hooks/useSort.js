import { useState, useCallback } from "react";

// Helper function to sort an array of data by a given config and optional entities map
function sortArray(data, config, entities) {
  // If no sort key is provided, return data as-is
  if (!config?.key) return data;

  // Helper to get the value to sort by, from either an entity or the item itself
  const getValue = (item) => {
    const obj = entities ? entities[item] : item;
    return obj?.[config.key];
  };

  // Sort the data array by the configured key and direction
  const sorted = [...data].sort((a, b) => {
    const aValue = getValue(a);
    const bValue = getValue(b);

    if (aValue === undefined || bValue === undefined) return 0;
    if (aValue < bValue) return config.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return config.direction === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

// Custom hook to manage sorting state and logic for tables/lists
export default function useSort(
  initialKey = "createdAt",
  initialDirection = "desc"
) {
  // State for current sort config (key and direction)
  const [sortConfig, setSortConfig] = useState({
    key: initialKey,
    direction: initialDirection,
  });

  // Handler to update sort config when a column is clicked
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle direction if the same key is clicked
        return { key, direction: prev.direction === "desc" ? "asc" : "desc" };
      } else {
        // Default to descending for new key
        return { key, direction: "desc" };
      }
    });
  }, []);

  // Memoized function to sort data using the current config
  const sortData = useCallback(
    (data, entities) => {
      return sortArray(data, sortConfig, entities);
    },
    [sortConfig]
  );

  // Return sort config, handler, and sort function for use in components
  return { sortConfig, handleSort, setSortConfig, sortData };
}
