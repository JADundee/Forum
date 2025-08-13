import { useGetUsersQuery } from "../users/usersApiSlice";
import {
  useDeleteReplyMutation,
  useEditReplyMutation,
} from "../forums/forumsApiSlice";
import useAuth from "../../hooks/useAuth";
import Reply from "./Reply";

import { useEffect, useRef, useState, useCallback } from "react";


/**
 * Component to display a list of replies for a forum post.
 * Handles rendering, editing, and deleting replies.
 */
const RepliesList = ({
  replies,
  refetchReplies,
  highlightReplyId,
  editReplyId,
}) => {
  // Fetch all users for username lookup
  const { data: users } = useGetUsersQuery("usersList");
  // RTK Query mutation for deleting a reply
  const [deleteReply] = useDeleteReplyMutation();
  // RTK Query mutation for editing a reply
  const [editReply, { isLoading: editLoading }] = useEditReplyMutation();
  // Get current user's ID
  const { userId } = useAuth();
  // State for which reply is being edited
  const [editingReplyId, setEditingReplyId] = useState(null);
  // State for the text of the reply being edited
  const [editText, setEditText] = useState("");

  // Ref for scrolling to the last reply
  const lastReplyRef = useRef(null);

  // Handler: delete a reply and refetch replies
  const handleDeleteReply = useCallback(
    async (replyId) => {
      await deleteReply({ replyId });
      refetchReplies();
    },
    [deleteReply, refetchReplies]
  );

  // Handler: start editing a reply
  const handleEditClick = (reply) => {
    setEditingReplyId(reply._id);
    setEditText(reply.text);
  };

  // Handler: cancel editing a reply
  const handleEditCancel = () => {
    setEditingReplyId(null);
    setEditText("");
  };

  // Handler: save the edited reply
  const handleEditSave = async (replyId, newText) => {
    await editReply({ replyId, replyText: newText });
    setEditingReplyId(null);
    setEditText("");
    refetchReplies();
  };

  useEffect(() => {
    if (highlightReplyId && lastReplyRef.current) {
      lastReplyRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightReplyId, replies]);

  useEffect(() => {
    if (editReplyId) {
      setEditingReplyId(editReplyId);
    }
  }, [editReplyId]);

  if (!Array.isArray(replies)) {
    return <p>No replies found</p>;
  }

  // Main content for the replies list, rendering each reply with highlight and edit mode support
  return (
    <div className="replies-list">
      {replies.map((reply) => (
        <Reply
          key={reply._id}
          reply={reply}
          username={users?.entities[reply.user]?.username}
          userId={userId}
          handleDeleteReply={handleDeleteReply}
          refProp={reply._id === highlightReplyId ? lastReplyRef : null}
          highlight={reply._id === highlightReplyId}
          isEditing={editingReplyId === reply._id}
          editText={editText}
          setEditText={setEditText}
          onEditClick={() => handleEditClick(reply)}
          onEditCancel={handleEditCancel}
          onEditSave={(newText) => handleEditSave(reply._id, newText)}
          editLoading={editLoading}
        />
      ))}
    </div>
  );
};

export default RepliesList;
