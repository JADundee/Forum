import {
  useGetNotificationsQuery,
  useGetForumsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from "../forums/forumsApiSlice";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import NotificationItem from "./NotificationItem";

/**
 * Component to display a list of all notifications.
 * Handles marking notifications as read, deleting, and navigation.
 */
const NotificationsList = () => {
  const navigate = useNavigate();

  const {
    data: notificationsData,
    isLoading,
    isError,
  } = useGetNotificationsQuery();
  const { isLoading: forumsLoading, isError: forumsError } =
    useGetForumsQuery();
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  // Handles clicking a notification: marks as read and navigates to forum.
  const handleNotificationClicked = useCallback(
    async (notification) => {
      await markNotificationRead(notification.id);
      navigate(`/dash/forums/${notification.forumId}/expand`);
    },
    [markNotificationRead, navigate]
  );

  // Handles deleting a notification.
  const handleDeleteNotification = useCallback(
    async (e, notificationId) => {
      e.stopPropagation();
      await deleteNotification(notificationId);
    },
    [deleteNotification]
  );

  if (isLoading || forumsLoading) {
    return <p>Loading...</p>;
  }

  if (isError || forumsError) {
    return <p>Error fetching notifications or forums</p>;
  }

  const notifications = notificationsData || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handles marking all notifications as read.
  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await markAllNotificationsRead();
    }
  };

  // Renders the notifications list content.
  const content = (
    <div className="all-notifications">
      {/* Header section for notifications list */}
      <div className="all-notifications__header">
        <h1>All Notifications</h1>
        <button
          className="button mark-all-read-btn"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || isMarkingAll}>
          Mark all as read
        </button>
      </div>

      {/* List of notifications */}
      <ul className="all-notifications__content">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`all-notifications__item ${
              notification.read ? "notification-read" : ""
            }`}
            onClick={() => handleNotificationClicked(notification)}>
            <div>
              {/* Render individual notification item */}
              <NotificationItem notification={notification} />
            </div>

            {/* Button to delete notification */}
            <button
              className="button delete-button"
              onClick={(e) => handleDeleteNotification(e, notification.id)}
              disabled={isDeleting}
              title="Delete notification">
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return content;
};

export default NotificationsList;
