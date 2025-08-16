import { useState, useEffect, useRef } from "react";
import EditReplyForm from "./EditReplyForm";
import MenuButton from "../../components/MenuButton";
import moment from "moment";
import {
  useToggleLikeMutation,
  useGetLikeCountQuery,
  useGetUserLikeQuery,
} from "../forums/forumsApiSlice";

// Helper: Wrap @username mentions in a <span> for styling
function highlightTags(text) {
  return text.split(/(@\w+)/g).map((part, i) => {
    if (/^@\w+$/.test(part)) {
      return (
        <span key={i} className="reply__tagged-username">
          {part}
        </span>
      );
    }
    return part;
  });
}

// Helper: Format timestamps consistently
function formatTimestamp(timestamp) {
  return moment(timestamp).format("MMMM D, YYYY h:mm A");
}

const Reply = ({
  reply,        // Reply object
  username,     // Username of author
  userId,       // User ID of author
  modalRef,     // Ref to modal for delete confirmation
  refProp,      // Optional external ref for scrolling/focus
  highlight,    // Whether to visually highlight this reply
  isEditing,    // Whether reply is currently being edited
  editText,     // Current edit text value
  setEditText,  // Setter for edit text
  onEditClick,  // Callback for "Edit" action
  onEditCancel, // Callback for canceling edit
  onEditSave,   // Callback for saving edit
  editLoading,  // Whether edit save is in progress
}) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [toggleLike] = useToggleLikeMutation();
  const [likeLoading, setLikeLoading] = useState(false);
  const localRef = useRef(null); // local fallback ref if none passed

  const replyRef = refProp || localRef;

  // Get like count for this reply
  const { data: likeCountData, refetch: refetchLikeCount } =
    useGetLikeCountQuery({ targetId: reply._id, targetType: "reply" });

  // Get whether the current user has liked this reply
  const { data: userLikeData, refetch: refetchUserLike } = useGetUserLikeQuery({
    targetId: reply._id,
    targetType: "reply",
  });

  // Handle like/unlike click
  const handleLike = async () => {
    setLikeLoading(true);
    try {
      await toggleLike({ targetId: reply._id, targetType: "reply" }).unwrap();
      refetchLikeCount();
      refetchUserLike();
    } finally {
      setLikeLoading(false);
    }
  };

  const hasLiked = userLikeData?.liked;
  const likeCount = likeCountData?.count || 0;

  // Highlight + scroll + focus effect
  useEffect(() => {
    if (highlight) {
      setIsHighlighted(true);
      if (replyRef.current) {
        replyRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        replyRef.current.focus({ preventScroll: true });
      }
      const timeout = setTimeout(() => setIsHighlighted(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [highlight, replyRef]);

  // Check if reply was edited (different timestamps)
  const wasEdited = reply.updatedAt && reply.updatedAt !== reply.createdAt;

  return (
    <div
      className={`reply${isHighlighted ? " reply--highlight" : ""}`}
      ref={replyRef}
      tabIndex={-1} // allows programmatic focus
    >
      {/* Header with username and edit/delete menu */}
      <div className="reply__header">
        <span className="username">
          {username}
          <span className="username-text"> Replied:</span>
        </span>
        {userId === reply.user && !isEditing && (
          <MenuButton
            onEdit={onEditClick}
            onDeleteClick={() => modalRef.current.open(reply._id)}
          />
        )}
      </div>

      {/* Reply content — either edit form or text with tagged mentions */}
      <div className="reply__content">
        {isEditing ? (
          <EditReplyForm
            initialText={reply.text}
            onSave={onEditSave}
            onCancel={onEditCancel}
            loading={editLoading}
          />
        ) : (
          <p>{highlightTags(reply.text)}</p>
        )}
      </div>

      {/* Like button + like count */}
      <div className="like-button-container">
        <button
          className={`like-button${hasLiked ? " liked" : ""}`}
          onClick={handleLike}
          disabled={likeLoading}
          aria-pressed={hasLiked}
          title={`${likeCount} like${likeCount !== 1 ? "s" : ""}`}>
          {hasLiked ? "♥" : "♡"}
        </button>
        <span className="like-count">
          {likeCount} like{likeCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Timestamps (created + optional edited) */}
      <span className="timestamp">
        Replied on {formatTimestamp(reply.createdAt)}
        {wasEdited && (
          <span> (edited on {formatTimestamp(reply.updatedAt)})</span>
        )}
      </span>
    </div>
  );
};

export default Reply;
