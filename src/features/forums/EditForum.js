import { useParams } from "react-router-dom";
import EditForumForm from "./EditForumForm";
import { useGetForumsQuery } from "./forumsApiSlice";
import { useGetUsersQuery } from "../users/usersApiSlice";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";

/**
 * Page for editing an existing forum.
 * Fetches forum and users, checks access, and renders EditForumForm.
 */
const EditForum = () => {
  useTitle("techForums: Edit Forum");

  const { id } = useParams();

  const { username, isAdmin } = useAuth();

  const { forum } = useGetForumsQuery("forumsList", {
    selectFromResult: ({ data }) => ({
      forum: data?.entities[id],
    }),
  });

  const { users } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      users: data?.ids.map((id) => data?.entities[id]),
    }),
  });

  // Show loading spinner if forum or users are not loaded
  if (!forum || !users?.length) return <PulseLoader color={"#FFF"} />;

  // Check access: only admin or forum owner can edit
  if (!isAdmin) {
    if (forum.username !== username) {
      return <p className="errmsg">No access</p>;
    }
  }

  // Render the edit forum form
  const content = <EditForumForm forum={forum} users={users} />;

  return content;
};
export default EditForum;
