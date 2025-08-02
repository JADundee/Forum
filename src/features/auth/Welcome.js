import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

/**
 * Welcome page for authenticated users.
 * Displays links to forums, add forum, and users (if admin).
 */
const Welcome = () => {
  const { username, isAdmin } = useAuth();

  // Render welcome content with navigation links
  const content = (
    <section className="welcome">
      <h1>
        Welcome, <span className="username">{username}</span>!
      </h1>
      <p>
        <Link to="/dash/forums">View Forums</Link>
      </p>
      <p>
        <Link to="/dash/forums/new">Add New Forum</Link>
      </p>
      {isAdmin && (
        <p>
          <Link to="/dash/users">View Users</Link>
        </p>
      )}
    </section>
  );

  return content;
};
export default Welcome;
