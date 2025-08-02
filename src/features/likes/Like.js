import moment from "moment";

/**
 * Component to display a like item for a forum or reply.
 * Handles click events and displays like details.
 */
const LikeItem = ({ like, type, onClick }) => {
  // Render like item for a forum
  if (type === "forum") {
    return (
      <div className="like-item-clickable" onClick={onClick}>
        <p className="all-notifications__text">
          You liked the forum: <span className="forum-title">{like.title}</span>
          {like.user?.username && (
            <span>
              {" "}
              by <span className="username">{like.user.username}</span>
            </span>
          )}
        </p>
        <p className="all-notifications__timestamp">
          <span className="timestamp">{moment(like.createdAt).fromNow()}</span>
        </p>
      </div>
    );
  }
  // Render like item for a reply
  if (type === "reply") {
    return (
      <div
        className="like-item-clickable"
        onClick={onClick}
      >
        <p className="all-notifications__text">
          You liked a reply: <span className="reply-text">"{like.text}"</span>
          {like.user?.username && (
            <span>
              {" "}
              by <span className="username">{like.user.username}</span>
            </span>
          )}
          {like.forum?.title && (
            <span>
              {" "}
              on <span className="forum-title">{like.forum.title}</span>
            </span>
          )}
        </p>
        <p className="all-notifications__timestamp">
          <span className="timestamp">{moment(like.createdAt).fromNow()}</span>
        </p>
      </div>
    );
  }
  // Return null if type is not recognized
  return null;
};

export default LikeItem;
