import { Outlet } from "react-router-dom";

/**
 * Main layout component for public-facing pages.
 * Uses React Router's Outlet to render nested routes.
 */
const Layout = () => {
  // Render the main layout with nested routes
  return <Outlet />;
};

export default Layout;
