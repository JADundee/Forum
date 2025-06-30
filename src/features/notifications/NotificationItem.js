import React from 'react';
import moment from 'moment';

const NotificationItem = ({ notification, noteTitle, onClick, onDelete, isDeleting }) => (
  <li
    className={`all-notifications__item ${notification.read ? 'notification-read' : 'notification-unread'}`}
    onClick={onClick}
  >
    <p className="all-notifications__text">
      <span className="username">{notification.username}</span> replied to: {' '}
      <span className="note-title">{noteTitle}</span>
    </p>
    <p className="all-notifications__text">
      <span className="reply-text">"{notification.replyText}"</span>
    </p>
    <p className="all-notifications__timestamp">
      <span className="timestamp">{moment(notification.createdAt).fromNow()}</span>
    </p>
    <button
      className="button delete-button"
      style={{ marginLeft: '10px' }}
      onClick={onDelete}
      disabled={isDeleting}
      title="Delete notification"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  </li>
);

export default NotificationItem; 