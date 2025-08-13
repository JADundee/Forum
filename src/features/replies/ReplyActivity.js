import { useState } from "react";
import DataTable from "../../components/DataTable";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import useSort from "../../hooks/useSort";
import filterAndSort from "../../hooks/useSearch";
import Modal from "../../components/Modal";
import {
  useGetRepliesByUserQuery,
  useDeleteReplyMutation,
} from "../forums/forumsApiSlice";

const ReplyActivity = ({ userId, show }) => {
  const {
    data: userReplies = { ids: [], entities: {} },
    isLoading: repliesLoading,
    isError: repliesError,
    refetch,
  } = useGetRepliesByUserQuery(userId, { skip: !userId });

  const [search, setSearch] = useState("");
  const { sortConfig, handleSort } = useSort("createdAt", "desc");
  const navigate = useNavigate();
  const [deleteReply] = useDeleteReplyMutation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState(null);

  const sortedAndFilteredReplies = filterAndSort.runRepliesById(
    userReplies?.ids || [],
    userReplies?.entities || {},
    search,
    sortConfig
  );

  const repliesColumns = [
    { key: "forumTitle", label: "Forum Title", sortable: true },
    { key: "text", label: "Reply", sortable: true },
    { key: "createdAt", label: "Date", sortable: true },
    { key: "settings", label: "Settings" },
  ];

  if (!show) return null;

  const handleDelete = async (replyId) => {
    setReplyToDelete(replyId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    await deleteReply({ replyId: replyToDelete });
    refetch();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleEdit = (reply) => {
    navigate(`/dash/forums/${reply.forum._id}/expand`, {
      state: { replyId: reply._id, editReply: true },
    });
  };

  return (
    <>
      <div className="all-notifications__header">
        <h1>My Replies</h1>
      </div>
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by forum title or reply text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {repliesLoading && <p>Loading...</p>}
      {repliesError && <p className="errmsg">{repliesError}</p>}
      {!repliesLoading && !repliesError && (
        <DataTable
          columns={repliesColumns}
          /* Handles the deletion of a reply */
          data={sortedAndFilteredReplies}
          emptyMsg="No replies found"
          renderRow={(replyId) => {
            const reply = userReplies.entities[replyId];
            return (
              /* Handles the editing of a reply. */
              <tr
                key={reply._id}
                className="table__row"
                onClick={() =>
                  navigate(`/dash/forums/${reply.forum._id}/expand`, {
                    state: { replyId: reply._id },
                  })
                }>
                <td className="table__cell">{reply.forumTitle}</td>
                <td className="table__cell">{reply.text}</td>
                <td className="table__cell">
                  {moment(reply.createdAt).format("MMMM D, YYYY h:mm A")}
                </td>
                <td
                  className="table__cell"
                  onClick={(e) => e.stopPropagation()}>
                  <button
                    className="button profile-activity-menu-button"
                    onClick={() => handleEdit(reply)}>
                    Edit
                  </button>
                  <button
                    className="button delete-button profile-activity-menu-button"
                    onClick={() => {
                      handleDelete(reply._id);
                    }}>
                    Delete
                  </button>
                </td>
              </tr>
            );
          }}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
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
    </>
  );
};

export default ReplyActivity;
