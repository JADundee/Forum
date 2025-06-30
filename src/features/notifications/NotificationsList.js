import { useGetNotificationsQuery, useGetNotesQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation, useDeleteNotificationMutation } from '../notes/notesApiSlice';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import React, { useCallback } from 'react';
import NotificationItem from './NotificationItem';

const NotificationsList = () => {
  const navigate = useNavigate();

  const { data: notificationsData, isLoading, isError, error } = useGetNotificationsQuery();
  const { data: notesData, isLoading: notesLoading, isError: notesError, error: notesErrObj } = useGetNotesQuery();
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

  const handleNotificationClicked = useCallback(async (notification) => {
    await markNotificationRead(notification.id);
    navigate(`/dash/notes/${notification.noteId}/expand`, { state: { replyId: notification.replyId } });
  }, [markNotificationRead, navigate]);

  const handleDeleteNotification = useCallback(async (e, notificationId) => {
    e.stopPropagation(); // Prevent navigation when deleting
    await deleteNotification(notificationId);
  }, [deleteNotification]);

  if (isLoading || notesLoading) {
    return <p>Loading...</p>;
  }

  if (isError || notesError) {
    return <p>Error fetching notifications or notes</p>;
  }

  const notes = notesData?.entities || {};
  const notifications = notificationsData || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await markAllNotificationsRead();
    }
  };

  const content = (
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
            <NotificationItem
              key={notification.id}
              notification={notification}
              noteTitle={notes[notification.noteId]?.title || ''}
              onClick={() => handleNotificationClicked(notification)}
              onDelete={e => handleDeleteNotification(e, notification.id)}
              isDeleting={isDeleting}
            />
          ))}
        </ul>
      </div>
    </div>
  );

  return content;
};

export default NotificationsList;