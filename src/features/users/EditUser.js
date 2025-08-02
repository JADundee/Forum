import { useParams } from "react-router-dom";
import EditUserForm from "./EditUserForm";
import { useGetUsersQuery } from "./usersApiSlice";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";

const EditUser = () => {
  // Set the document title for this page
  useTitle("theForum: Edit User");

  // Get the user ID from the URL parameters
  const { id } = useParams();

  // Fetch the user data from the API, selecting only the user with the matching ID
  const { user } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      user: data?.entities[id],
    }),
  });

  // Show a loading spinner if the user data is not yet available
  if (!user) return <PulseLoader color={"#FFF"} />;

  // Render the EditUserForm component with the fetched user data
  const content = <EditUserForm user={user} />;

  // Return the form content for rendering
  return content;
};

export default EditUser;
