import { useGetNotificationsQuery, useGetNotesQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '../notes/notesApiSlice';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const AllNotifications = () => {

  const navigate = useNavigate()

  const { data: notificationsData, isLoading, isError } = useGetNotificationsQuery();
  const { data: notesData, isLoading: notesLoading } = useGetNotesQuery();
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  if (isLoading || notesLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Error fetching notifications</p>;
  }

  const notes = notesData.entities;
  const notifications = notificationsData || [];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClicked = async (notification) => {
    await markNotificationRead(notification.id);
    navigate(`/dash/notes/${notification.noteId}/expand`, { state: { replyId: notification.replyId } });
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await markAllNotificationsRead();
    }
  };

  return (
    <div className="all-notifications">
      <div className="all-notifications__header">
        <h1>All Notifications</h1>
        <button
          className="button mark-all-read-btn"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || isMarkingAll}
        >
          Mark all as read
        </button>
      </div>
      <div className="all-notifications__content">
        <ul className="all-notifications__list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`all-notifications__item ${notification.read ? 'notification-read' : 'notification-unread'}`}
              onClick={() => {
                handleNotificationClicked(notification);
              }}
            >
              <p className="all-notifications__text">
                <span className="username">{notification.username}</span> replied to: {' '}
                <span className="note-title">
                  {notes[notification.noteId] && notes[notification.noteId].title}
                </span>
              </p>
              <p className="all-notifications__text">
                <span className="reply-text">"{notification.replyText}"</span>
              </p>
              <p className="all-notifications__timestamp">
                <span className="timestamp">{moment(notification.createdAt).fromNow()}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AllNotifications;