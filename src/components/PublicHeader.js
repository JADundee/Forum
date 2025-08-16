import { useLocation, Link } from "react-router-dom";

/**
 * Header component for public-facing pages.
 * Displays the Forum title and handles navigation to the login page.
 */
const PublicHeader = () => {
  const { pathname } = useLocation();
  const isLoginPage = pathname === "/";

  // Render the header with title and navigation
  return (
    <header className="dashboard-header">
      {isLoginPage ? (
        <h1 className="dash-header__title dash-header__title--disabled">
          Forum
        </h1>
      ) : (
        <Link to="/">
         <h1 className="dash-header__title">Forum</h1>
        </Link>
      )}
    </header>
  );
};

export default PublicHeader;
