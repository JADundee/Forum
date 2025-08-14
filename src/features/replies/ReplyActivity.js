import { useState, useRef } from "react";
import DataTable from "../../components/DataTable";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import useSort from "../../hooks/useSort";
import filterAndSort from "../../hooks/useSearch";
import Modal from "../../components/Modal";
import MenuButton from "../../components/MenuButton";
import {
  useGetRepliesByUserQuery,
  useDeleteReplyMutation,
} from "../forums/forumsApiSlice";

const ReplyActivity = ({ userId, show }) => {
  // Fetch replies for a specific user
  const {
    data: userReplies = { ids: [], entities: {} },
    isLoading,
    isError,
    refetch,
  } = useGetRepliesByUserQuery(userId, { skip: !userId });

  const [search, setSearch] = useState(""); // Search query string
  const { sortConfig, handleSort } = useSort("createdAt", "desc"); // Sorting state
  const navigate = useNavigate();
  const modalRef = useRef(); // Ref for modal control
  const [deleteReply] = useDeleteReplyMutation();

  // Apply search & sort to replies list
  const sortedAndFilteredReplies = filterAndSort.runRepliesById(
    userReplies.ids || [],
    userReplies.entities || {},
    search,
    sortConfig
  );

  // Table column definitions
  const columns = [
    { key: "forumTitle", label: "Forum Title", sortable: true },
    { key: "text", label: "Reply", sortable: true },
    { key: "createdAt", label: "Date", sortable: true },
    { key: "settings", label: "Settings" },
  ];

  if (!show) return null;

  // Navigate to forum/reply edit mode
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

      {/* Search bar */}
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by forum title or reply text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading & error states */}
      {isLoading && <p>Loading...</p>}
      {isError && <p className="errmsg">{isError}</p>}

      {/* Replies table */}
      {!isLoading && !isError && (
        <DataTable
          columns={columns}
          data={sortedAndFilteredReplies}
          emptyMsg="No replies found"
          renderRow={(replyId) => {
            const reply = userReplies.entities[replyId];
            return (
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

                {/* Stop click from triggering row navigation for menu buttons */}
                <td
                  className="table__cell"
                  onClick={(e) => e.stopPropagation()}>
                  <MenuButton
                    onEdit={() => handleEdit(reply)}
                    onDeleteClick={() => modalRef.current.open(reply._id)}
                  />
                </td>
              </tr>
            );
          }}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      )}

      {/* Shared delete confirmation modal for all replies */}
      <Modal
        ref={modalRef}
        message="Are you sure you want to delete this reply?"
        deleteAction={(id) => deleteReply({ replyId: id })}
        afterDelete={refetch}
      />
    </>
  );
};

export default ReplyActivity;
