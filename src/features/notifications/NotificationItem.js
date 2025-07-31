import moment from 'moment';

const NotificationItem = ({ notification }) => (
  <>
    {notification.type === 'reply' && (
      <>
        <p>
          <span className="username">{notification.username}</span> replied to your forum: <span className="forum-title">{notification.forumTitle}</span>
        </p>
        <p>
          <span className="reply-text">"{notification.replyText}"</span>
        </p>
      </>
    )}
    {notification.type === 'like-forum' && (
      <p>
        <span className="username">{notification.username}</span> liked your forum: <span className="forum-title">{notification.forumTitle}</span>
      </p>
    )}
    {notification.type === 'like-reply' && (
      <p>
        <span className="username">{notification.username}</span> liked your reply: <span className="reply-text">"{notification.replyText}"</span>
        {notification.forumTitle && <span> on <span className="forum-title">{notification.forumTitle}</span></span>}
      </p>
    )}
    {notification.type === 'tag' && (
      <>
        <p>
          <span className="username">{notification.username}</span> mentioned you in a reply on <span className="forum-title">{notification.forumTitle}</span>
        </p>
        <p>
          <span className="reply-text">"{notification.replyText}"</span>
        </p>
      </>
    )}
    <p className="all-notifications__timestamp">
      <span className="timestamp">{moment(notification.createdAt).fromNow()}</span>
    </p>
  </>
);

export default NotificationItem; 