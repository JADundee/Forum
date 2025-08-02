import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";
import { jwtDecode } from "jwt-decode";

// Custom hook to extract and decode user authentication info from JWT token in Redux store
const useAuth = () => {
  // Get the current JWT token from Redux state
  const token = useSelector(selectCurrentToken);
  let isAdmin = false;
  let status = "Member";
  let userId = null;

  // If a token exists, decode it to extract user info
  if (token) {
    const decoded = jwtDecode(token);
    // Extract username, roles, and user ID from the decoded token
    const { username, roles, _id } = decoded.UserInfo;

    userId = _id;
    // Check if the user has the Admin role
    isAdmin = roles.includes("Admin");

    // Set status string based on role
    if (isAdmin) status = "Admin";

    // Return all relevant user info
    return { username, roles, status, isAdmin, userId };
  }

  // If no token, return default/empty user info
  return { username: "", roles: [], isAdmin, status, userId };
};
export default useAuth;
