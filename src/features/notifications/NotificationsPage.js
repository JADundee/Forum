// NotificationsPage.js
import {
  useGetNotificationsQuery,
  useGetForumsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from "../forums/forumsApiSlice";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import NotificationsList from "./NotificationsList";

const NotificationsPage = () => {
  const navigate = useNavigate();

  const {
    data: notificationsData,
    isLoading,
    isError,
  } = useGetNotificationsQuery();
  const { isLoading: forumsLoading, isError: forumsError } =
    useGetForumsQuery();

  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const handleNotificationClicked = useCallback(
    async (notification) => {
      await markNotificationRead(notification.id);
      navigate(`/dash/forums/${notification.forumId}/expand`);
    },
    [markNotificationRead, navigate]
  );

  const handleDeleteNotification = useCallback(
    async (id) => {
      await deleteNotification(id);
    },
    [deleteNotification]
  );

  if (isLoading || forumsLoading) return <p>Loading...</p>;
  if (isError || forumsError) return <p>Error fetching notifications</p>;

  const notifications = notificationsData || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await markAllNotificationsRead();
    }
  };

  return (
    <NotificationsList
      notifications={notifications}
      onNotificationClicked={handleNotificationClicked}
      onDeleteNotification={handleDeleteNotification}
      showDelete
      unreadCount={unreadCount}
      isMarkingAll={isMarkingAll}
      onMarkAllAsRead={handleMarkAllAsRead}
    />
  );
};

export default NotificationsPage;
