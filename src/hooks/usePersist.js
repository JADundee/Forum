import { useState, useEffect } from "react";

// Custom hook to manage persistent login state using localStorage
const usePersist = () => {
  // State for whether persistence is enabled, initialized from localStorage
  const [persist, setPersist] = useState(
    JSON.parse(localStorage.getItem("persist")) || false
  );

  // Update localStorage whenever persist state changes
  useEffect(() => {
    localStorage.setItem("persist", JSON.stringify(persist));
  }, [persist]);

  // Return the persist state and setter for use in components
  return [persist, setPersist];
};
export default usePersist;
