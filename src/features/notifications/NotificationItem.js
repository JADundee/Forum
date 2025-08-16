import moment from "moment";

/**
 * Component to display a single notification item.
 * Renders different notification types with details and timestamp.
 */
const NotificationItem = ({ notification }) => (
  <>
    {/* Render reply notification */}
    {notification.type === "reply" && (
      <>
        <p>
          <span className="username">{notification.username}</span> replied to
          your forum:{" "}
          <span className="forum-title">{notification.forumTitle}</span>
        </p>
        <p>
          <span className="reply-text">"{notification.replyText}"</span>
        </p>
      </>
    )}
    {/* Render like-forum notification */}
    {notification.type === "like-forum" && (
      <p>
        <span className="username">{notification.username}</span> liked your
        forum: <span className="forum-title">{notification.forumTitle}</span>
      </p>
    )}
    {/* Render like-reply notification */}
    {notification.type === "like-reply" && (
      <p>
        <span className="username">{notification.username}</span> liked your
        reply: <span className="reply-text">"{notification.replyText}"</span>
        {notification.forumTitle && (
          <span>
            {" "}
            on <span className="forum-title">{notification.forumTitle}</span>
          </span>
        )}
      </p>
    )}
    {/* Render tag notification */}
    {notification.type === "tag" && (
      <>
        <p>
          <span className="username">{notification.username}</span> mentioned
          you in a reply on{" "}
          <span className="forum-title">{notification.forumTitle}</span>
        </p>
        <p>
          <span className="reply-text">"{notification.replyText}"</span>
        </p>
      </>
    )}
    {/* Render notification timestamp */}
    <p className="notifications__timestamp">
      <span className="timestamp">
        {moment(notification.createdAt).fromNow()}
      </span>
    </p>
  </>
);

export default NotificationItem;
