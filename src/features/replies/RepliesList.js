import { useRef, useState } from "react";
import Reply from "./Reply";
import Modal from "../../components/Modal";
import {
  useDeleteReplyMutation,
  useEditReplyMutation,
} from "../forums/forumsApiSlice";

const RepliesList = ({ replies, refetchReplies, highlightReplyId, editReplyId }) => {
  const modalRef = useRef();
  const [deleteReply] = useDeleteReplyMutation();
  const [updateReply, { isLoading: editLoading }] = useEditReplyMutation();

  // Track which reply is being edited
  const [currentEditId, setCurrentEditId] = useState(editReplyId || null);

  const handleEditClick = (id) => setCurrentEditId(id);
  const handleEditCancel = () => setCurrentEditId(null);

  const handleEditSave = async (id, newText) => {
    if (!newText.trim()) return; // avoid empty save
    try {
      await updateReply({ replyId: id, text: newText }).unwrap();
      setCurrentEditId(null);
      refetchReplies();
    } catch (err) {
      console.error("Failed to update reply:", err);
    }
  };

  const safeReplies = Array.isArray(replies) ? replies : replies?.replies || [];

  return (
    <>
      {safeReplies.map((reply) => (
        <Reply
          key={reply._id}
          reply={reply}
          username={reply.username}
          userId={reply.user}
          modalRef={modalRef}
          highlight={reply._id === highlightReplyId}
          isEditing={reply._id === currentEditId}
          onEditClick={() => handleEditClick(reply._id)}
          onEditCancel={handleEditCancel}
          onEditSave={(newText) => handleEditSave(reply._id, newText)}
          editLoading={editLoading}
        />
      ))}

      <Modal
        ref={modalRef}
        message="Are you sure you want to delete this reply?"
        deleteAction={(id) => deleteReply({ replyId: id })}
        afterDelete={refetchReplies}
      />
    </>
  );
};

export default RepliesList;
