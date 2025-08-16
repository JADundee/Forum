import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useGetUsersQuery } from "./usersApiSlice";
import { memo } from "react";

// User component for displaying a single user's row in the users table
const User = ({ userId }) => {
  // Fetch the user data for the given userId
  const { user } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      user: data?.entities[userId],
    }),
  });

  // Navigation hook
  const navigate = useNavigate();

  if (user) {
    // Handler for navigating to the edit user page
    const handleEdit = () => navigate(`/dash/users/${userId}`);

    // Convert user roles array to a comma-separated string
    const userRolesString = user.roles.toString().replaceAll(",", ", ");

    // Determine cell style based on user active status
    const cellStatus = user.active ? "" : "table__cell--inactive";

    // Render the user's table row
    return (
      <tr className="table__row user">
        <td className={`table__cell ${cellStatus}`}>{user.username}</td>
        <td className={`table__cell ${cellStatus}`}>{userRolesString}</td>
        <td className={`table__cell ${cellStatus}`}>
          <button className="button--icon table__button" onClick={handleEdit}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
        </td>
      </tr>
    );
  } else return null;
};

// Memoize the User component to prevent unnecessary re-renders
const memoizedUser = memo(User);

export default memoizedUser;
