import NewForumForm from "./NewForumForm";
import { useGetUsersQuery } from "../users/usersApiSlice";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";

/**
 * Page for creating a new forum.
 * Fetches users and renders the NewForumForm.
 */
const NewForum = () => {
  useTitle("techforums: New forum");

  const { users } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      users: data?.ids.map((id) => data?.entities[id]),
    }),
  });

  // Show loading spinner if users are not loaded
  if (!users?.length) return <PulseLoader color={"#FFF"} />;

  // Render the new forum form
  const content = <NewForumForm users={users} />;

  return content;
};
export default NewForum;
