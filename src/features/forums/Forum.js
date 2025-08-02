import { useNavigate } from "react-router-dom";
import { useGetForumsQuery, useDeleteForumMutation } from "./forumsApiSlice";
import { memo } from "react";
import moment from "moment";
import MenuButton from "../../components/MenuButton";

/**
 * Table row component for a single forum.
 * Handles navigation, edit, and delete actions.
 */
const Forum = ({ forumId, showSettingsMenu }) => {
  const navigate = useNavigate();
  const [deleteForum] = useDeleteForumMutation();

  const { forum } = useGetForumsQuery("forumsList", {
    selectFromResult: ({ data }) => ({
      forum: data?.entities[forumId],
    }),
  });

  if (forum) {
    // Format created and updated dates
    const created = moment(forum.createdAt).format("MMMM D, YYYY h:mm A");
    const updated = moment(forum.updatedAt).format("MMMM D, YYYY h:mm A");

    // Handles row click to expand forum details.
    const handleRowClick = () => navigate(`/dash/forums/${forumId}/expand`);
    // Handles edit button click to edit forum.
    const handleEdit = () => navigate(`/dash/forums/${forumId}/edit`);
    // Handles delete button click to delete forum.
    const handleDelete = async () => {
      await deleteForum({ id: forumId });
    };

    // Render forum table row
    return (
      <tr className="table__row" onClick={handleRowClick}>
        <td className="table__cell">{forum.title}</td>
        <td className="table__cell">{forum.username}</td>
        <td className="table__cell">{created}</td>
        <td className="table__cell">{updated}</td>
        {showSettingsMenu && (
          <td
            className="table__cell"
            style={{ position: "relative" }}
            onClick={(e) => e.stopPropagation()}>
            <MenuButton
              onEdit={handleEdit}
              onDelete={handleDelete}
              variant="profile-activity-menu-button"
            />
          </td>
        )}
      </tr>
    );
  } else return null;
};

const memoizedForum = memo(Forum);

export default memoizedForum;
