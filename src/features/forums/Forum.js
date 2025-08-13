import { useNavigate } from "react-router-dom";
import { useGetForumsQuery, useDeleteForumMutation } from "./forumsApiSlice";
import { memo, useState } from "react";
import moment from "moment";
import Modal from "../../components/Modal";
/**
 * Table row component for a single forum.
 * Handles navigation, edit, and delete actions.
 */
const Forum = ({ forumId, showSettingsMenu }) => {
  const navigate = useNavigate();
  const [deleteForum] = useDeleteForumMutation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [forumToDelete, setForumToDelete] = useState(null);

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
    const handleDelete = async (forumId) => {
    setForumToDelete(forumId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    await deleteForum({ forumId: forumToDelete });
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

    // Render forum table row
    return (
      <tr className="table__row" onClick={showDeleteConfirm ? (e) => e.preventDefault() : handleRowClick}>
        <td className="table__cell">{forum.title}</td>
        <td className="table__cell">{forum.username}</td>
        <td className="table__cell table__created">{created}</td>
        <td className="table__cell table__updated">{updated}</td>
        {showSettingsMenu && (
          <td
            className="table__cell"
            onClick={(e) => e.stopPropagation()}>
            <button
              className="button"
              onClick={handleEdit}>
              Edit
            </button>
            <button 
              className="button delete-button"
              onClick={handleDelete}>
              Delete
            </button>
          </td>
        )}
        {showDeleteConfirm && (
         <Modal
          isOpen={showDeleteConfirm}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          message="Are you sure you want to delete this reply?"
          confirmText="Yes, delete"
          cancelText="Cancel"
        />
      )}
      </tr>
      
    );
  } else return null;
};

const memoizedForum = memo(Forum);

export default memoizedForum;
