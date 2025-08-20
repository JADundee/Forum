import useAuth from "../hooks/useAuth";

/**
 * Dashboard footer component for the application.
 * Displays the current user, their permissions, and the current date.
 */
const DashFooter = () => {
  // Get current user and status from authentication hook
  const { username, status } = useAuth();

  // Get today's date in a readable format
  const date = new Date();
  const today = new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
    date
  );

  // Renders the footer content including user info, permissions, and date. 
  const content = (
    <footer className="dashboard__footer">
      {/* Display current user */}
      <p>Current User: {username}</p>
      {/* Display user permissions */}
      <span className="dashboard__footer-permissions">
        <p>Permissions: {status}</p>
      </span>
      {/* Display today's date */}
      <p className="dashboard__footer-date">{today}</p>
    </footer>
  );
  return content;
};

export default DashFooter;
