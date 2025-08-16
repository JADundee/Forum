import { useGetUsersQuery } from "./usersApiSlice";
import User from "./User";
import DataTable from "../../components/DataTable";
import useSort from "../../hooks/useSort";

// UsersList component for displaying a sortable table of all users
const UsersList = () => {
  // Fetch users data and status flags from the API
  const {
    data: users,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetUsersQuery("usersList", {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  // Custom hook for sorting table data
  const { sortConfig, handleSort, sortData } = useSort("username", "asc");

  let content; // Will hold the rendered content

  // Show loading message while fetching users
  if (isLoading) content = <p>Loading...</p>;

  // Show error message if fetching users failed
  if (isError) {
    content = <p className="error-message">{error?.data?.message}</p>;
  }

  // Render the users table if data fetch was successful
  if (isSuccess) {
    const { ids, entities } = users;

    // Define columns for the DataTable
    const columns = [
      { key: "username", label: "Username", sortable: true },
      { key: "roles", label: "Roles" },
      { key: "edit", label: "Edit" },
    ];

    // Sort the user data for display
    const data = sortData(ids, entities);

    // Render a row for each user
    const renderRow = (userId) => <User key={userId} userId={userId} />;

    // Render the DataTable component with user data
    content = (
      <DataTable
        columns={columns}
        data={data}
        emptyMsg="No users found."
        renderRow={renderRow}
        sortConfig={sortConfig}
        onSort={handleSort}
        tableClassName="table table--users"
      />
    );
  }

  // Return the rendered content
  return content;
};
export default UsersList;
