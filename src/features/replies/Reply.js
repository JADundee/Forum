import { useState, useEffect } from "react";
import EditReplyForm from "./EditReplyForm";
import MenuButton from "../../components/MenuButton";
import moment from "moment";
import {
    useToggleLikeMutation,
    useGetLikeCountQuery,
    useGetUserLikeQuery
} from "../forums/forumsApiSlice";

function highlightTags(text) {
  return text.split(/(@\w+)/g).map((part, i) => {
    if (/^@\w+$/.test(part)) {
      return (
        <span key={i} className="tagged-username">
          {part}
        </span>
      );
    }
    return part;
  });
}

function formatTimestamp(timestamp) {
  return moment(timestamp).format("MMMM D, YYYY h:mm A");
}

const Reply = ({
  reply,
  username,
  userId,
  handleDeleteReply,
  refProp,
  highlight,
  isEditing,
  editText,
  setEditText,
  onEditClick,
  onEditCancel,
  onEditSave,
  editLoading,
}) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [toggleLike] = useToggleLikeMutation();
  const { data: likeCountData, refetch: refetchLikeCount } =
    useGetLikeCountQuery({ targetId: reply._id, targetType: "reply" });
  const { data: userLikeData, refetch: refetchUserLike } = useGetUserLikeQuery({
    targetId: reply._id,
    targetType: "reply",
  });
  const [likeLoading, setLikeLoading] = useState(false);
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
  useEffect(() => {
    if (highlight) {
      setIsHighlighted(true);
      const timeout = setTimeout(() => setIsHighlighted(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [highlight]);
  const wasEdited = reply.updatedAt && reply.updatedAt !== reply.createdAt;
  return (
    <div
      className={`reply${isHighlighted ? " reply--highlight" : ""}`}
      ref={refProp}>
      <div className="reply-header">
        <span className="username">
          {username}
          <span className="username-text"> Replied:</span>
        </span>
        {userId === reply.user && !isEditing && (
          <MenuButton
            onEdit={onEditClick}
            onDelete={() => handleDeleteReply(reply._id)}
          />
        )}
      </div>
      <div className="reply-content">
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