import { useEffect } from "react";

// Custom hook to set the document title and restore it on cleanup
const useTitle = (title) => {
  useEffect(() => {
    // Store the previous document title
    const prevTitle = document.title;
    // Set the new document title
    document.title = title;

    // Restore the previous title when the component unmounts or title changes
    return () => (document.title = prevTitle);
  }, [title]);
};

export default useTitle;
