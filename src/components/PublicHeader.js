import { useNavigate, useLocation } from "react-router-dom";

/**
 * Header component for public-facing pages.
 * Displays the Forum title and handles navigation to the login page.
 */
const PublicHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isLoginPage = pathname === "/";

  // Render the header with title and navigation
  return (
    <header className="public__header">
      {isLoginPage ? (
        <h1 className="public__header-link public__header-link--disabled">
          Forum
        </h1>
      ) : (
        <span
          className="public__header-link"
          onClick={() => navigate("/")}
          tabIndex={0}
          role="button"
          onKeyPress={(e) => {
            if (e.key === "Enter") navigate("/");
          }}>
          Forum
        </span>
      )}
    </header>
  );
};

export default PublicHeader;
